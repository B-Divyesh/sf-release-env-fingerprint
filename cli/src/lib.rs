//! Core fingerprinting primitives for the `refp` command.
//!
//! The library intentionally keeps raw values out of all serializable types.

use base64::{engine::general_purpose::STANDARD_NO_PAD, Engine as _};
use chrono::{SecondsFormat, Utc};
use hmac::{Hmac, Mac};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::Path;
use url::Url;

type HmacSha256 = Hmac<Sha256>;

pub const SCHEMA: &str = "release-env-fingerprint/v1";
pub const MAX_CAPTURE_BYTES: usize = 16 * 1024 * 1024;

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct Policy {
    pub version: u8,
    #[serde(default)]
    pub required_names: Vec<String>,
    #[serde(default)]
    pub required_prefixes: Vec<String>,
    #[serde(default)]
    pub non_secret: NonSecretPolicy,
    #[serde(default)]
    pub hosts: BTreeMap<String, Vec<String>>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct NonSecretPolicy {
    #[serde(default)]
    pub names: Vec<String>,
    #[serde(default)]
    pub prefixes: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VariableFingerprint {
    pub name: String,
    #[serde(rename = "type")]
    pub value_type: ValueType,
    pub present: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub non_secret_hash: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ValueType {
    Empty,
    Boolean,
    Integer,
    Number,
    Url,
    Json,
    String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Violation {
    pub rule: String,
    pub variable: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FingerprintPayload {
    pub schema: String,
    pub environment: String,
    pub captured_at: String,
    pub policy_sha256: String,
    pub variables: Vec<VariableFingerprint>,
    pub violations: Vec<Violation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    #[serde(flatten)]
    pub payload: FingerprintPayload,
    pub signature: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CompareReport {
    pub baseline: String,
    pub candidate: String,
    pub missing: Vec<String>,
    pub extra: Vec<String>,
    pub type_changed: Vec<TypeChange>,
    pub resolved_changed: Vec<String>,
    pub policy_changed: bool,
    pub violations: Vec<Violation>,
    pub drift: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypeChange {
    pub name: String,
    pub baseline: ValueType,
    pub candidate: ValueType,
}

pub fn generate_key() -> [u8; 32] {
    let mut key = [0_u8; 32];
    OsRng.fill_bytes(&mut key);
    key
}

pub fn encode_key(key: &[u8]) -> String {
    STANDARD_NO_PAD.encode(key)
}

pub fn decode_key(contents: &str) -> Result<Vec<u8>, String> {
    let decoded = STANDARD_NO_PAD
        .decode(contents.trim())
        .map_err(|_| "key is not valid base64".to_string())?;
    if decoded.len() < 32 {
        return Err("key must decode to at least 32 bytes".to_string());
    }
    Ok(decoded)
}

pub fn load_key(path: &Path) -> Result<Vec<u8>, String> {
    let contents = fs::read_to_string(path)
        .map_err(|error| format!("could not read key {}: {error}", path.display()))?;
    decode_key(&contents)
}

pub fn parse_policy(source: &str) -> Result<Policy, String> {
    let policy: Policy =
        toml::from_str(source).map_err(|error| format!("invalid policy: {error}"))?;
    if policy.version != 1 {
        return Err(format!(
            "unsupported policy version {}; expected 1",
            policy.version
        ));
    }
    validate_policy(&policy)?;
    Ok(policy)
}

pub fn validate_policy(policy: &Policy) -> Result<(), String> {
    for name in policy
        .required_names
        .iter()
        .chain(policy.non_secret.names.iter())
        .chain(policy.hosts.keys())
    {
        validate_name(name)?;
    }
    for prefix in policy
        .required_prefixes
        .iter()
        .chain(policy.non_secret.prefixes.iter())
    {
        if prefix.is_empty()
            || !prefix
                .bytes()
                .all(|byte| byte == b'_' || byte.is_ascii_alphanumeric())
        {
            return Err(format!("invalid variable prefix {prefix:?}"));
        }
    }
    for (name, allowed) in &policy.hosts {
        if allowed.is_empty() {
            return Err(format!("host allowlist for {name} is empty"));
        }
        if allowed
            .iter()
            .any(|host| host.is_empty() || host.contains('/') || host.contains(':'))
        {
            return Err(format!(
                "host allowlist for {name} contains an invalid host"
            ));
        }
    }
    Ok(())
}

pub fn policy_digest(source: &str) -> String {
    hex(&Sha256::digest(source.as_bytes()))
}

pub fn parse_environment(bytes: &[u8]) -> Result<BTreeMap<String, Vec<u8>>, String> {
    if bytes.len() > MAX_CAPTURE_BYTES {
        return Err(format!(
            "command output exceeded {} MiB",
            MAX_CAPTURE_BYTES / 1024 / 1024
        ));
    }
    let records: Box<dyn Iterator<Item = &[u8]> + '_> = if bytes.contains(&0) {
        Box::new(bytes.split(|byte| *byte == 0))
    } else {
        Box::new(bytes.split(|byte| *byte == b'\n'))
    };
    let mut environment = BTreeMap::new();
    for record in records.filter(|record| !record.is_empty()) {
        let Some(index) = record.iter().position(|byte| *byte == b'=') else {
            return Err("command output contained a record without NAME=VALUE".to_string());
        };
        let name = std::str::from_utf8(&record[..index])
            .map_err(|_| "environment variable name was not UTF-8".to_string())?;
        validate_name(name)?;
        if environment
            .insert(name.to_string(), record[index + 1..].to_vec())
            .is_some()
        {
            return Err(format!(
                "command output contained duplicate variable {name}"
            ));
        }
    }
    if environment.is_empty() {
        return Err("command returned no environment records".to_string());
    }
    Ok(environment)
}

pub fn create_fingerprint(
    environment_label: &str,
    values: &BTreeMap<String, Vec<u8>>,
    policy: &Policy,
    policy_source: &str,
    key: &[u8],
) -> Result<Fingerprint, String> {
    if environment_label.trim().is_empty() {
        return Err("environment label cannot be empty".to_string());
    }
    let variables = values
        .iter()
        .map(|(name, value)| VariableFingerprint {
            name: name.clone(),
            value_type: infer_type(value),
            present: true,
            non_secret_hash: is_non_secret(name, policy).then(|| hash_non_secret(name, value, key)),
        })
        .collect();
    let payload = FingerprintPayload {
        schema: SCHEMA.to_string(),
        environment: environment_label.to_string(),
        captured_at: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
        policy_sha256: policy_digest(policy_source),
        variables,
        violations: evaluate_policy(values, policy),
    };
    let signature = sign_payload(&payload, key)?;
    Ok(Fingerprint { payload, signature })
}

pub fn verify_fingerprint(fingerprint: &Fingerprint, key: &[u8]) -> Result<(), String> {
    if fingerprint.payload.schema != SCHEMA {
        return Err(format!(
            "unsupported fingerprint schema {}",
            fingerprint.payload.schema
        ));
    }
    let signature = STANDARD_NO_PAD
        .decode(&fingerprint.signature)
        .map_err(|_| "fingerprint signature is not valid base64".to_string())?;
    let serialized = serde_json::to_vec(&fingerprint.payload)
        .map_err(|error| format!("could not serialize fingerprint: {error}"))?;
    let mut mac = HmacSha256::new_from_slice(key).map_err(|_| "invalid signing key".to_string())?;
    mac.update(b"refp:fingerprint:v1\0");
    mac.update(&serialized);
    mac.verify_slice(&signature)
        .map_err(|_| "fingerprint signature verification failed".to_string())
}

pub fn compare(baseline: &Fingerprint, candidate: &Fingerprint) -> CompareReport {
    let base: BTreeMap<_, _> = baseline
        .payload
        .variables
        .iter()
        .map(|item| (item.name.as_str(), item))
        .collect();
    let current: BTreeMap<_, _> = candidate
        .payload
        .variables
        .iter()
        .map(|item| (item.name.as_str(), item))
        .collect();
    let base_names: BTreeSet<_> = base.keys().copied().collect();
    let current_names: BTreeSet<_> = current.keys().copied().collect();
    let missing: Vec<String> = base_names
        .difference(&current_names)
        .map(|name| (*name).to_string())
        .collect();
    let extra: Vec<String> = current_names
        .difference(&base_names)
        .map(|name| (*name).to_string())
        .collect();
    let mut type_changed = Vec::new();
    let mut resolved_changed = Vec::new();
    for name in base_names.intersection(&current_names) {
        let before = base[*name];
        let after = current[*name];
        if before.value_type != after.value_type {
            type_changed.push(TypeChange {
                name: (*name).to_string(),
                baseline: before.value_type,
                candidate: after.value_type,
            });
        }
        if let (Some(before_hash), Some(after_hash)) =
            (&before.non_secret_hash, &after.non_secret_hash)
        {
            if before_hash != after_hash {
                resolved_changed.push((*name).to_string());
            }
        }
    }
    let policy_changed = baseline.payload.policy_sha256 != candidate.payload.policy_sha256;
    let violations = candidate.payload.violations.clone();
    let drift = !missing.is_empty()
        || !extra.is_empty()
        || !type_changed.is_empty()
        || !resolved_changed.is_empty()
        || policy_changed
        || !violations.is_empty();
    CompareReport {
        baseline: baseline.payload.environment.clone(),
        candidate: candidate.payload.environment.clone(),
        missing,
        extra,
        type_changed,
        resolved_changed,
        policy_changed,
        violations,
        drift,
    }
}

pub fn write_private(path: &Path, contents: &[u8], force: bool) -> Result<(), String> {
    use std::fs::OpenOptions;
    use std::io::Write;
    let mut options = OpenOptions::new();
    options
        .write(true)
        .create(true)
        .truncate(force)
        .create_new(!force);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options
        .open(path)
        .map_err(|error| format!("could not create {}: {error}", path.display()))?;
    file.write_all(contents)
        .map_err(|error| format!("could not write {}: {error}", path.display()))
}

pub fn default_policy() -> &'static str {
    r#"# Release Env Fingerprint policy
version = 1
required_names = ["DATABASE_URL", "NODE_ENV"]
required_prefixes = ["PUBLIC_"]

# Only these explicitly non-secret values receive a keyed hash.
[non_secret]
names = ["NODE_ENV", "PUBLIC_API_ORIGIN"]
prefixes = []

# Exact hosts and dot-prefixed subdomain suffixes are supported.
[hosts]
PUBLIC_API_ORIGIN = ["api.example.com", ".example.internal"]
"#
}

fn validate_name(name: &str) -> Result<(), String> {
    let mut bytes = name.bytes();
    let Some(first) = bytes.next() else {
        return Err("environment variable name cannot be empty".to_string());
    };
    if !(first == b'_' || first.is_ascii_alphabetic())
        || !bytes.all(|byte| byte == b'_' || byte.is_ascii_alphanumeric())
    {
        return Err(format!("invalid environment variable name {name:?}"));
    }
    Ok(())
}

fn is_non_secret(name: &str, policy: &Policy) -> bool {
    policy
        .non_secret
        .names
        .iter()
        .any(|allowed| allowed == name)
        || policy
            .non_secret
            .prefixes
            .iter()
            .any(|prefix| name.starts_with(prefix))
}

fn infer_type(value: &[u8]) -> ValueType {
    if value.is_empty() {
        return ValueType::Empty;
    }
    let Ok(text) = std::str::from_utf8(value) else {
        return ValueType::String;
    };
    if matches!(text.to_ascii_lowercase().as_str(), "true" | "false") {
        ValueType::Boolean
    } else if text.parse::<i128>().is_ok() {
        ValueType::Integer
    } else if text.parse::<f64>().is_ok_and(f64::is_finite) {
        ValueType::Number
    } else if Url::parse(text)
        .is_ok_and(|url| matches!(url.scheme(), "http" | "https") && url.host_str().is_some())
    {
        ValueType::Url
    } else if serde_json::from_str::<serde_json::Value>(text)
        .is_ok_and(|json| json.is_array() || json.is_object())
    {
        ValueType::Json
    } else {
        ValueType::String
    }
}

fn hash_non_secret(name: &str, value: &[u8], key: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC accepts keys of any length");
    mac.update(b"refp:value:v1\0");
    mac.update(name.as_bytes());
    mac.update(b"\0");
    mac.update(value);
    STANDARD_NO_PAD.encode(mac.finalize().into_bytes())
}

fn evaluate_policy(values: &BTreeMap<String, Vec<u8>>, policy: &Policy) -> Vec<Violation> {
    let mut violations = Vec::new();
    for name in &policy.required_names {
        if !values.contains_key(name) {
            violations.push(Violation {
                rule: "required_name".to_string(),
                variable: name.clone(),
                message: format!("required variable {name} is missing"),
            });
        }
    }
    for prefix in &policy.required_prefixes {
        if !values.keys().any(|name| name.starts_with(prefix)) {
            violations.push(Violation {
                rule: "required_prefix".to_string(),
                variable: prefix.clone(),
                message: format!("no variable uses required prefix {prefix}"),
            });
        }
    }
    for (name, allowed_hosts) in &policy.hosts {
        let Some(value) = values.get(name) else {
            continue;
        };
        let parsed = std::str::from_utf8(value)
            .ok()
            .and_then(|text| Url::parse(text).ok());
        let host = parsed.as_ref().and_then(Url::host_str);
        let allowed = parsed.as_ref().is_some_and(|url| {
            matches!(url.scheme(), "http" | "https")
                && host.is_some_and(|host| {
                    allowed_hosts.iter().any(|allowed| {
                        if allowed.starts_with('.') {
                            host.ends_with(allowed) && host.len() > allowed.len()
                        } else {
                            host.eq_ignore_ascii_case(allowed)
                        }
                    })
                })
        });
        if !allowed {
            violations.push(Violation {
                rule: "host_allowlist".to_string(),
                variable: name.clone(),
                message: format!("{name} does not resolve to an allowed HTTPS/HTTP host"),
            });
        }
    }
    violations
}

fn sign_payload(payload: &FingerprintPayload, key: &[u8]) -> Result<String, String> {
    let serialized = serde_json::to_vec(payload)
        .map_err(|error| format!("could not serialize fingerprint: {error}"))?;
    let mut mac = HmacSha256::new_from_slice(key).map_err(|_| "invalid signing key".to_string())?;
    mac.update(b"refp:fingerprint:v1\0");
    mac.update(&serialized);
    Ok(STANDARD_NO_PAD.encode(mac.finalize().into_bytes()))
}

fn hex(bytes: &[u8]) -> String {
    use std::fmt::Write as _;
    bytes.iter().fold(
        String::with_capacity(bytes.len() * 2),
        |mut output, byte| {
            let _ = write!(output, "{byte:02x}");
            output
        },
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn policy() -> (&'static str, Policy) {
        let source = r#"version = 1
required_names = ["DATABASE_URL"]
required_prefixes = ["PUBLIC_"]
[non_secret]
names = ["NODE_ENV", "PUBLIC_API_ORIGIN"]
[hosts]
PUBLIC_API_ORIGIN = ["api.example.com", ".example.internal"]
"#;
        (source, parse_policy(source).unwrap())
    }

    #[test]
    fn parses_null_delimited_values_without_persisting_values() {
        let values =
            parse_environment(b"TOKEN=very-secret\0NODE_ENV=production\0EMPTY=\0").unwrap();
        let (source, policy) = policy();
        let fingerprint =
            create_fingerprint("production", &values, &policy, source, &[7; 32]).unwrap();
        let json = serde_json::to_string(&fingerprint).unwrap();
        assert!(!json.contains("very-secret"));
        assert!(json.contains("TOKEN"));
        assert!(fingerprint
            .payload
            .variables
            .iter()
            .find(|item| item.name == "TOKEN")
            .unwrap()
            .non_secret_hash
            .is_none());
        assert!(fingerprint
            .payload
            .variables
            .iter()
            .find(|item| item.name == "NODE_ENV")
            .unwrap()
            .non_secret_hash
            .is_some());
    }

    #[test]
    fn detects_shape_type_and_allowlisted_value_drift() {
        let (source, policy) = policy();
        let before = parse_environment(b"DATABASE_URL=x\0PUBLIC_API_ORIGIN=https://api.example.com\0NODE_ENV=staging\0COUNT=2\0OLD=yes\0").unwrap();
        let after = parse_environment(b"DATABASE_URL=x\0PUBLIC_API_ORIGIN=https://api.example.com\0NODE_ENV=production\0COUNT=many\0EXTRA=yes\0").unwrap();
        let baseline = create_fingerprint("staging", &before, &policy, source, &[9; 32]).unwrap();
        let candidate =
            create_fingerprint("production", &after, &policy, source, &[9; 32]).unwrap();
        let report = compare(&baseline, &candidate);
        assert_eq!(report.missing, vec!["OLD"]);
        assert_eq!(report.extra, vec!["EXTRA"]);
        assert_eq!(report.type_changed[0].name, "COUNT");
        assert_eq!(report.resolved_changed, vec!["NODE_ENV"]);
        assert!(report.drift);
    }

    #[test]
    fn rejects_tampered_fingerprint() {
        let (source, policy) = policy();
        let values = parse_environment(b"DATABASE_URL=x\0PUBLIC_X=y\0").unwrap();
        let mut fingerprint = create_fingerprint("ci", &values, &policy, source, &[5; 32]).unwrap();
        verify_fingerprint(&fingerprint, &[5; 32]).unwrap();
        fingerprint.payload.environment = "production".to_string();
        assert!(verify_fingerprint(&fingerprint, &[5; 32]).is_err());
    }

    #[test]
    fn flags_missing_required_and_disallowed_hosts_without_storing_host() {
        let (source, policy) = policy();
        let values =
            parse_environment(b"PUBLIC_API_ORIGIN=https://evil.invalid/private\0").unwrap();
        let fingerprint = create_fingerprint("ci", &values, &policy, source, &[3; 32]).unwrap();
        assert_eq!(fingerprint.payload.violations.len(), 2);
        let json = serde_json::to_string(&fingerprint).unwrap();
        assert!(!json.contains("evil.invalid"));
    }

    #[test]
    fn enforces_required_names_and_prefixes() {
        let source = r#"version = 1
required_names = ["DATABASE_URL"]
required_prefixes = ["PUBLIC_"]
"#;
        let policy = parse_policy(source).unwrap();
        let missing = parse_environment(b"OTHER=value\0").unwrap();
        let missing_fingerprint =
            create_fingerprint("missing", &missing, &policy, source, &[3; 32]).unwrap();
        assert!(missing_fingerprint
            .payload
            .violations
            .iter()
            .any(|item| item.rule == "required_name"));
        assert!(missing_fingerprint
            .payload
            .violations
            .iter()
            .any(|item| item.rule == "required_prefix"));
    }

    #[test]
    fn matches_exact_and_subdomain_hosts_without_recording_urls() {
        let source = r#"version = 1
[hosts]
API_URL = ["api.example.com", ".services.example.com"]
"#;
        let policy = parse_policy(source).unwrap();
        for host in ["api.example.com", "eu.services.example.com"] {
            let input = format!("API_URL=https://{host}/private\0");
            let fingerprint = create_fingerprint(
                "allowed",
                &parse_environment(input.as_bytes()).unwrap(),
                &policy,
                source,
                &[3; 32],
            )
            .unwrap();
            assert!(fingerprint.payload.violations.is_empty(), "{host}");
        }
        for host in [
            "example.com",
            "services.example.com",
            "api.example.com.evil.test",
        ] {
            let input = format!("API_URL=https://{host}/private\0");
            let fingerprint = create_fingerprint(
                "blocked",
                &parse_environment(input.as_bytes()).unwrap(),
                &policy,
                source,
                &[3; 32],
            )
            .unwrap();
            assert!(
                fingerprint
                    .payload
                    .violations
                    .iter()
                    .any(|item| item.rule == "host_allowlist"),
                "{host}"
            );
            assert!(!serde_json::to_string(&fingerprint).unwrap().contains(host));
        }
    }

    #[test]
    fn keys_change_approved_hashes_and_secrets_have_no_hash() {
        let (source, policy) = policy();
        let values =
            parse_environment(b"DATABASE_URL=secret\0PUBLIC_X=y\0NODE_ENV=production\0").unwrap();
        let first = create_fingerprint("one", &values, &policy, source, &[1; 32]).unwrap();
        let second = create_fingerprint("two", &values, &policy, source, &[2; 32]).unwrap();
        let first_secret = first
            .payload
            .variables
            .iter()
            .find(|item| item.name == "DATABASE_URL")
            .unwrap();
        let first_approved = first
            .payload
            .variables
            .iter()
            .find(|item| item.name == "NODE_ENV")
            .unwrap();
        let second_approved = second
            .payload
            .variables
            .iter()
            .find(|item| item.name == "NODE_ENV")
            .unwrap();
        assert!(first_secret.non_secret_hash.is_none());
        assert_ne!(
            first_approved.non_secret_hash,
            second_approved.non_secret_hash
        );
    }

    #[test]
    fn fingerprint_schema_contains_names_types_and_signature() {
        let (source, policy) = policy();
        let values =
            parse_environment(b"DATABASE_URL=postgres://db/private\0PUBLIC_X=true\0COUNT=4\0")
                .unwrap();
        let fingerprint = create_fingerprint("ci", &values, &policy, source, &[8; 32]).unwrap();
        assert_eq!(fingerprint.payload.schema, SCHEMA);
        assert!(fingerprint
            .payload
            .variables
            .iter()
            .any(|item| item.name == "PUBLIC_X" && item.value_type == ValueType::Boolean));
        assert!(fingerprint
            .payload
            .variables
            .iter()
            .any(|item| item.name == "COUNT" && item.value_type == ValueType::Integer));
        assert!(!fingerprint.signature.is_empty());
        let json = serde_json::to_string(&fingerprint).unwrap();
        assert!(!json.contains("postgres://db/private"));
    }
}
