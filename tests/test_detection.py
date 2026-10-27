import pytest
import os
import yaml
from src.detection_engine import YAMLRuleEngine

@pytest.fixture
def temp_rule(tmpdir):
    rule = {
        "rule_id": "TEST-001",
        "title": "Test Brute Force",
        "detection": {
            "condition": {
                "type": "threshold",
                "threshold": 3,
                "group_by": ["source_ip"],
                "filters": [
                    {"field": "event_type", "operator": "equals", "value": "Failed Login"}
                ]
            }
        },
        "response": {"risk_score_base": 50}
    }
    
    rule_file = tmpdir.join("test_rule.yml")
    with open(rule_file, "w") as f:
        yaml.dump(rule, f)
        
    return str(tmpdir)

def test_yaml_rule_engine(temp_rule):
    engine = YAMLRuleEngine(rules_dir=temp_rule)
    assert len(engine.rules) == 1
    
    event = {
        "event_type": "Failed Login",
        "source_ip": "1.1.1.1",
        "enrichment_is_malicious_ip": False
    }
    
    # Send 1st event
    alerts = engine.evaluate(event)
    assert len(alerts) == 0
    
    # Send 2nd event
    alerts = engine.evaluate(event)
    assert len(alerts) == 0
    
    # Send 3rd event (should trigger threshold of 3)
    alerts = engine.evaluate(event)
    assert len(alerts) == 1
    assert alerts[0]["title"] == "Test Brute Force"
    assert alerts[0]["risk_score"] == 50
