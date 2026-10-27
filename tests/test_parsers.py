import pytest
from src.parsers import SSHParser, ApacheParser

def test_ssh_parser_failed_login():
    parser = SSHParser()
    log_line = "Oct 27 10:15:02 server sshd[1234]: Failed password for invalid user admin from 192.168.1.100 port 55432 ssh2"
    event = parser.parse(log_line)
    
    assert event is not None
    assert event.event_type == "Failed Login"
    assert event.username == "admin"
    assert event.source_ip == "192.168.1.100"
    assert event.source == "SSH"

def test_ssh_parser_success_login():
    parser = SSHParser()
    log_line = "Oct 27 10:15:05 server sshd[1234]: Accepted password for root from 10.0.0.5 port 55432 ssh2"
    event = parser.parse(log_line)
    
    assert event is not None
    assert event.event_type == "Successful Login"
    assert event.username == "root"
    assert event.source_ip == "10.0.0.5"

def test_apache_parser_sqli():
    parser = ApacheParser()
    log_line = '192.168.1.10 - - [27/Oct/2023:14:32:00 +0000] "GET /login?user=%27%20UNION%20SELECT%20 HTTP/1.1" 200 1234'
    event = parser.parse(log_line)
    
    assert event is not None
    assert event.event_type == "SQL Injection Attempt"
    assert event.source_ip == "192.168.1.10"
    assert "UNION SELECT" in event.command_line

def test_apache_parser_xss():
    parser = ApacheParser()
    log_line = '10.0.0.2 - - [27/Oct/2023:14:32:00 +0000] "GET /search?q=<script>alert(1)</script> HTTP/1.1" 200 1234'
    event = parser.parse(log_line)
    
    assert event is not None
    assert event.event_type == "XSS Attempt"
    assert "<script>" in event.command_line
