import streamlit as st
import pandas as pd
from ingestion import ingest_file
from detection_engine import DetectionEngine
import tempfile
import os

st.set_page_config(page_title="SentinelTrace AI", layout="wide")
st.title("🛡️ SentinelTrace AI - MITRE ATT&CK Dashboard")
st.markdown("Upload your server logs to perform a dynamic, rules-based threat analysis mapping to the MITRE ATT&CK Framework.")

col_upload, col_settings = st.columns([2, 1])

with col_upload:
    uploaded_file = st.file_uploader("Upload Log File", type=["log", "txt", "json"])
with col_settings:
    log_type = st.selectbox("Select Log Format", ["ssh", "apache", "json", "windows"])

if st.button("Run Security Scan", type="primary") and uploaded_file is not None:
    with st.spinner('Ingesting logs and evaluating YAML rules...'):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".log") as tmp:
            tmp.write(uploaded_file.getvalue())
            tmp_path = tmp.name
            
        try:
            events = ingest_file(tmp_path, log_type)
            engine = DetectionEngine()
            result = engine.process_logs(events)
            
            alerts = result.get("alerts", [])
            incidents = result.get("incidents", [])
            
            if alerts:
                st.success(f"Scan Complete: {len(events)} events processed. {len(alerts)} alerts generated.")
                df = pd.DataFrame(alerts)
                
                # --- Incident Correlator UI ---
                st.header("🔗 Kill-Chain Incident Timelines")
                if incidents:
                    for inc in incidents:
                        st.error(f"**{inc['incident_id']}** (IP: {inc['source_ip']})\n\n{inc['description']}")
                else:
                    st.info("No multi-stage correlated incidents detected.")
                
                # --- Charts ---
                st.header("📊 Detection Analytics")
                col1, col2 = st.columns(2)
                with col1:
                    st.subheader("Alerts by Severity")
                    st.bar_chart(df['severity'].value_counts())
                with col2:
                    st.subheader("MITRE Tactics Detected")
                    st.bar_chart(df['mitre_tactic'].value_counts())
                    
                # --- Alert Table ---
                st.header("🚨 Raw Alerts")
                st.dataframe(df[['timestamp', 'severity', 'title', 'mitre_id', 'mitre_tactic', 'source_ip']], use_container_width=True)
                
            else:
                st.success(f"Scan Complete: {len(events)} events processed. 0 alerts generated. Systems normal.")
                
        except Exception as e:
            st.error(f"Error during scan: {e}")
        finally:
            os.remove(tmp_path)
