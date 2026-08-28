use clap::{Args, Parser, Subcommand};
use release_env_fingerprint::{
    compare, create_fingerprint, default_policy, encode_key, generate_key, load_key,
    parse_environment, parse_policy, verify_fingerprint, write_private, CompareReport, Fingerprint,
};
use serde::Serialize;
use serde_json::json;
use std::fs;
use std::path::PathBuf;
use std::process::{Command, ExitCode};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Parser)]
#[command(
    name = "refp",
    version,
    about = "Compare release configuration without recording raw values"
)]
#[command(
    long_about = "Capture and compare signed environment fingerprints without recording raw values.\n\nValues come from the command after `--`. Fingerprints contain variable names and types. Only values marked non-secret receive keyed hashes."
)]
struct Cli {
    /// Emit stable JSON output for scripts
    #[arg(long, global = true)]
    json: bool,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run an isolated comparison using the bundled sample files
    Demo,
    /// Create a project signing key and starter policy
    Init(InitArgs),
    /// Run an approved command and write a signed fingerprint
    Capture(CaptureArgs),
    /// Verify and compare a candidate against a baseline
    Compare(CompareArgs),
}

#[derive(Args)]
struct InitArgs {
    /// Project key path (store this as a CI secret)
    #[arg(long, default_value = ".refp-key")]
    key: PathBuf,
    /// Policy path to create
    #[arg(long, default_value = "refp.toml")]
    policy: PathBuf,
    /// Replace existing key and policy
    #[arg(long)]
    force: bool,
}

#[derive(Args)]
struct CaptureArgs {
    /// Label for this execution context, for example staging
    #[arg(long)]
    environment: String,
    /// Project signing key created by `refp init`
    #[arg(long, default_value = ".refp-key")]
    key: PathBuf,
    /// Policy TOML file
    #[arg(long, default_value = "refp.toml")]
    policy: PathBuf,
    /// Signed fingerprint destination
    #[arg(long)]
    output: PathBuf,
    /// Approved command emitting NAME=VALUE records; use `-- env -0`
    #[arg(required = true, last = true, num_args = 1..)]
    command: Vec<String>,
}

#[derive(Args)]
struct CompareArgs {
    /// Project signing key used for both captures
    #[arg(long, default_value = ".refp-key")]
    key: PathBuf,
    /// Trusted signed fingerprint
    #[arg(long)]
    baseline: PathBuf,
    /// Candidate signed fingerprint
    candidate: PathBuf,
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    match run(&cli) {
        Ok(code) => ExitCode::from(code),
        Err(error) => {
            if cli.json {
                println!("{}", json!({ "ok": false, "error": error }));
            } else {
                eprintln!("error: {error}");
            }
            ExitCode::FAILURE
        }
    }
}

fn run(cli: &Cli) -> Result<u8, String> {
    match &cli.command {
        Commands::Demo => demo(cli.json),
        Commands::Init(args) => init(args, cli.json),
        Commands::Capture(args) => capture(args, cli.json),
        Commands::Compare(args) => compare_command(args, cli.json),
    }
}

/// Create a disposable sample workspace and run the same capture/compare code
/// used by a project.  This intentionally does not inspect the current
/// directory or any project configuration.
fn demo(json_output: bool) -> Result<u8, String> {
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("could not create demo timestamp: {error}"))?
        .as_nanos();
    let directory = std::env::temp_dir().join(format!("refp-demo-{}-{nonce}", std::process::id()));
    fs::create_dir_all(&directory).map_err(|error| {
        format!(
            "could not create demo directory {}: {error}",
            directory.display()
        )
    })?;

    let key_path = directory.join("demo.key");
    let policy_path = directory.join("refp.toml");
    let baseline_source = directory.join("baseline.env");
    let candidate_source = directory.join("candidate.env");
    let baseline = directory.join("baseline.refp.json");
    let candidate = directory.join("candidate.refp.json");

    write_private(
        &key_path,
        format!("{}\n", encode_key(&generate_key())).as_bytes(),
        false,
    )?;
    write_private(
        &policy_path,
        include_str!("../examples/refp.toml").as_bytes(),
        false,
    )?;
    write_private(
        &baseline_source,
        include_str!("../examples/baseline.env").as_bytes(),
        false,
    )?;
    write_private(
        &candidate_source,
        include_str!("../examples/candidate.env").as_bytes(),
        false,
    )?;

    let baseline_args = CaptureArgs {
        environment: "production".to_string(),
        key: key_path.clone(),
        policy: policy_path.clone(),
        output: baseline.clone(),
        command: vec!["cat".to_string(), baseline_source.display().to_string()],
    };
    let candidate_args = CaptureArgs {
        environment: "candidate".to_string(),
        key: key_path.clone(),
        policy: policy_path.clone(),
        output: candidate.clone(),
        command: vec!["cat".to_string(), candidate_source.display().to_string()],
    };
    // Use the normal capture implementation, then verify both files before comparing.
    let baseline_fingerprint = capture_to_file(&baseline_args)?;
    let candidate_fingerprint = capture_to_file(&candidate_args)?;
    let key = load_key(&key_path)?;
    verify_fingerprint(&baseline_fingerprint, &key)
        .map_err(|error| format!("baseline {}: {error}", baseline.display()))?;
    verify_fingerprint(&candidate_fingerprint, &key)
        .map_err(|error| format!("candidate {}: {error}", candidate.display()))?;
    let report = compare(&baseline_fingerprint, &candidate_fingerprint);
    let report_code = if report.drift { 2 } else { 0 };
    if json_output {
        print_json(
            &json!({"demo": true, "directory": directory, "exit_code": report_code, "report": report}),
        )?;
    } else {
        print_report(&report);
        println!("Demo files remain at {}", directory.display());
        println!("This sample is isolated from your project files.");
    }
    Ok(report_code)
}

