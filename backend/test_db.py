# test_db.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LockedIn.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("✅ Database connection successful!")
        print(f"PostgreSQL version: {version[0]}")
except Exception as e:
    print("❌ Database connection failed!")
    print(f"Error: {e}")