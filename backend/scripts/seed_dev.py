"""Dev-only seed for energy_app_db.

Seeds:
  - 3 legacy roles + 9 new roles (Super Admin, CEO, Energy Manager, …)
  - 19 legacy permissions + 20 new dot-notation permissions
  - Admin user with roles assigned
  - Amol Dairy Kalleh Factory
  - Admin assigned to factory (access_level=admin)
  - Demo users (one per new role) with viewer factory access

Usage (from backend/ with venv active):
    python scripts/seed_dev.py

Optional overrides:
    SEED_ADMIN_EMAIL=admin@example.com python scripts/seed_dev.py
    SEED_ADMIN_PASSWORD=mypassword python scripts/seed_dev.py
    SEED_DEMOS=false python scripts/seed_dev.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db.seed import DEMO_USERS, run_seed

ADMIN_EMAIL    = os.getenv("SEED_ADMIN_EMAIL",    "admin@example.com")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "admin1234")
SEED_DEMOS     = os.getenv("SEED_DEMOS", "true").lower() != "false"

db = SessionLocal()
try:
    run_seed(
        db,
        admin_email=ADMIN_EMAIL,
        admin_password=ADMIN_PASSWORD,
        seed_demos=SEED_DEMOS,
    )
    print()
    print("=" * 60)
    print("  Seed complete — energy_app_db")
    print("=" * 60)
    print(f"  Admin login : {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print("  Factory     : Amol Dairy Kalleh Factory (AMOL_DAIRY_KALLEH)")
    if SEED_DEMOS:
        print(f"  Demo users  : {len(DEMO_USERS)} created (password: Demo@2024!)")
        for u in DEMO_USERS:
            print(f"    {u['email']:<42} [{u['role']}]")
    print("=" * 60)
finally:
    db.close()
