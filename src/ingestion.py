import os
import time
from typing import List, Callable
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import schemas
from parsers import get_parser

def ingest_file(filepath: str, format_type: str) -> List[schemas.LogEventCreate]:
    """Reads a file and returns a list of parsed LogEventCreate objects."""
    parser = get_parser(format_type)
    if not parser:
        raise ValueError(f"No parser found for format: {format_type}")

    parsed_events = []
    
    if format_type.lower() == "json":
        # Handle the existing demo array of JSON objects
        import json
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        # Convert back to string line for parser uniformity
                        evt = parser.parse(json.dumps(item))
                        if evt: parsed_events.append(evt)
                else:
                    evt = parser.parse(json.dumps(data))
                    if evt: parsed_events.append(evt)
            except Exception as e:
                print(f"[!] Error parsing JSON file {filepath}: {e}")
    else:
        # Standard line-by-line parsing
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                evt = parser.parse(line)
                if evt:
                    parsed_events.append(evt)
                    
    return parsed_events

class LogFileHandler(FileSystemEventHandler):
    def __init__(self, format_type: str, callback: Callable[[List[schemas.LogEventCreate]], None]):
        self.format_type = format_type
        self.callback = callback
        self.parser = get_parser(format_type)
        self.last_positions = {}

    def on_modified(self, event):
        if event.is_directory:
            return
        
        filepath = event.src_path
        # Only process .log or .txt or .json files
        if not (filepath.endswith(".log") or filepath.endswith(".txt") or filepath.endswith(".json")):
            return
            
        pos = self.last_positions.get(filepath, 0)
        
        new_events = []
        try:
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                f.seek(pos)
                for line in f:
                    line = line.strip()
                    if line:
                        evt = self.parser.parse(line)
                        if evt:
                            new_events.append(evt)
                self.last_positions[filepath] = f.tell()
        except Exception as e:
            print(f"[!] Error reading file {filepath}: {e}")

        if new_events:
            self.callback(new_events)

def watch_directory(directory: str, format_type: str, callback: Callable[[List[schemas.LogEventCreate]], None]):
    """Watches a directory for new log lines and triggers the callback."""
    if not os.path.exists(directory):
        print(f"[!] Directory {directory} does not exist.")
        return

    event_handler = LogFileHandler(format_type, callback)
    observer = Observer()
    observer.schedule(event_handler, directory, recursive=False)
    observer.start()
    
    print(f"[*] Started watching {directory} for {format_type} logs...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n[*] Stopped watching directory.")
    observer.join()
