"""Explicit initial schema bootstrap. Run once before starting the service."""
import os
from sqlalchemy import create_engine
from app.main import metadata

if __name__ == "__main__":
    engine = create_engine(os.environ["DATABASE_URL"])
    metadata.create_all(engine)
    engine.dispose()
