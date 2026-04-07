# api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


# ============================================================================
# LEGACY MODEL
# ============================================================================

class Task(models.Model):
    """Legacy model — kept for backward compatibility during migration."""
    title     = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    date      = models.DateTimeField(default=timezone.now)
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['user', 'date', 'completed']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.title}"


# ============================================================================
# LOCKEDIN 2.0 MODELS
# ============================================================================

class LifeAspect(models.Model):
    """
    A Lock — one area of life the user wants to transform.
    target_date and duration_days are nullable for forever Locks
    (e.g. the auto-created Daily Tasks Lock).
    """

    ASPECT_TYPES = [
        ('fitness',       'Body & Fitness'),
        ('finance',       'Financial Growth'),
        ('skills',        'Skill Development'),
        ('health',        'Health & Wellness'),
        ('relationships', 'Relationships'),
        ('career',        'Career Progress'),
        ('mindfulness',   'Mindfulness'),
        ('creativity',    'Creative Pursuits'),
        ('custom',        'Custom Goal'),
    ]

    STATUS_CHOICES = [
        ('active',    'Active'),
        ('completed', 'Completed'),
        ('paused',    'Paused'),
        ('abandoned', 'Abandoned'),
    ]

    # Basic info
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aspects')
    aspect_type  = models.CharField(max_length=50, choices=ASPECT_TYPES)
    custom_name  = models.CharField(max_length=100, null=True, blank=True)

    # Goal settings — nullable so "forever" Locks have no end date
    start_date    = models.DateField(default=timezone.now)
    target_date   = models.DateField(null=True, blank=True)
    duration_days = models.IntegerField(null=True, blank=True)

    # Motivation
    why_statement = models.TextField(blank=True)

    # Visual
    icon  = models.CharField(max_length=50, default='target')
    color = models.CharField(max_length=7, default='#3B82F6')

    # Status
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active    = models.BooleanField(default=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Default activities — repeat daily unless overridden
    default_activities = models.JSONField(default=list, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Life Aspects'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.get_display_name()}"

    def get_display_name(self):
        if self.aspect_type == 'custom' and self.custom_name:
            return self.custom_name
        return dict(self.ASPECT_TYPES).get(self.aspect_type, 'Unknown')

    def save(self, *args, **kwargs):
        if self.start_date and self.target_date:
            self.duration_days = (self.target_date - self.start_date).days
        else:
            self.duration_days = None
        super().save(*args, **kwargs)

    @property
    def is_forever(self):
        """True for Locks with no end date (e.g. Daily Tasks)."""
        return self.target_date is None

    @property
    def days_elapsed(self):
        today = timezone.now().date()
        if today < self.start_date:
            return 0
        return (today - self.start_date).days

    @property
    def days_remaining(self):
        if self.is_forever:
            return None
        if self.status == 'completed':
            return 0
        today = timezone.now().date()
        return max(0, (self.target_date - today).days)

    @property
    def progress_percentage(self):
        if self.is_forever or not self.duration_days:
            return None
        return min(100, round((self.days_elapsed / self.duration_days) * 100, 1))

    @property
    def current_week(self):
        if self.days_elapsed == 0:
            return 1
        return (self.days_elapsed // 7) + 1

    @property
    def total_weeks(self):
        if not self.duration_days:
            return None
        return (self.duration_days // 7) + (1 if self.duration_days % 7 > 0 else 0)


class DailyActivity(models.Model):
    """
    A single activity for a specific aspect on a specific date.

    For sprint Locks: default_activities auto-populate each day.
    For the Daily Tasks Lock: user adds activities freely each day;
    days with zero activities are simply empty (not counted as missed).
    """

    aspect       = models.ForeignKey(LifeAspect, on_delete=models.CASCADE, related_name='activities')
    title        = models.CharField(max_length=200)
    completed    = models.BooleanField(default=False)
    date         = models.DateField(default=timezone.now)
    notes        = models.TextField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name_plural = 'Daily Activities'
        indexes = [
            models.Index(fields=['aspect', 'date']),
            models.Index(fields=['aspect', 'date', 'completed']),
        ]

    def __str__(self):
        return f"{self.aspect.get_display_name()} - {self.date}: {self.title}"

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)


class WeeklyWrapped(models.Model):
    """
    Weekly summary for an aspect.
    Only generated on Saturdays (or viewable from Saturday onwards).
    """

    aspect           = models.ForeignKey(LifeAspect, on_delete=models.CASCADE, related_name='weekly_wraps')
    week_number      = models.IntegerField()
    week_start_date  = models.DateField()
    week_end_date    = models.DateField()

    total_days             = models.IntegerField(default=7)
    locked_in_days         = models.IntegerField(default=0)
    total_activities       = models.IntegerField(default=0)
    completed_activities   = models.IntegerField(default=0)
    completion_rate        = models.FloatField(default=0)

    longest_streak_this_week  = models.IntegerField(default=0)
    ended_week_on_streak      = models.BooleanField(default=False)

    previous_week_completion_rate = models.FloatField(null=True, blank=True)
    improvement_percentage        = models.FloatField(null=True, blank=True)

    reflection_notes  = models.TextField(null=True, blank=True)
    proudest_moment   = models.TextField(null=True, blank=True)

    generated_at = models.DateTimeField(auto_now_add=True)
    is_viewed    = models.BooleanField(default=False)

    class Meta:
        ordering = ['-week_number']
        unique_together = ['aspect', 'week_number']
        verbose_name_plural = 'Weekly Wraps'

    def __str__(self):
        return f"{self.aspect.get_display_name()} - Week {self.week_number}"

    @property
    def performance_emoji(self):
        if self.completion_rate >= 90:
            return "fire"        # maps to Lucide Flame
        elif self.completion_rate >= 70:
            return "muscle"      # maps to Lucide Dumbbell
        elif self.completion_rate >= 50:
            return "thumbs-up"   # maps to Lucide ThumbsUp
        else:
            return "trending-up" # maps to Lucide TrendingUp

    @property
    def is_improvement(self):
        if self.improvement_percentage is None:
            return None
        return self.improvement_percentage > 0


class Milestone(models.Model):
    """Achievement milestones — auto-checked after activity completion."""

    MILESTONE_TYPES = [
        ('streak_3',      '3 Day Streak'),
        ('streak_7',      '7 Day Streak'),
        ('streak_14',     '14 Day Streak'),
        ('streak_30',     '30 Day Streak'),
        ('week_perfect',  'Perfect Week'),
        ('week_3_perfect','3 Perfect Weeks'),
        ('halfway',       'Halfway Point'),
        ('final_week',    'Final Week'),
        ('completed',     'Goal Completed'),
        ('comeback',      'Comeback After Miss'),
    ]

    aspect         = models.ForeignKey(LifeAspect, on_delete=models.CASCADE, related_name='milestones')
    milestone_type = models.CharField(max_length=20, choices=MILESTONE_TYPES)
    title          = models.CharField(max_length=100)
    description    = models.TextField()
    achieved       = models.BooleanField(default=False)
    achieved_at    = models.DateTimeField(null=True, blank=True)
    badge_icon     = models.CharField(max_length=50, default='trophy')
    badge_color    = models.CharField(max_length=7, default='#FFD700')
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['achieved', '-achieved_at']
        unique_together = ['aspect', 'milestone_type']

    def __str__(self):
        status = "✅" if self.achieved else "⏳"
        return f"{status} {self.aspect.get_display_name()}: {self.title}"