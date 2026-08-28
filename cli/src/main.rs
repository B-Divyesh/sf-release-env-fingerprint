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

#[derive(Parser)]
#[command(
    name = "refp",
    version,
    about = "Prove release environment shape without recording values"
)]
#[command(
    long_about = "Capture and compare signed environment fingerprints without persisting raw values.\n\nValues are read only from the explicit command after `--`. Secret values become name/type/presence records; only policy-allowlisted non-secrets receive keyed hashes."
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
        Commands::Init(args) => init(args, cli.json),
        Commands::Capture(args) => capture(args, cli.json),
        Commands::Compare(args) => compare_command(args, cli.json),
    }
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
        let _ = fs::remove_file(&args.key);
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
