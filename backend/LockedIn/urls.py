# LockedIn/urls.py
from django.contrib import admin
from django.urls import path, re_path
from api import views
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse, FileResponse
from django.conf import settings
import os


def health_check(request):
    return JsonResponse({"status": "ok"})


def serve_react(request, *args, **kwargs):
    """
    Catch-all view: serves the React index.html for any URL that isn't
    an API or admin route. This lets React Router handle client-side
    navigation on page refresh without Django returning a 404.

    In production, your web server (Nginx, etc.) should handle this instead.
    In development, this lets you refresh /aspects, /analytics, etc. freely.
    """
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')

    # If you haven't built the frontend yet, return a helpful message
    if not os.path.exists(index_path):
        return JsonResponse(
            {
                "error": "Frontend not built",
                "hint": "Run `npm run build` in the frontend directory, or use the Vite dev server on port 5173 instead of accessing Django directly."
            },
            status=404
        )

    return FileResponse(open(index_path, 'rb'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check),

    # ── Auth ──────────────────────────────────────────────────────────────────
    path('api/auth/register/', views.register,               name='register'),
    path('api/auth/login/',    views.login,                  name='login'),
    path('api/auth/logout/',   views.logout,                 name='logout'),
    path('api/auth/refresh/',  TokenRefreshView.as_view(),   name='token_refresh'),
    path('api/auth/profile/',  views.user_profile,           name='user_profile'),

    # ── Legacy tasks ───────────────────────────────────────────────────────────
    path('api/tasks/',          views.task_list,   name='task-list'),
    path('api/tasks/<int:pk>/', views.task_detail, name='task-detail'),

    # ── Analytics ──────────────────────────────────────────────────────────────
    path('api/monthly-overview/', views.monthly_overview, name='monthly_overview'),
    path('api/yearly-overview/',  views.yearly_overview,  name='yearly_overview'),
    path('api/daily-stats/',      views.daily_stats,      name='daily_stats'),
    path('api/daily-tasks/',      views.daily_tasks,      name='daily_tasks'),
    path('api/user-streak/',      views.user_streak,      name='user_streak'),

    # ── Dashboard & combined ───────────────────────────────────────────────────
    path('api/dashboard/',      views.dashboard,      name='dashboard'),
    path('api/combined-stats/', views.combined_stats, name='combined_stats'),

    # ── Aspects (Locks) ────────────────────────────────────────────────────────
    path('api/aspects/',                              views.aspect_list,     name='aspect-list'),
    path('api/aspects/<int:pk>/',                     views.aspect_detail,   name='aspect-detail'),
    path('api/aspects/<int:pk>/stats/',               views.aspect_stats,    name='aspect-stats'),
    path('api/aspects/<int:pk>/calendar/',            views.aspect_calendar, name='aspect-calendar'),

    # ── Activities ─────────────────────────────────────────────────────────────
    path('api/aspects/<int:aspect_id>/activities/',            views.activity_list,       name='activity-list'),
    path('api/activities/<int:pk>/',                           views.activity_detail,     name='activity-detail'),
    path('api/aspects/<int:aspect_id>/auto-create-activities/', views.auto_create_activities, name='auto-create-activities'),

    # ── Weekly Wrapped ─────────────────────────────────────────────────────────
    path('api/aspects/<int:aspect_id>/wrapped/',          views.wrapped_list,           name='wrapped-list'),
    path('api/aspects/<int:aspect_id>/generate-wrapped/', views.generate_weekly_wrapped, name='generate-wrapped'),
    path('api/wrapped/<int:wrapped_id>/',                 views.wrapped_detail,          name='wrapped-detail'),

    # ── Milestones ─────────────────────────────────────────────────────────────
    path('api/aspects/<int:aspect_id>/milestones/',       views.milestone_list,  name='milestone-list'),
    path('api/aspects/<int:aspect_id>/check-milestones/', views.check_milestones, name='check-milestones'),

    # ── React catch-all — MUST be last ────────────────────────────────────────
    # Any URL that doesn't match an API route gets served index.html,
    # letting React Router take over client-side.
    re_path(r'^(?!api/|admin/|health/).*$', serve_react, name='react-app'),
]