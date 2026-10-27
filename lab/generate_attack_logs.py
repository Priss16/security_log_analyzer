import time
from datetime import datetime, timedelta
import random

def generate_ssh_bruteforce():
    """Generates a simulated SSH Brute Force attack (auth.log format)."""
    logs = []
    base_time = datetime.utcnow() - timedelta(minutes=10)
    attacker_ip = "185.20.10.2" # Known malicious IP from our blocklist
    target_user = "root"
    
    print("[*] Generating SSH Brute Force logs...")
    for i in range(7):
        ts = (base_time + timedelta(seconds=i*2)).strftime("%b %d %H:%M:%S")
        logs.append(f"{ts} server sshd[1234]: Failed password for invalid user {target_user} from {attacker_ip} port 55432 ssh2")
    
    # Finally succeeds
    ts = (base_time + timedelta(seconds=14)).strftime("%b %d %H:%M:%S")
    logs.append(f"{ts} server sshd[1234]: Accepted password for {target_user} from {attacker_ip} port 55432 ssh2")
    
    with open("simulated_auth.log", "w") as f:
        f.write("\n".join(logs))
    print("[+] Created simulated_auth.log")

def generate_web_attacks():
    """Generates simulated Web Attacks (Apache access.log format)."""
    logs = []
    base_time = datetime.utcnow() - timedelta(minutes=5)
    attacker_ip = "45.12.34.56"
    
    print("[*] Generating Web Attack logs...")
    
    # 1. SQL Injection (SQLMap signature)
    ts = (base_time).strftime("%d/%b/%Y:%H:%M:%S +0000")
    logs.append(f'{attacker_ip} - - [{ts}] "GET /login.php?user=admin%27%20OR%201=1-- HTTP/1.1" 200 5123 "-" "sqlmap/1.5.8#dev (http://sqlmap.org)"')
    
    # 2. XSS Attempt
    ts = (base_time + timedelta(seconds=5)).strftime("%d/%b/%Y:%H:%M:%S +0000")
    logs.append(f'{attacker_ip} - - [{ts}] "GET /search?q=%3Cscript%3Ealert(1)%3C/script%3E HTTP/1.1" 200 4096 "-" "Mozilla/5.0"')
    
    # 3. Directory Traversal / Nikto scan
    ts = (base_time + timedelta(seconds=10)).strftime("%d/%b/%Y:%H:%M:%S +0000")
    logs.append(f'{attacker_ip} - - [{ts}] "GET /../../../etc/passwd HTTP/1.1" 404 128 "-" "Mozilla/5.0 (Nikto/2.1.6) (Evasions:None)"')

    with open("simulated_access.log", "w") as f:
        f.write("\n".join(logs))
    print("[+] Created simulated_access.log")

if __name__ == "__main__":
    print("SentinelTrace AI - Attack Log Simulator")
    print("="*40)
    generate_ssh_bruteforce()
    generate_web_attacks()
    print("="*40)
    print("Simulation complete. You can now scan these files:")
    print("python ../src/cli.py scan -f simulated_auth.log -t ssh")
    print("python ../src/cli.py scan -f simulated_access.log -t apache")
