from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import models, schemas, crud, auth
from database import SessionLocal, engine, get_db
from detection_engine import DetectionEngine
import json

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SentinelTrace AI API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastapi.tiangolo.com"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

@app.post("/api/auth/register", response_model=schemas.User)
@limiter.limit("5/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
@app.get("/")
def read_root():
    return {"message": "SentinelTrace AI Backend Running Securely"}

@app.post("/api/logs/upload")
@limiter.limit("20/minute")
def upload_logs(
    request: Request,
    logs: List[schemas.LogEventCreate], 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    engine = DetectionEngine(db)
    result = engine.process_logs(logs)
    return result

@app.get("/api/logs", response_model=List[schemas.LogEvent])
def get_logs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return crud.get_logs(db, skip=skip, limit=limit)

@app.get("/api/alerts", response_model=List[schemas.Alert])
def get_alerts(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return crud.get_alerts(db, skip=skip, limit=limit)

@app.put("/api/alerts/{alert_id}/status", response_model=schemas.Alert)
def update_status(
    alert_id: int,
    status_update: schemas.AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    alert = crud.update_alert_status(db, alert_id=alert_id, status=status_update.status)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db)
):
    total_events = db.query(models.LogEvent).count()
    active_alerts = db.query(models.Alert).filter(models.Alert.status == "New").count()
    critical = db.query(models.Alert).filter(models.Alert.severity == "CRITICAL").count()
    high = db.query(models.Alert).filter(models.Alert.severity == "HIGH").count()
    incidents = db.query(models.Incident).count()
    
    # Fake suspicious for simplicity, normally count events linked to alerts
    suspicious = db.query(models.IncidentEvent).count()
    
    return schemas.DashboardStats(
        total_events=total_events,
        suspicious_events=suspicious,
        active_alerts=active_alerts,
        critical_alerts=critical,
        high_alerts=high,
        detected_incidents=incidents,
        mitre_techniques_detected=4
    )

@app.post("/api/demo")
@limiter.limit("5/minute")
def load_demo(
    request: Request,
    db: Session = Depends(get_db)
):
    with open("sample_logs/demo_logs.json", "r") as f:
        data = json.load(f)
    logs = [schemas.LogEventCreate(**item) for item in data]
    engine = DetectionEngine(db)
    result = engine.process_logs(logs)
    return {"message": "Demo data loaded and processed", "details": result}
