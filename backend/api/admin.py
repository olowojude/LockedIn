# api/admin.py
from django.contrib import admin
from .models import Task, LifeAspect, DailyActivity, WeeklyWrapped, Milestone

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'completed', 'date']
    list_filter = ['completed', 'date', 'user']
    search_fields = ['title', 'user__username']
    date_hierarchy = 'date'

@admin.register(LifeAspect)
class LifeAspectAdmin(admin.ModelAdmin):
    list_display = ['get_display_name', 'user', 'aspect_type', 'status', 'start_date', 'target_date', 'progress_percentage']
    list_filter = ['aspect_type', 'status', 'is_active', 'created_at']
    search_fields = ['custom_name', 'user__username', 'why_statement']
    date_hierarchy = 'created_at'
    readonly_fields = ['duration_days', 'created_at', 'updated_at', 'days_elapsed', 'days_remaining', 'progress_percentage']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'aspect_type', 'custom_name')
        }),
        ('Goal Settings', {
            'fields': ('start_date', 'target_date', 'duration_days', 'why_statement')
        }),
        ('Customization', {
            'fields': ('icon', 'color')
        }),
        ('Activities', {
            'fields': ('default_activities',)
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'completed_at')
        }),
        ('Progress', {
            'fields': ('days_elapsed', 'days_remaining', 'progress_percentage')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'aspect', 'date', 'completed', 'completed_at']
    list_filter = ['completed', 'date', 'aspect__aspect_type']
    search_fields = ['title', 'aspect__custom_name', 'aspect__user__username']
    date_hierarchy = 'date'
    readonly_fields = ['completed_at', 'created_at']

@admin.register(WeeklyWrapped)
class WeeklyWrappedAdmin(admin.ModelAdmin):
    list_display = ['aspect', 'week_number', 'week_start_date', 'week_end_date', 'completion_rate', 'performance_emoji', 'is_viewed']
    list_filter = ['is_viewed', 'week_start_date', 'aspect__aspect_type']
    search_fields = ['aspect__custom_name', 'aspect__user__username']
    readonly_fields = ['generated_at', 'performance_emoji', 'is_improvement']
    date_hierarchy = 'week_start_date'

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'aspect', 'milestone_type', 'achieved', 'achieved_at']
    list_filter = ['achieved', 'milestone_type', 'aspect__aspect_type']
    search_fields = ['title', 'description', 'aspect__custom_name', 'aspect__user__username']
    readonly_fields = ['created_at', 'achieved_at']