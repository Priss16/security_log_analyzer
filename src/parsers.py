import re
import json
import urllib.parse
from datetime import datetime
from typing import Optional
import schemas

class BaseParser:
    def parse(self, raw_line: str) -> Optional[schemas.LogEventCreate]:
        raise NotImplementedError("Subclasses must implement parse()")

class SSHParser(BaseParser):
    def __init__(self):
        # Example: Oct 27 10:15:02 server sshd[1234]: Failed password for invalid user admin from 192.168.1.100 port 55432 ssh2
        self.regex = re.compile(
            r'^(?P<timestamp>\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+'
            r'(?P<host>\S+)\s+sshd\[\d+\]:\s+'
            r'(?P<message>.*)$'
        )
        self.failed_regex = re.compile(r'Failed password for (?:invalid user )?(?P<user>\S+) from (?P<ip>\S+)')
        self.success_regex = re.compile(r'Accepted password for (?P<user>\S+) from (?P<ip>\S+)')

    def parse(self, raw_line: str) -> Optional[schemas.LogEventCreate]:
        match = self.regex.match(raw_line)
        if not match:
            return None
        
        data = match.groupdict()
        msg = data['message']
        
        event_type = "SSH Info"
        event_id = "SSH_000"
        user = None
        ip = None
        
        failed_match = self.failed_regex.search(msg)
        if failed_match:
            event_type = "Failed Login"
            event_id = "SSH_FAILED"
            user = failed_match.group('user')
            ip = failed_match.group('ip')
        else:
            success_match = self.success_regex.search(msg)
            if success_match:
                event_type = "Successful Login"
                event_id = "SSH_SUCCESS"
                user = success_match.group('user')
                ip = success_match.group('ip')
                
        # Only returning interesting events for now
        if event_id == "SSH_000":
            return None

        # Convert syslog timestamp (assuming current year)
        current_year = datetime.now().year
        try:
            ts_str = f"{current_year} {data['timestamp']}"
            dt = datetime.strptime(ts_str, "%Y %b %d %H:%M:%S")
            iso_ts = dt.isoformat() + "Z"
        except Exception:
            iso_ts = datetime.utcnow().isoformat() + "Z"

        return schemas.LogEventCreate(
            timestamp=iso_ts,
            source="SSH",
            event_id=event_id,
            event_type=event_type,
            username=user,
            source_ip=ip,
            message=msg,
            raw_log=raw_line
        )

class ApacheParser(BaseParser):
    def __init__(self):
        # Example: 192.168.1.10 - - [27/Oct/2023:14:32:00 +0000] "GET /admin HTTP/1.1" 403 1234
        self.regex = re.compile(
            r'^(?P<ip>\S+)\s+\S+\s+(?P<user>\S+)\s+\[(?P<timestamp>[^\]]+)\]\s+'
            r'"(?P<request>[^"]+)"\s+(?P<status>\d+)\s+(?P<size>\S+).*'
        )
        # Web attack signatures
        self.sqli_sig = re.compile(r'(%27|\'|%22|")(?:%20|\s|\+)*(and|or|union|select)(?:%20|\s|\+)+', re.IGNORECASE)
        self.xss_sig = re.compile(r'(%3C|<)script', re.IGNORECASE)

    def parse(self, raw_line: str) -> Optional[schemas.LogEventCreate]:
        match = self.regex.match(raw_line)
        if not match:
            return None
        
        data = match.groupdict()
        req = data['request']
        status = data['status']
        ip = data['ip']
        user = data['user'] if data['user'] != '-' else None
        
        event_type = "Web Request"
        event_id = "WEB_REQ"
        
        # Basic parsing of attack signatures
        if self.sqli_sig.search(req):
            event_type = "SQL Injection Attempt"
            event_id = "WEB_SQLI"
        elif self.xss_sig.search(req):
            event_type = "XSS Attempt"
            event_id = "WEB_XSS"
        elif "nikto" in raw_line.lower() or "sqlmap" in raw_line.lower():
            event_type = "Web Scanner Detected"
            event_id = "WEB_SCANNER"

        # Format timestamp: 27/Oct/2023:14:32:00 +0000
        try:
            dt = datetime.strptime(data['timestamp'], "%d/%b/%Y:%H:%M:%S %z")
            iso_ts = dt.isoformat()
        except Exception:
            iso_ts = datetime.utcnow().isoformat() + "Z"

        return schemas.LogEventCreate(
            timestamp=iso_ts,
            source="Apache",
            event_id=event_id,
            event_type=event_type,
            username=user,
            source_ip=ip,
            command_line=urllib.parse.unquote(req), # storing request in command_line field
            message=f"HTTP {status} - {req}",
            raw_log=raw_line
        )

class WindowsJSONParser(BaseParser):
    def parse(self, raw_line: str) -> Optional[schemas.LogEventCreate]:
        try:
            data = json.loads(raw_line)
            # Map Windows event fields to our schema
            return schemas.LogEventCreate(
                timestamp=data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
                source=data.get("source", "Windows-Security"),
                event_id=str(data.get("event_id", "0")),
                event_type=data.get("event_type", "Unknown"),
                username=data.get("username"),
                source_ip=data.get("source_ip"),
                destination_ip=data.get("destination_ip"),
                process_name=data.get("process_name"),
                parent_process=data.get("parent_process"),
                command_line=data.get("command_line"),
                file_path=data.get("file_path"),
                message=data.get("message", ""),
                severity=data.get("severity", "INFO"),
                raw_log=raw_line
            )
        except json.JSONDecodeError:
            return None

def get_parser(format_type: str) -> BaseParser:
    parsers = {
        "ssh": SSHParser(),
        "apache": ApacheParser(),
        "windows": WindowsJSONParser(),
        # For JSON demo logs, we can just use WindowsJSONParser as a fallback
        "json": WindowsJSONParser()
    }
    return parsers.get(format_type.lower())
