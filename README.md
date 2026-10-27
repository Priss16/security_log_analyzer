# SentinelTrace AI — Security Log Analysis & MITRE ATT&CK-Based Detection System

SentinelTrace AI is a portfolio-grade, SOC-style cybersecurity tool designed to ingest, normalize, and analyze massive volumes of system and web logs. It maps detected malicious behaviors directly to the **MITRE ATT&CK Framework**.

## Key Features
- **Multi-Format Parsers**: Natively ingests SSH `auth.log`, Apache/Nginx `access.log`, and raw Windows Event JSON.
- **Dynamic YAML Detection Engine**: No hardcoded rules. Write Sigma-style YAML rules to detect anomalies (e.g., Brute Force, Web Scanning, SQLi).
- **Threat Enrichment**: Built-in GeoIP lookup and malicious IP Reputation blocking.
- **Automated Reporting**: Generates beautiful, XSS-safe HTML reports and CSV exports.
- **Incident Response**: Automatically suggests (but never auto-executes) `iptables` and `ufw` firewall mitigation commands.

## Architecture
```text
[ Raw Logs ] -> [ Modular Parsers ] -> [ Pydantic Normalization ] -> [ Enrichment Engine ]
                                                                             |
                                                                             v
[ Reporting & Firewall Mitigation ] <- [ Alert Generation ] <- [ YAML Detection Engine ]
```

## Installation
### Option 1: Docker (Recommended)
```bash
docker-compose up --build
```

### Option 2: Local Python Env
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage
### 1. Offline Log Scanning
```bash
python src/cli.py scan -f lab/simulated_auth.log -t ssh --report html
```

### 2. Live Web Dashboard
```bash
# Terminal 1: Start Backend
python src/cli.py server

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

## Ethical Hacking Lab
We've included a simulated environment to test the detection engine safely.
Please see [lab/ATTACK_GUIDE.md](./lab/ATTACK_GUIDE.md) for instructions on simulating SSH Brute Force and SQL Injection attacks using Kali Linux tools like Hydra and SQLmap.

## MITRE ATT&CK Detection Coverage Table
| Technique | Technique ID | YAML Rule File | Tested in Lab? |
|-----------|--------------|----------------|----------------|
| **Password Guessing (Brute Force)** | T1110.001 | `ssh_brute_force.yml` | ✅ Yes (Hydra) |
| **Password Spraying** | T1110.003 | `password_spraying.yml` | ✅ Yes |
| **Valid Accounts** | T1078 | `valid_accounts.yml` | ❌ No |
| **Exploit Public-Facing App (SQLi/XSS)** | T1190 | `web_exploit.yml` | ✅ Yes (SQLmap) |
| **Active Scanning** | T1595 | `active_scanning.yml` | ✅ Yes (Nikto) |
| **Indicator Removal on Host (Log Clearing)** | T1070.001 | `log_clearing.yml` | ❌ No (Requires Windows VM) |
| **Local Account Creation** | T1136.001 | `account_creation.yml` | ❌ No (Requires Windows VM) |

## Dashboard & Visualizations
- **ATT&CK Navigator JSON Export:** Run scans to generate `mitre_navigator_layer.json` and upload it to the official [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) to view your detection coverage heatmap!
- **Streamlit Web App:** We provide a dedicated Streamlit UI for analyzing logs interactively. Run it with:
  ```bash
  streamlit run src/app_streamlit.py
  ```

## Future Work
- Real-time WebSocket streaming to the React dashboard.
- Machine Learning (Isolation Forests) for anomaly detection beyond static YAML rules.
- Direct integration with AWS CloudWatch and Splunk.
