use serde_json::Value;
use std::fs;
use std::process::Command;

#[test]
fn documented_capture_and_compare_flow_detects_drift_and_never_writes_values() {
    let directory = tempfile::tempdir().unwrap();
    let key = directory.path().join("project.key");
    let policy = directory.path().join("refp.toml");
    let baseline = directory.path().join("baseline.json");
    let candidate = directory.path().join("candidate.json");
    let binary = env!("CARGO_BIN_EXE_refp");

    let status = Command::new(binary)
        .args(["init", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .status()
        .unwrap();
    assert!(status.success());
    fs::write(
        &policy,
        "version = 1\nrequired_names = [\"TOKEN\"]\n[non_secret]\nnames = [\"NODE_ENV\"]\n",
    )
    .unwrap();

    let first = Command::new(binary)
        .args(["capture", "--environment", "staging", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .arg("--output")
        .arg(&baseline)
        .args([
            "--",
            "sh",
            "-c",
            "printf 'TOKEN=super-secret\\0NODE_ENV=staging\\0'",
        ])
        .status()
        .unwrap();
    assert!(first.success());

    let second = Command::new(binary)
        .args(["capture", "--environment", "production", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .arg("--output")
        .arg(&candidate)
        .args([
            "--",
            "sh",
            "-c",
            "printf 'TOKEN=another-secret\\0NODE_ENV=production\\0EXTRA=yes\\0'",
        ])
        .status()
        .unwrap();
    assert!(second.success());

    let artifact = fs::read_to_string(&baseline).unwrap();
    assert!(!artifact.contains("super-secret"));
    assert!(!artifact.contains("staging\\0"));

    let output = Command::new(binary)
        .args(["--json", "compare", "--key"])
        .arg(&key)
        .arg("--baseline")
        .arg(&baseline)
        .arg(&candidate)
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(2));
    let report: Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["extra"][0], "EXTRA");
    assert_eq!(report["resolved_changed"][0], "NODE_ENV");
    assert_eq!(report["drift"], true);
}

#[test]
fn empty_capture_is_an_actionable_error() {
    let directory = tempfile::tempdir().unwrap();
    let key = directory.path().join("project.key");
    let policy = directory.path().join("refp.toml");
    let output_path = directory.path().join("empty.json");
    let binary = env!("CARGO_BIN_EXE_refp");
    assert!(Command::new(binary)
        .args(["init", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .status()
        .unwrap()
        .success());
    let output = Command::new(binary)
        .args(["--json", "capture", "--environment", "ci", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .arg("--output")
        .arg(&output_path)
        .args(["--", "sh", "-c", "true"])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(1));
    let error: Value = serde_json::from_slice(&output.stdout).unwrap();
    assert!(error["error"]
        .as_str()
        .unwrap()
        .contains("no environment records"));
    assert!(!output_path.exists());
}

#[test]
fn demo_json_is_one_document_and_uses_real_signed_files() {
    let output = Command::new(env!("CARGO_BIN_EXE_refp"))
        .args(["--json", "demo"])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(2));
    let document: Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(document["demo"], true);
    assert_eq!(document["exit_code"], 2);
    assert_eq!(document["report"]["drift"], true);
    assert_eq!(
        document["report"]["missing"],
        serde_json::json!(["PUBLIC_API_ORIGIN"])
    );
    let directory = document["directory"].as_str().unwrap();
    for name in [
        "demo.key",
        "refp.toml",
        "baseline.env",
        "candidate.env",
        "baseline.refp.json",
        "candidate.refp.json",
    ] {
        assert!(
            std::path::Path::new(directory).join(name).is_file(),
            "{name}"
        );
    }
    for name in ["baseline.refp.json", "candidate.refp.json"] {
        let fingerprint: Value =
            serde_json::from_slice(&fs::read(std::path::Path::new(directory).join(name)).unwrap())
                .unwrap();
        assert!(fingerprint["signature"]
            .as_str()
            .is_some_and(|value| !value.is_empty()));
    }
}

#[test]
fn capture_executes_arguments_without_shell_expansion() {
    let directory = tempfile::tempdir().unwrap();
    let key = directory.path().join("project.key");
    let policy = directory.path().join("refp.toml");
    let fingerprint = directory.path().join("capture.json");
    let marker = directory.path().join("must-not-exist");
    let binary = env!("CARGO_BIN_EXE_refp");
    assert!(Command::new(binary)
        .args(["init", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .status()
        .unwrap()
        .success());
    fs::write(&policy, "version = 1\n").unwrap();
    let literal = format!("SAFE=$(touch {})\n", marker.display());
    let status = Command::new(binary)
        .args(["capture", "--environment", "ci", "--key"])
        .arg(&key)
        .arg("--policy")
        .arg(&policy)
        .arg("--output")
        .arg(&fingerprint)
        .args(["--", "printf", &literal])
        .status()
        .unwrap();
    assert!(status.success());
    assert!(!marker.exists());
}
