# api/signals.py
# No default Locks are auto-created on registration.
# Users start with a clean slate and create whichever Locks they need.
# This file is kept so apps.py import doesn't break — add future
# signal handlers here as needed.