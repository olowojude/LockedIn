# api/signals.py
import logging
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone
from .models import LifeAspect

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_default_daily_tasks_lock(sender, instance, created, **kwargs):
    """
    Auto-create a 'Daily Tasks' Lock for every new user on registration.

    Uses transaction.on_commit() so the Lock creation runs AFTER the
    registration transaction is fully committed — never inside it.
    This means a failure here cannot affect the registration response,
    and we avoid the 'cannot execute queries in broken atomic block' error.
    """
    if not created:
        return

    user_id = instance.pk

    def _create_lock():
        try:
            user = User.objects.get(pk=user_id)

            # Guard against duplicate creation
            if LifeAspect.objects.filter(
                user=user, custom_name="Daily Tasks"
            ).exists():
                return

            LifeAspect.objects.create(
                user=user,
                aspect_type="custom",
                custom_name="Daily Tasks",
                start_date=timezone.now().date(),
                target_date=None,       # runs forever — no end date
                duration_days=None,
                why_statement="Track your daily tasks and stay consistent.",
                icon="check-square",
                color="#6366F1",
                status="active",
                is_active=True,
                default_activities=[],
            )
            logger.info(f"Daily Tasks Lock created for user {user.username}")

        except Exception as e:
            # Log but never raise — registration already succeeded
            logger.error(
                f"Failed to create Daily Tasks Lock for user_id={user_id}: {e}"
            )

    # Schedule _create_lock to run after the current transaction commits.
    # If there is no active transaction, it runs immediately.
    transaction.on_commit(_create_lock)