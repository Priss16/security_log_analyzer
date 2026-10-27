# Ethical Hacking Lab & Attack Simulation Guide

**⚠️ LEGAL DISCLAIMER:** 
> The techniques, scripts, and logs described in this document are strictly for **educational purposes and defensive testing**. 
> You must only simulate these attacks against systems you own or have explicit written permission to test (e.g., your own local Virtual Machines). Unauthorized access to computer systems is illegal.

---

## Overview
This lab guide demonstrates how real-world attacks look in system logs and how **SentinelTrace AI** detects them. You can test the platform using the provided offline log generator, or by performing live attacks in a controlled VM environment.

## Method 1: Safe Offline Simulation (No VMs Required)
We have provided a Python script that perfectly mimics the log output of popular hacking tools. 

1. **Generate the Logs:**
   ```bash
   cd lab
   python generate_attack_logs.py
   ```
   *This creates `simulated_auth.log` (SSH attacks) and `simulated_access.log` (Web attacks).*

2. **Test SentinelTrace AI:**
   ```bash
   # Scan the SSH brute force attempt
   python ../src/cli.py scan -f simulated_auth.log -t ssh --report html
   
   # Scan the Web Application attacks
   python ../src/cli.py scan -f simulated_access.log -t apache --report html
   ```

---

## Method 2: Live VM Simulation

To see this in a real environment, you will need two Virtual Machines on a closed Host-Only network:
- **Attacker VM:** Kali Linux
- **Target VM:** Ubuntu Server running Apache and SSH

### Attack 1: SSH Brute Force (T1110)
**The Attack (Kali):**
```bash
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<Target-IP>
```
**The Log (`/var/log/auth.log` on Ubuntu):**
You will see rapid bursts of `Failed password for invalid user...`.

**The Detection (SentinelTrace):**
Our `ssh_brute_force.yml` rule counts the threshold of failures (e.g., 5 failures in 5 minutes) and fires a `HIGH` severity alert, scoring it as MITRE Technique T1110.001.

### Attack 2: Web Vulnerability Scanning (T1595)
**The Attack (Kali):**
```bash
nikto -h http://<Target-IP>
```
**The Log (`/var/log/apache2/access.log` on Ubuntu):**
Nikto attempts thousands of malicious URIs (Directory traversal, default credentials). The User-Agent often gives it away: `Mozilla/5.0 (Nikto/2.1.6)`.

**The Detection (SentinelTrace):**
The ApacheParser explicitly checks for scanner User-Agents and URI signatures, firing `WEB_SCANNER` and `WEB_SQLI` events.

### Attack 3: SQL Injection (T1190)
**The Attack (Kali):**
```bash
sqlmap -u "http://<Target-IP>/login.php?id=1" --dbs
```
**The Detection (SentinelTrace):**
The ApacheParser detects the `%27` (single quote) and `UNION SELECT` keywords in the URI, generating a `CRITICAL` alert for an Exploitation for Client Execution attempt.
