from sqlalchemy.orm import Session
import models, schemas

def get_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.LogEvent).offset(skip).limit(limit).all()

def create_log(db: Session, log: schemas.LogEventCreate):
    db_log = models.LogEvent(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_alerts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Alert).offset(skip).limit(limit).all()

def get_alert(db: Session, alert_id: int):
    return db.query(models.Alert).filter(models.Alert.id == alert_id).first()

def update_alert_status(db: Session, alert_id: int, status: str):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
        db.refresh(alert)
    return alert

def create_feedback(db: Session, alert_id: int, feedback: schemas.AnalystFeedbackCreate):
    db_fb = models.AnalystFeedback(alert_id=alert_id, **feedback.model_dump())
    db.add(db_fb)
    db.commit()
    db.refresh(db_fb)
    return db_fb
