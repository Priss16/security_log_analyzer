from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Normal User")
    is_active = Column(Boolean, default=True)

class LogEvent(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    source = Column(String)
    event_id = Column(String)
    event_type = Column(String)
    username = Column(String)
    source_ip = Column(String)
    destination_ip = Column(String)
    process_name = Column(String)
    parent_process = Column(String)
    command_line = Column(String)
    file_path = Column(String)
    message = Column(String)
    severity = Column(String)
    raw_log = Column(String)
    enrichment_geo_country = Column(String)
    enrichment_is_malicious_ip = Column(Integer) # bool in sqlite

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(String)
    risk_score = Column(Float)
    confidence = Column(Float)
    timestamp = Column(String)
    status = Column(String, default="New")
    mitre_id = Column(String)
    mitre_tactic = Column(String)
    source_ip = Column(String)
    username = Column(String)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    incident_name = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    risk_score = Column(Float)
    confidence = Column(Float)
    severity = Column(String)
    status = Column(String, default="New")

class IncidentEvent(Base):
    __tablename__ = "incident_events"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    log_id = Column(Integer, ForeignKey("logs.id"))
    sequence_number = Column(Integer)

class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    feedback_type = Column(String)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
