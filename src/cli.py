import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description="SentinelTrace AI - Security Log Analyzer CLI")
    
    # Subcommands
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # 'scan' command
    scan_parser = subparsers.add_parser("scan", help="Scan a log file against detection rules")
    scan_parser.add_argument("--file", "-f", required=True, help="Path to the log file")
    scan_parser.add_argument("--format", "-t", required=True, choices=["ssh", "syslog", "apache", "windows", "json"], help="Format of the log file")
    scan_parser.add_argument("--report", "-r", choices=["html", "csv", "json"], help="Output report format")
    
    # 'server' command
    server_parser = subparsers.add_parser("server", help="Start the FastAPI web backend")
    server_parser.add_argument("--host", default="127.0.0.1", help="Host IP")
    server_parser.add_argument("--port", type=int, default=8000, help="Port number")

    args = parser.parse_args()

    if args.command == "scan":
        print(f"[*] Scanning file: {args.file} (Format: {args.format})")
        from ingestion import ingest_file
        from detection_engine import DetectionEngine
        from reporting import generate_csv, generate_json, generate_html, generate_firewall_commands
        import os
        
        try:
            events = ingest_file(args.file, args.format)
            print(f"[+] Successfully parsed {len(events)} events.")
            if len(events) > 0:
                print(f"[Sample Event]: {events[0].event_type} from {events[0].source_ip or 'Unknown IP'}")
                
            print("[*] Passing events to YAML Detection Engine...")
            engine = DetectionEngine() # DB is None for offline scan
            result = engine.process_logs(events)
            alerts = result["alerts"]
            print(f"[+] Scan Complete. Generated {len(alerts)} alerts.")
            
            # Generate Reports
            if args.report and len(alerts) > 0:
                os.makedirs("reports", exist_ok=True)
                if args.report == "csv":
                    generate_csv(alerts, "reports/scan_report.csv")
                elif args.report == "json":
                    generate_json(alerts, "reports/scan_report.json")
                elif args.report == "html":
                    generate_html(alerts, "reports/scan_report.html")
                    
                # Always generate Navigator Layer if any report is requested
                from reporting import generate_navigator_layer
                generate_navigator_layer(alerts, "reports/mitre_navigator_layer.json")
            
            # Generate optional firewall commands
            generate_firewall_commands(alerts)
            
        except Exception as e:
            print(f"[-] Error during scan: {e}")
            
    elif args.command == "server":
        print(f"[*] Starting SentinelTrace AI Backend on {args.host}:{args.port}")
        import uvicorn
        uvicorn.run("main:app", host=args.host, port=args.port, reload=True)
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
