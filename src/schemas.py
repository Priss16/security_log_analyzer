from pydantic import BaseModel
from typing import Optional, List
import datetime

class UserBase(BaseModel):
    username: str
    role: Optional[str] = "Normal User"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LogEventBase(BaseModel):
    timestamp: str
    source: str
    event_id: str
    event_type: str
    username: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    process_name: Optional[str] = None
    parent_process: Optional[str] = None
    command_line: Optional[str] = None
    file_path: Optional[str] = None
    message: Optional[str] = None
    severity: Optional[str] = None
    raw_log: Optional[str] = None
    enrichment_geo_country: Optional[str] = None
    enrichment_is_malicious_ip: Optional[bool] = False

class LogEventCreate(LogEventBase):
    pass

class LogEvent(LogEventBase):
    id: int
    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    title: str
    description: str
    severity: str
    risk_score: float
    confidence: float
    timestamp: str
    mitre_id: Optional[str] = None
    mitre_tactic: Optional[str] = None
    source_ip: Optional[str] = None
    username: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    status: str
    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: str

class AnalystFeedbackCreate(BaseModel):
    feedback_type: str
    reason: str

class DashboardStats(BaseModel):
    total_events: int
    suspicious_events: int
    active_alerts: int
    critical_alerts: int
    high_alerts: int
    detected_incidents: int
    mitre_techniques_detected: int
