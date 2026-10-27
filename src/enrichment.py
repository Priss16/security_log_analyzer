import random

def get_geoip(ip: str) -> dict:
    """
    Mocked GeoIP lookup. In production, use GeoLite2 or an API like ip-api.com.
    """
    if not ip or ip in ["127.0.0.1", "localhost"]:
        return {"country": "Local", "city": "Local"}
    
    # Deterministic mock based on IP string length/chars for demonstration
    countries = ["United States", "China", "Russia", "Brazil", "Germany", "India"]
    idx = sum(ord(c) for c in ip) % len(countries)
    
    return {
        "country": countries[idx],
        "city": "Unknown"
    }

def check_ip_reputation(ip: str, blocklist_path: str = "../config/ip_blocklist.txt") -> bool:
    """
    Checks if an IP is in the local offline blocklist.
    Returns True if malicious, False otherwise.
    """
    if not ip: return False
    try:
        with open(blocklist_path, "r") as f:
            for line in f:
                if line.strip() == ip:
                    return True
    except FileNotFoundError:
        pass
    return False

def enrich_event(event_dict: dict) -> dict:
    """
    Enriches a single event dictionary with GeoIP and Reputation data.
    """
    ip = event_dict.get("source_ip")
    if ip:
        geo = get_geoip(ip)
        event_dict["enrichment_geo_country"] = geo["country"]
        event_dict["enrichment_is_malicious_ip"] = check_ip_reputation(ip)
    else:
        event_dict["enrichment_geo_country"] = "Unknown"
        event_dict["enrichment_is_malicious_ip"] = False
        
    return event_dict