fn init(args: &InitArgs, json_output: bool) -> Result<u8, String> {
    if !args.force && (args.key.exists() || args.policy.exists()) {
        return Err(
            "key or policy already exists; use --force only when rotating the project key"
                .to_string(),
        );
    }
    let key = encode_key(&generate_key());
    write_private(&args.key, format!("{key}\n").as_bytes(), args.force)?;
    if let Err(error) = write_private(&args.policy, default_policy().as_bytes(), args.force) {
        if !args.force {
            let _ = fs::remove_file(&args.key);
        }
        return Err(error);
    }
    if json_output {
        print_json(&json!({
            "ok": true,
            "key": args.key,
            "policy": args.policy,
            "next": "Store the key securely, edit the policy, then run refp capture -- env -0"
        }))?;
    } else {
        println!(
            "Created {} and {}",
            args.key.display(),
            args.policy.display()
        );
        println!("Next: store the key securely, edit the policy, then capture with `-- env -0`.");
    }
    Ok(0)
}

fn capture(args: &CaptureArgs, json_output: bool) -> Result<u8, String> {
    let fingerprint = capture_to_file(args)?;
    let violations = fingerprint.payload.violations.len();
    if json_output {
        print_json(&json!({
            "ok": violations == 0,
            "output": args.output,
            "environment": args.environment,
            "variables": fingerprint.payload.variables.len(),
            "violations": fingerprint.payload.violations,
            "values_persisted": 0
        }))?;
    } else {
        println!(
            "Captured {} variables for {} → {} (0 values persisted)",
            fingerprint.payload.variables.len(),
            args.environment,
            args.output.display()
        );
        for violation in &fingerprint.payload.violations {
            println!("! {}: {}", violation.rule, violation.message);
        }
    }
    Ok(if violations == 0 { 0 } else { 2 })
}

fn capture_to_file(args: &CaptureArgs) -> Result<Fingerprint, String> {
    if args.output.exists() {
        return Err(format!(
            "output {} already exists; choose a new path",
            args.output.display()
        ));
    }
    let key = load_key(&args.key)?;
    let policy_source = fs::read_to_string(&args.policy)
        .map_err(|error| format!("could not read policy {}: {error}", args.policy.display()))?;
    let policy = parse_policy(&policy_source)?;
    let output = Command::new(&args.command[0])
        .args(&args.command[1..])
        .output()
        .map_err(|error| {
            format!(
                "could not run approved command {:?}: {error}",
                args.command[0]
            )
        })?;
    if !output.status.success() {
        return Err(format!(
            "approved command exited with {}; stderr was suppressed because it may contain values",
            output
                .status
                .code()
                .map_or_else(|| "a signal".to_string(), |code| code.to_string())
        ));
    }
    let values = parse_environment(&output.stdout)?;
    let fingerprint =
        create_fingerprint(&args.environment, &values, &policy, &policy_source, &key)?;
    let serialized = serde_json::to_vec_pretty(&fingerprint)
        .map_err(|error| format!("could not serialize fingerprint: {error}"))?;
    write_private(&args.output, &serialized, false)?;
    Ok(fingerprint)
}

fn compare_command(args: &CompareArgs, json_output: bool) -> Result<u8, String> {
    let key = load_key(&args.key)?;
    let baseline = read_fingerprint(&args.baseline)?;
    let candidate = read_fingerprint(&args.candidate)?;
    verify_fingerprint(&baseline, &key)
        .map_err(|error| format!("baseline {}: {error}", args.baseline.display()))?;
    verify_fingerprint(&candidate, &key)
        .map_err(|error| format!("candidate {}: {error}", args.candidate.display()))?;
    let report = compare(&baseline, &candidate);
    if json_output {
        print_json(&report)?;
    } else {
        print_report(&report);
    }
    Ok(if report.drift { 2 } else { 0 })
}

fn read_fingerprint(path: &PathBuf) -> Result<Fingerprint, String> {
    let bytes = fs::read(path)
        .map_err(|error| format!("could not read fingerprint {}: {error}", path.display()))?;
    serde_json::from_slice(&bytes)
        .map_err(|error| format!("invalid fingerprint {}: {error}", path.display()))
}

fn print_report(report: &CompareReport) {
    println!("{} → {}", report.baseline, report.candidate);
    if !report.drift {
        println!("✓ MATCH · signatures valid · no drift");
        return;
    }
    println!("✕ DRIFT DETECTED");
    for name in &report.missing {
        println!("- missing    {name}");
    }
    for name in &report.extra {
        println!("+ extra      {name}");
    }
    for change in &report.type_changed {
        println!(
            "~ type       {} ({:?} → {:?})",
            change.name, change.baseline, change.candidate
        );
    }
    for name in &report.resolved_changed {
        println!("~ resolved   {name} (allowlisted non-secret hash changed)");
    }
    if report.policy_changed {
        println!("~ policy     policy digest changed");
    }
    for violation in &report.violations {
        println!("! policy     {}", violation.message);
    }
}

fn print_json<T: Serialize>(value: &T) -> Result<(), String> {
    println!(
        "{}",
        serde_json::to_string_pretty(value)
            .map_err(|error| format!("could not write JSON: {error}"))?
    );
    Ok(())
}
