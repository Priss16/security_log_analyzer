# Viva / Presentation Q&A Cheat Sheet

**Q: What is the primary objective of this project?**
A: To build a comprehensive, SOC-style log analysis system that moves beyond simple static alerts. It ingests disparate logs (SSH, Web, Windows), normalizes them, and correlates events into unified incidents based on the MITRE ATT&CK framework, reducing alert fatigue.

**Q: Why did you choose a YAML-based rule engine instead of hardcoding Python rules?**
A: Hardcoding rules is rigid and unscalable. By implementing a YAML rule engine (similar to industry standards like Sigma), security analysts can create, modify, and tune detections on the fly without changing a single line of backend code.

**Q: How do you handle logs in different formats?**
A: I implemented a modular parser architecture using Regular Expressions and JSON loading. The parsers extract key entities (timestamps, IP, User) and map them to a strict Pydantic schema, ensuring the detection engine receives a perfectly normalized event every time.

**Q: How does the Incident Correlator work?**
A: The engine uses in-memory state tracking to group multiple alerts triggered by the same IP address. If it detects an attacker moving through the kill chain (e.g., Reconnaissance -> Initial Access -> Privilege Escalation), it correlates these alerts into a single High/Critical Incident timeline.

**Q: What is the MITRE ATT&CK Framework and why use it?**
A: It is a globally accessible knowledge base of adversary tactics and techniques based on real-world observations. Using it ensures our detections are mapped to actual known threat behaviors rather than arbitrary "bad events".

**Q: How does your tool mitigate False Positives?**
A: 1. By relying on correlation (incidents) rather than just single alerts.
2. By utilizing Threat Intelligence (GeoIP and an IP Blocklist) to dynamically adjust the risk score of an event before triggering an alert.

**Q: How did you validate that your tool actually detects attacks?**
A: I built an Ethical Hacking Lab with a Python log synthesizer that mimics real-world tools like Hydra, Nikto, and SQLmap. The logs generated trigger the engine perfectly, matching the expected MITRE techniques.

**Q: Can your tool automatically block the attacks?**
A: No, and that is a deliberate ethical and operational choice. Automatically applying firewall rules can lead to self-inflicted Denial of Service (DoS). My tool acts as a Response Advisor, generating the `iptables`/`ufw` commands for human review.
