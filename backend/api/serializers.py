# api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, LifeAspect, DailyActivity, WeeklyWrapped, Milestone
import re


# ============================================================================
# AUTH SERIALIZERS
# ============================================================================

class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200, min_length=1, trim_whitespace=True,
        error_messages={
            'required': 'Task title is required',
            'blank':    'Task title cannot be blank',
        }
    )

    class Meta:
        model  = Task
        fields = ['id', 'title', 'completed', 'date']
        read_only_fields = ['id', 'date']

    def validate_title(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title cannot be empty")
        return cleaned


class UserSerializer(serializers.ModelSerializer):
    password   = serializers.CharField(write_only=True, min_length=8)
    email      = serializers.EmailField(required=True)
    username   = serializers.CharField(min_length=3, max_length=150)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name  = serializers.CharField(required=False, allow_blank=True, max_length=150)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists")
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and @/./+/-/_ characters"
            )
        return value

    def create(self, validated_data):
        try:
            password = validated_data.pop('password')
            return User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=password,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
            )
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


# ============================================================================
# DAILY ACTIVITY SERIALIZER
# ============================================================================

class DailyActivitySerializer(serializers.ModelSerializer):
    aspect_name = serializers.CharField(source='aspect.get_display_name', read_only=True)

    class Meta:
        model  = DailyActivity
        fields = [
            'id', 'aspect', 'aspect_name', 'title',
            'completed', 'date', 'notes', 'completed_at', 'created_at',
        ]
        read_only_fields = ['id', 'completed_at', 'created_at']

    def validate(self, data):
        """
        Soft cap of 10 activities per day per aspect.
        The hard cap of 3 is removed — the frontend advisory modal handles
        the UX guidance. Days with zero activities are simply empty.
        """
        aspect = data.get('aspect')
        date   = data.get('date')

        if aspect and date:
            qs = DailyActivity.objects.filter(aspect=aspect, date=date)
            if self.instance:
                qs = qs.exclude(id=self.instance.id)
            if qs.count() >= 10:
                raise serializers.ValidationError(
                    {"aspect": "Maximum 10 activities allowed per day per aspect"}
                )
        return data


# ============================================================================
# MILESTONE SERIALIZER
# ============================================================================

class MilestoneSerializer(serializers.ModelSerializer):
    aspect_name = serializers.CharField(source='aspect.get_display_name', read_only=True)

    class Meta:
        model  = Milestone
        fields = [
            'id', 'aspect', 'aspect_name', 'milestone_type',
            'title', 'description', 'achieved', 'achieved_at',
            'badge_icon', 'badge_color', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'achieved_at']


# ============================================================================
# WEEKLY WRAPPED SERIALIZER
# ============================================================================

class WeeklyWrappedSerializer(serializers.ModelSerializer):
    aspect_name      = serializers.CharField(source='aspect.get_display_name', read_only=True)
    aspect_color     = serializers.CharField(source='aspect.color', read_only=True)
    aspect_icon      = serializers.CharField(source='aspect.icon', read_only=True)
    performance_emoji = serializers.CharField(read_only=True)
    is_improvement   = serializers.BooleanField(read_only=True)

    class Meta:
        model  = WeeklyWrapped
        fields = [
            'id', 'aspect', 'aspect_name', 'aspect_color', 'aspect_icon',
            'week_number', 'week_start_date', 'week_end_date',
            'total_days', 'locked_in_days', 'total_activities',
            'completed_activities', 'completion_rate',
            'longest_streak_this_week', 'ended_week_on_streak',
            'previous_week_completion_rate', 'improvement_percentage',
            'reflection_notes', 'proudest_moment',
            'generated_at', 'is_viewed',
            'performance_emoji', 'is_improvement',
        ]
        read_only_fields = ['id', 'generated_at']


# ============================================================================
# LIFE ASPECT SERIALIZERS
# ============================================================================

class LifeAspectSerializer(serializers.ModelSerializer):
    display_name       = serializers.CharField(source='get_display_name', read_only=True)
    days_elapsed       = serializers.IntegerField(read_only=True)
    days_remaining     = serializers.IntegerField(read_only=True, allow_null=True)
    progress_percentage = serializers.FloatField(read_only=True, allow_null=True)
    current_week       = serializers.IntegerField(read_only=True)
    total_weeks        = serializers.IntegerField(read_only=True, allow_null=True)
    is_forever         = serializers.BooleanField(read_only=True)

    # target_date is optional — null means "forever Lock"
    target_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model  = LifeAspect
        fields = [
            'id', 'aspect_type', 'custom_name', 'display_name',
            'start_date', 'target_date', 'duration_days',
            'why_statement', 'icon', 'color',
            'status', 'is_active', 'is_forever',
            'default_activities',
            'days_elapsed', 'days_remaining', 'progress_percentage',
            'current_week', 'total_weeks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'duration_days']

    def validate_default_activities(self, value):
        """Soft cap of 10. The advisory UI handles the 3-action guidance."""
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 daily activities allowed")
        return value

    def validate(self, data):
        start_date  = data.get('start_date')
        target_date = data.get('target_date')

        # Only validate date order when both are present
        if start_date and target_date and target_date <= start_date:
            raise serializers.ValidationError(
                {"target_date": "Target date must be after start date"}
            )

        if data.get('aspect_type') == 'custom' and not data.get('custom_name'):
            raise serializers.ValidationError(
                {"custom_name": "Custom name is required for custom aspects"}
            )

        return data


class AspectWithTodayStatsSerializer(LifeAspectSerializer):
    """
    LifeAspect with today's activities embedded.
    The view injects today_activities, milestones, recent_wraps,
    and current_streak directly into the serialized dict.
    This class exists so the import in views.py resolves cleanly.
    """
    class Meta(LifeAspectSerializer.Meta):
        pass


class AspectDetailSerializer(LifeAspectSerializer):
    """
    Full detail: aspect + nested activities, milestones, wraps.
    Used for read-only contexts like admin or exports.
    The main detail endpoint builds this manually for finer control.
    """
    recent_activities = DailyActivitySerializer(many=True, read_only=True, source='activities')
    milestones        = MilestoneSerializer(many=True, read_only=True)
    recent_wraps      = WeeklyWrappedSerializer(many=True, read_only=True, source='weekly_wraps')

    class Meta(LifeAspectSerializer.Meta):
        fields = LifeAspectSerializer.Meta.fields + [
            'recent_activities', 'milestones', 'recent_wraps',
        ]