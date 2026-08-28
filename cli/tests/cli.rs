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
