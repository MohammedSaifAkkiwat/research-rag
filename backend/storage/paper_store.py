# storage/paper_store.py
import json
import os
from datetime import datetime
from pathlib import Path

STORE_FILE = "paper_registry.json"

class PaperStore:
    """
    Simple JSON-backed storage for paper metadata.
    In production, this would be a database (PostgreSQL, SQLite).
    For deployment purposes, this JSON approach works on single-instance servers.
    """
    
    def __init__(self):
        self.store_path = Path(STORE_FILE)
        self._data: dict = self._load()
    
    def _load(self) -> dict:
        """Load existing data from disk, or create empty store."""
        if self.store_path.exists():
            with open(self.store_path, "r") as f:
                return json.load(f)
        return {}
    
    def _save(self):
        """Persist current state to disk immediately."""
        with open(self.store_path, "w") as f:
            json.dump(self._data, f, indent=2, default=str)
    
    def add_paper(self, paper_id: str, metadata: dict):
        """Register a newly processed paper."""
        self._data[paper_id] = {
            **metadata,
            "upload_time": datetime.now().isoformat(),
        }
        self._save()  # Immediately persist — don't lose data if server crashes
    
    def get_paper(self, paper_id: str) -> dict | None:
        return self._data.get(paper_id)
    
    def list_papers(self) -> list[dict]:
        return [{"paper_id": pid, **meta} for pid, meta in self._data.items()]
    
    def delete_paper(self, paper_id: str) -> bool:
        if paper_id in self._data:
            del self._data[paper_id]
            self._save()
            return True
        return False
    
    def exists(self, paper_id: str) -> bool:
        return paper_id in self._data