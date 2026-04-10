# api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, Q, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import datetime, timedelta, date
from calendar import monthrange
import calendar
import logging

from .models import Task, LifeAspect, DailyActivity, WeeklyWrapped, Milestone
from .serializers import (
    TaskSerializer, UserSerializer, UserProfileSerializer,
    LifeAspectSerializer, DailyActivitySerializer,
    WeeklyWrappedSerializer, MilestoneSerializer,
    AspectWithTodayStatsSerializer,
)

logger = logging.getLogger(__name__)


# ============================================================================
# AUTH VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User registration.
    Uses atomic transaction so a post-creation failure rolls back the
    user row — preventing the 'account created but frontend got 500' bug.
    The Daily Tasks Lock signal is wrapped in its own try/except so it
    never causes this transaction to roll back.
    """
    try:
        serializer = UserSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user    = serializer.save()
            refresh = RefreshToken.for_user(user)

        return Response({
            'user':    UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return Response(
            {'error': 'Registration failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user':    UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Login error: {e}")
        return Response({'error': 'Login failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        token = RefreshToken(request.data.get('refresh_token'))
        token.blacklist()
        return Response({'message': 'Logged out'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response(UserProfileSerializer(request.user).data)


# ============================================================================
# LEGACY TASK VIEWS
# ============================================================================

def get_today_date_range():
    today = timezone.now().date()
    start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    end   = timezone.make_aware(datetime.combine(today, datetime.max.time()))
    return start, end


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request):
    try:
        if request.method == 'GET':
            start, end = get_today_date_range()
            tasks = Task.objects.filter(
                user=request.user, date__range=[start, end]
            ).order_by('id')
            return Response(TaskSerializer(tasks, many=True).data)

        elif request.method == 'POST':
            serializer = TaskSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, date=timezone.now())
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Task list error: {e}")
        return Response({'error': 'Failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(TaskSerializer(task).data)
    elif request.method == 'PATCH':
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_overview(request):
    try:
        month = int(request.GET.get('month', datetime.now().month))
        year  = int(request.GET.get('year',  datetime.now().year))
        if not (1 <= month <= 12):
            return Response({'error': 'Invalid month'}, status=status.HTTP_400_BAD_REQUEST)

        days_in_month = monthrange(year, month)[1]
        first = timezone.make_aware(datetime(year, month, 1, 0, 0, 0))
        last  = timezone.make_aware(datetime(year, month, days_in_month, 23, 59, 59))

        daily_agg = (
            Task.objects
            .filter(user=request.user, date__range=[first, last])
            .annotate(day=TruncDate('date'))
            .values('day')
            .annotate(
                total_tasks=Count('id'),
                completed_tasks=Count('id', filter=Q(completed=True))
            )
        )
        stats_by_day = {s['day']: s for s in daily_agg}

        daily_data   = []
        total_locked = 0
        total_active = 0

        for day_num in range(1, days_in_month + 1):
            d     = date(year, month, day_num)
            stats = stats_by_day.get(d, {'total_tasks': 0, 'completed_tasks': 0})
            total = stats['total_tasks']
            comp  = stats['completed_tasks']
            locked = total > 0 and total == comp

            if locked:   total_locked += 1
            if total > 0: total_active += 1

            daily_data.append({
                'day':             day_num,
                'date':            d.isoformat(),
                'total_tasks':     total,
                'completed_tasks': comp,
                'is_locked_in':    locked,
                'completion_rate': round((comp / total * 100) if total > 0 else 0, 2),
            })

        return Response({
            'month':        month,
            'year':         year,
            'month_name':   calendar.month_name[month],
            'days_in_month': days_in_month,
            'daily_data':   daily_data,
            'statistics': {
                'total_locked_in_days':   total_locked,
                'total_days_with_tasks':  total_active,
                'locked_in_percentage':   round((total_locked / days_in_month * 100), 2),
                'active_days_percentage': round((total_active / days_in_month * 100), 2),
            }
        })
    except Exception as e:
        logger.error(f"Monthly overview error: {e}")
        return Response({'error': 'Failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_overview(request):
    try:
        year  = int(request.GET.get('year', datetime.now().year))
        first = timezone.make_aware(datetime(year, 1, 1, 0, 0, 0))
        last  = timezone.make_aware(datetime(year, 12, 31, 23, 59, 59))

        locked_days = (
            Task.objects
            .filter(user=request.user, date__range=[first, last])
            .annotate(day=TruncDate('date'))
            .values('day')
            .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
            .filter(total=F('completed'))
        )

        by_month = {}
        for row in locked_days:
            m = row['day'].month
            by_month[m] = by_month.get(m, 0) + 1

        monthly_stats = []
        for m in range(1, 13):
            dim   = monthrange(year, m)[1]
            count = by_month.get(m, 0)
            monthly_stats.append({
                'month':              m,
                'month_name':         calendar.month_name[m],
                'days_in_month':      dim,
                'locked_in_days':     count,
                'locked_in_percentage': round((count / dim * 100), 2),
            })

        return Response({'year': year, 'monthly_stats': monthly_stats})
    except Exception as e:
        logger.error(f"Yearly overview error: {e}")
        return Response({'error': 'Failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_stats(request):
    start, end = get_today_date_range()
    stats = Task.objects.filter(
        user=request.user, date__range=[start, end]
    ).aggregate(
        total_tasks=Count('id'),
        completed_tasks=Count('id', filter=Q(completed=True))
    )
    total = stats['total_tasks']
    comp  = stats['completed_tasks']
    return Response({
        'date':            timezone.now().date().isoformat(),
        'total_tasks':     total,
        'completed_tasks': comp,
        'is_locked_in':    total > 0 and total == comp,
        'completion_rate': round((comp / total * 100) if total > 0 else 0, 2),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_tasks(request):
    date_str = request.GET.get('date')
    if not date_str:
        return Response({'error': 'Date required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        target = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

    start = timezone.make_aware(datetime.combine(target, datetime.min.time()))
    end   = timezone.make_aware(datetime.combine(target, datetime.max.time()))
    tasks = Task.objects.filter(user=request.user, date__range=[start, end]).order_by('id')
    ser   = TaskSerializer(tasks, many=True)
    comp  = sum(1 for t in ser.data if t['completed'])
    return Response({
        'date': date_str, 'tasks': ser.data,
        'total_tasks': len(ser.data), 'completed_tasks': comp,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_streak(request):
    try:
        today = timezone.now().date()
        locked_query = (
            Task.objects
            .filter(user=request.user)
            .annotate(day=TruncDate('date'))
            .values('day')
            .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
            .filter(total=F('completed'))
            .order_by('-day')
        )
        locked_dates   = {s['day'] for s in locked_query}
        total_locked   = len(locked_dates)
        current_streak = 0
        check          = today

        for _ in range(365):
            if check in locked_dates:
                current_streak += 1
                check -= timedelta(days=1)
            elif check == today:
                check -= timedelta(days=1)
                continue
            else:
                break

        month_start = date(today.year, today.month, 1)
        dim         = monthrange(today.year, today.month)[1]
        month_end   = date(today.year, today.month, dim)
        month_locked = sorted([d for d in locked_dates if month_start <= d <= month_end])
        best_month = streak_run = 0

        for day_num in range(1, dim + 1):
            if date(today.year, today.month, day_num) in month_locked:
                streak_run += 1
                best_month = max(best_month, streak_run)
            else:
                streak_run = 0

        today_stats = Task.objects.filter(
            user=request.user, date__date=today
        ).aggregate(
            total=Count('id'),
            completed=Count('id', filter=Q(completed=True))
        )
        today_locked = (
            today_stats['total'] > 0 and
            today_stats['total'] == today_stats['completed']
        )

        return Response({
            'current_streak':             current_streak,
            'total_locked_in_days':       total_locked,
            'highest_streak_this_month':  best_month,
            'today_locked_in':            today_locked,
            'today_total_tasks':          today_stats['total'],
            'today_completed_tasks':      today_stats['completed'],
            'streak_start_date': (
                (today - timedelta(days=current_streak - 1)).isoformat()
                if current_streak > 0 else None
            ),
        })
    except Exception as e:
        logger.error(f"Streak error: {e}")
        return Response({'error': 'Failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# HELPERS
# ============================================================================

def calculate_streak_for_aspect(aspect):
    """
    Consecutive locked-in days for an aspect.
    Days with ZERO activities are skipped — not counted as missed.
    This correctly handles the Daily Tasks Lock where the user
    may not add tasks every single day.
    """
    today = timezone.now().date()

    activity_by_date = (
        DailyActivity.objects
        .filter(aspect=aspect)
        .values('date')
        .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
        .filter(total__gt=0)
    )

    locked_in_dates = {
        row['date'] for row in activity_by_date
        if row['total'] == row['completed']
    }

    streak = 0
    check  = today
    for _ in range(365):
        if check in locked_in_dates:
            streak += 1
            check -= timedelta(days=1)
        elif check == today:
            check -= timedelta(days=1)
            continue
        else:
            break
    return streak


def get_aspect_or_404(pk, user):
    try:
        return LifeAspect.objects.get(pk=pk, user=user)
    except LifeAspect.DoesNotExist:
        return None


def auto_create_today_activities(aspect):
    """
    For sprint Locks: auto-create today's activities from default_activities.
    For the Daily Tasks Lock (no defaults): do nothing — user adds manually.
    Days with zero activities are simply empty, not missed.
    """
    today    = timezone.now().date()
    existing = DailyActivity.objects.filter(aspect=aspect, date=today)

    if existing.exists():
        return existing

    if aspect.default_activities:
        DailyActivity.objects.bulk_create([
            DailyActivity(aspect=aspect, title=title, date=today, completed=False)
            for title in aspect.default_activities
        ])

    return DailyActivity.objects.filter(aspect=aspect, date=today)


def check_and_unlock_milestones(aspect):
    today          = timezone.now().date()
    newly_unlocked = []

    milestone_defaults = {
        'streak_3':       ('3 Day Streak',    'Completed all activities 3 days in a row',  '#FF6B6B'),
        'streak_7':       ('7 Day Streak',    'Completed all activities 7 days in a row',  '#FF6B6B'),
        'streak_14':      ('14 Day Streak',   'Completed all activities 14 days in a row', '#FF6B6B'),
        'streak_30':      ('30 Day Streak',   'Completed all activities 30 days in a row', '#FF6B6B'),
        'week_perfect':   ('Perfect Week',    'Locked in every day for a full week',       '#FFD700'),
        'week_3_perfect': ('3 Perfect Weeks', 'Three perfect weeks in a row',              '#FFD700'),
        'halfway':        ('Halfway Point',   'Reached halfway through your sprint',       '#3B82F6'),
        'final_week':     ('Final Week',      'In the final week of your sprint',          '#8B5CF6'),
        'completed':      ('Goal Completed',  'Finished your entire sprint',               '#10B981'),
        'comeback':       ('Comeback',        'Back on track after missing a day',         '#F59E0B'),
    }

    existing = set(
        Milestone.objects.filter(aspect=aspect).values_list('milestone_type', flat=True)
    )
    for m_type, (title, desc, color) in milestone_defaults.items():
        if m_type not in existing:
            Milestone.objects.create(
                aspect=aspect, milestone_type=m_type,
                title=title, description=desc,
                badge_icon='trophy', badge_color=color,
            )

    unachieved     = Milestone.objects.filter(aspect=aspect, achieved=False)
    if not unachieved.exists():
        return []

    current_streak = calculate_streak_for_aspect(aspect)
    streak_map     = {'streak_3': 3, 'streak_7': 7, 'streak_14': 14, 'streak_30': 30}

    for m in unachieved.filter(milestone_type__in=streak_map):
        if current_streak >= streak_map[m.milestone_type]:
            m.achieved = True; m.achieved_at = timezone.now(); m.save()
            newly_unlocked.append(m)

    if aspect.progress_percentage and aspect.progress_percentage >= 50:
        for m in unachieved.filter(milestone_type='halfway'):
            m.achieved = True; m.achieved_at = timezone.now(); m.save()
            newly_unlocked.append(m)

    if aspect.days_remaining is not None and 0 < aspect.days_remaining <= 7:
        for m in unachieved.filter(milestone_type='final_week'):
            m.achieved = True; m.achieved_at = timezone.now(); m.save()
            newly_unlocked.append(m)

    if aspect.status == 'completed':
        for m in unachieved.filter(milestone_type='completed'):
            m.achieved = True; m.achieved_at = timezone.now(); m.save()
            newly_unlocked.append(m)

    return newly_unlocked


# ============================================================================
# ASPECT VIEWS
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def aspect_list(request):
    if request.method == 'GET':
        aspects = LifeAspect.objects.filter(user=request.user, is_active=True)
        today   = timezone.now().date()

        today_stats_qs = (
            DailyActivity.objects
            .filter(aspect__in=aspects, date=today)
            .values('aspect_id')
            .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
        )
        stats_map = {row['aspect_id']: row for row in today_stats_qs}

        activities_by_aspect = {}
        for act in DailyActivity.objects.filter(
            aspect__in=aspects, date=today
        ).order_by('id'):
            activities_by_aspect.setdefault(act.aspect_id, []).append(act)

        data = []
        for aspect in aspects:
            ser       = LifeAspectSerializer(aspect).data
            stats     = stats_map.get(aspect.id, {'total': 0, 'completed': 0})
            total     = stats['total']
            comp      = stats['completed']
            locked_in = total > 0 and total == comp

            ser['today_locked_in']        = locked_in
            ser['today_completion_count'] = comp
            ser['today_total_count']      = total
            ser['current_streak']         = calculate_streak_for_aspect(aspect)
            ser['today_activities']       = DailyActivitySerializer(
                activities_by_aspect.get(aspect.id, []), many=True
            ).data
            data.append(ser)

        return Response(data)

    elif request.method == 'POST':
        serializer = LifeAspectSerializer(data=request.data)
        if serializer.is_valid():
            aspect_type = request.data.get('aspect_type')
            
            # Block duplicate non-custom locks
            if aspect_type != 'custom':
                if LifeAspect.objects.filter(user=request.user, aspect_type=aspect_type).exists():
                    return Response(
                        {
                            'error': 'duplicate_lock',
                            'message': f"You already have a {dict(LifeAspect.ASPECT_TYPES).get(aspect_type, aspect_type)} Lock. Create a Custom Lock with your own name instead.",
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            aspect = serializer.save(user=request.user)
            check_and_unlock_milestones(aspect)
            return Response(LifeAspectSerializer(aspect).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def aspect_detail(request, pk):
    aspect = get_aspect_or_404(pk, request.user)
    if not aspect:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        today = timezone.now().date()
        auto_create_today_activities(aspect)

        today_activities = DailyActivity.objects.filter(aspect=aspect, date=today)
        milestones       = Milestone.objects.filter(aspect=aspect).order_by('achieved', '-achieved_at')
        recent_wraps     = WeeklyWrapped.objects.filter(aspect=aspect).order_by('-week_number')[:4]

        ser = LifeAspectSerializer(aspect).data
        ser['today_activities'] = DailyActivitySerializer(today_activities, many=True).data
        ser['milestones']       = MilestoneSerializer(milestones, many=True).data
        ser['recent_wraps']     = WeeklyWrappedSerializer(recent_wraps, many=True).data
        ser['current_streak']   = calculate_streak_for_aspect(aspect)
        return Response(ser)

    elif request.method == 'PATCH':
        serializer = LifeAspectSerializer(aspect, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            if request.data.get('status') == 'completed' and not aspect.completed_at:
                updated.completed_at = timezone.now()
                updated.is_active    = False
                updated.save()
                check_and_unlock_milestones(updated)
            return Response(LifeAspectSerializer(updated).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        aspect.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def aspect_stats(request, pk):
    aspect = get_aspect_or_404(pk, request.user)
    if not aspect:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    activity_by_date = (
        DailyActivity.objects
        .filter(aspect=aspect)
        .values('date')
        .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
        .order_by('date')
    )

    locked_dates  = set()
    partial_dates = set()
    calendar_data = []

    for row in activity_by_date:
        d       = row['date']
        total   = row['total']
        comp    = row['completed']
        locked  = total > 0 and total == comp
        partial = comp > 0 and not locked

        if locked:   locked_dates.add(d)
        elif partial: partial_dates.add(d)

        calendar_data.append({
            'date':            d.isoformat(),
            'total':           total,
            'completed':       comp,
            'is_locked_in':    locked,
            'is_partial':      partial,
            'completion_rate': round((comp / total * 100) if total > 0 else 0, 1),
        })

    total_tracked = len(locked_dates) + len(partial_dates)
    return Response({
        'aspect_id':             pk,
        'current_streak':        calculate_streak_for_aspect(aspect),
        'total_locked_in_days':  len(locked_dates),
        'total_partial_days':    len(partial_dates),
        'overall_locked_in_rate': round(
            (len(locked_dates) / total_tracked * 100) if total_tracked else 0, 1
        ),
        'days_elapsed':          aspect.days_elapsed,
        'days_remaining':        aspect.days_remaining,
        'progress_percentage':   aspect.progress_percentage,
        'calendar_data':         calendar_data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def aspect_calendar(request, pk):
    aspect = get_aspect_or_404(pk, request.user)
    if not aspect:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        month = int(request.GET.get('month', timezone.now().month))
        year  = int(request.GET.get('year',  timezone.now().year))
    except (ValueError, TypeError):
        month = timezone.now().month
        year  = timezone.now().year

    dim   = monthrange(year, month)[1]
    first = date(year, month, 1)
    last  = date(year, month, dim)

    activity_by_date = {
        row['date']: row
        for row in DailyActivity.objects
        .filter(aspect=aspect, date__range=[first, last])
        .values('date')
        .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
    }

    daily_data = []
    for day_num in range(1, dim + 1):
        d      = date(year, month, day_num)
        row    = activity_by_date.get(d)
        total  = row['total']    if row else 0
        comp   = row['completed'] if row else 0
        locked = total > 0 and total == comp
        daily_data.append({
            'day':          day_num,
            'date':         d.isoformat(),
            'total':        total,
            'completed':    comp,
            'is_locked_in': locked,
            'is_partial':   comp > 0 and not locked,
        })

    return Response({
        'aspect_id':  pk,
        'month':      month,
        'year':       year,
        'month_name': calendar.month_name[month],
        'daily_data': daily_data,
    })


# ============================================================================
# ACTIVITY VIEWS
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def activity_list(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()

    if request.method == 'GET':
        date_str = request.GET.get('date')
        target   = today
        if date_str:
            try:
                target = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        if target == today:
            auto_create_today_activities(aspect)

        activities = DailyActivity.objects.filter(aspect=aspect, date=target)
        total      = activities.count()
        comp       = activities.filter(completed=True).count()
        return Response({
            'date':        target.isoformat(),
            'activities':  DailyActivitySerializer(activities, many=True).data,
            'total':       total,
            'completed':   comp,
            'is_locked_in': total > 0 and total == comp,
        })

    elif request.method == 'POST':
        data = request.data.copy()
        data['aspect'] = aspect_id
        if 'date' not in data:
            data['date'] = today.isoformat()
        serializer = DailyActivitySerializer(data=data)
        if serializer.is_valid():
            return Response(
                DailyActivitySerializer(serializer.save()).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def activity_detail(request, pk):
    try:
        activity = DailyActivity.objects.select_related('aspect').get(
            pk=pk, aspect__user=request.user
        )
    except DailyActivity.DoesNotExist:
        return Response({'error': 'Activity not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(DailyActivitySerializer(activity).data)

    elif request.method == 'PATCH':
        serializer = DailyActivitySerializer(activity, data=request.data, partial=True)
        if serializer.is_valid():
            updated        = serializer.save()
            newly_unlocked = check_and_unlock_milestones(activity.aspect)
            response_data  = DailyActivitySerializer(updated).data
            response_data['newly_unlocked_milestones'] = MilestoneSerializer(
                newly_unlocked, many=True
            ).data
            return Response(response_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        activity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auto_create_activities(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    activities = auto_create_today_activities(aspect)
    return Response({
        'message':    'Activities ready',
        'activities': DailyActivitySerializer(activities, many=True).data,
    }, status=status.HTTP_201_CREATED)


# ============================================================================
# WEEKLY WRAPPED
# Saturday-only: wrapped can only be generated on Saturday or after week ends.
# ============================================================================

def _is_saturday_or_later(week_end_date):
    today = timezone.now().date()
    return today.weekday() == 5 or today > week_end_date


def _generate_wrapped_for_week(aspect, week_start):
    week_end         = week_start + timedelta(days=6)
    days_into_sprint = (week_start - aspect.start_date).days
    week_number      = max(1, (days_into_sprint // 7) + 1)

    locked_in = total_acts = comp_acts = streak = max_streak = 0

    for offset in range(7):
        day   = week_start + timedelta(days=offset)
        stats = DailyActivity.objects.filter(aspect=aspect, date=day).aggregate(
            total=Count('id'), completed=Count('id', filter=Q(completed=True))
        )
        total = stats['total']
        comp  = stats['completed']
        total_acts += total
        comp_acts  += comp

        if total > 0 and total == comp:
            locked_in += 1
            streak    += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 0

    completion_rate = round((comp_acts / total_acts * 100) if total_acts > 0 else 0, 1)
    prev_wrap       = WeeklyWrapped.objects.filter(
        aspect=aspect, week_number=week_number - 1
    ).first()
    prev_rate   = prev_wrap.completion_rate if prev_wrap else None
    improvement = round(completion_rate - prev_rate, 1) if prev_rate is not None else None

    wrapped, _ = WeeklyWrapped.objects.update_or_create(
        aspect=aspect, week_number=week_number,
        defaults={
            'week_start_date':              week_start,
            'week_end_date':                week_end,
            'total_days':                   7,
            'locked_in_days':               locked_in,
            'total_activities':             total_acts,
            'completed_activities':         comp_acts,
            'completion_rate':              completion_rate,
            'longest_streak_this_week':     max_streak,
            'ended_week_on_streak':         streak > 0,
            'previous_week_completion_rate': prev_rate,
            'improvement_percentage':       improvement,
        }
    )
    return wrapped


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_weekly_wrapped(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    date_str = request.data.get('week_start')
    if date_str:
        try:
            week_start = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        today      = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())

    week_end = week_start + timedelta(days=6)

    if not _is_saturday_or_later(week_end):
        today             = timezone.now().date()
        days_to_saturday  = (5 - today.weekday()) % 7
        saturday          = today + timedelta(days=days_to_saturday if days_to_saturday else 7)
        return Response({
            'error':          'not_saturday',
            'message':        'Your weekly wrapped is not ready yet. Come back on Saturday to see how your week went.',
            'available_from': saturday.isoformat(),
        }, status=status.HTTP_403_FORBIDDEN)

    wrapped = _generate_wrapped_for_week(aspect, week_start)
    return Response(WeeklyWrappedSerializer(wrapped).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wrapped_list(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    wraps = WeeklyWrapped.objects.filter(aspect=aspect).order_by('-week_number')
    return Response(WeeklyWrappedSerializer(wraps, many=True).data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def wrapped_detail(request, wrapped_id):
    try:
        wrapped = WeeklyWrapped.objects.select_related('aspect').get(
            pk=wrapped_id, aspect__user=request.user
        )
    except WeeklyWrapped.DoesNotExist:
        return Response({'error': 'Wrap not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if not wrapped.is_viewed:
            wrapped.is_viewed = True
            wrapped.save(update_fields=['is_viewed'])
        return Response(WeeklyWrappedSerializer(wrapped).data)

    elif request.method == 'PATCH':
        allowed    = {'reflection_notes', 'proudest_moment'}
        data       = {k: v for k, v in request.data.items() if k in allowed}
        serializer = WeeklyWrappedSerializer(wrapped, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# MILESTONE VIEWS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def milestone_list(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    milestones = Milestone.objects.filter(aspect=aspect).order_by('-achieved', '-achieved_at')
    return Response(MilestoneSerializer(milestones, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_milestones(request, aspect_id):
    try:
        aspect = LifeAspect.objects.get(pk=aspect_id, user=request.user)
    except LifeAspect.DoesNotExist:
        return Response({'error': 'Aspect not found'}, status=status.HTTP_404_NOT_FOUND)

    newly_unlocked = check_and_unlock_milestones(aspect)
    return Response({
        'newly_unlocked': MilestoneSerializer(newly_unlocked, many=True).data,
        'count':          len(newly_unlocked),
    })


# ============================================================================
# DASHBOARD & COMBINED
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    today   = timezone.now().date()
    aspects = LifeAspect.objects.filter(user=request.user, is_active=True)

    today_stats_qs = (
        DailyActivity.objects
        .filter(aspect__in=aspects, date=today)
        .values('aspect_id')
        .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
    )
    stats_map = {row['aspect_id']: row for row in today_stats_qs}

    activities_by_aspect = {}
    for act in DailyActivity.objects.filter(
        aspect__in=aspects, date=today
    ).order_by('id'):
        activities_by_aspect.setdefault(act.aspect_id, []).append(act)

    data               = []
    total_locked_today = 0

    for aspect in aspects:
        stats   = stats_map.get(aspect.id, {'total': 0, 'completed': 0})
        total   = stats['total']
        comp    = stats['completed']
        locked  = total > 0 and total == comp

        if locked:
            total_locked_today += 1

        ser = LifeAspectSerializer(aspect).data
        ser['today_locked_in']        = locked
        ser['today_completion_count'] = comp
        ser['today_total_count']      = total
        ser['current_streak']         = calculate_streak_for_aspect(aspect)
        ser['today_activities']       = DailyActivitySerializer(
            activities_by_aspect.get(aspect.id, []), many=True
        ).data
        data.append(ser)

    return Response({
        'date':    today.isoformat(),
        'aspects': data,
        'summary': {
            'total_aspects':    len(data),
            'locked_in_today':  total_locked_today,
            'all_locked_in':    total_locked_today == len(data) and len(data) > 0,
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def combined_stats(request):
    aspects    = LifeAspect.objects.filter(user=request.user)
    per_aspect = []
    grand_locked = grand_days = 0

    for aspect in aspects:
        stats = (
            DailyActivity.objects
            .filter(aspect=aspect)
            .values('date')
            .annotate(total=Count('id'), completed=Count('id', filter=Q(completed=True)))
            .filter(total__gt=0)
        )
        locked = sum(1 for s in stats if s['total'] == s['completed'])
        days   = len(stats)
        grand_locked += locked
        grand_days   += days

        per_aspect.append({
            'aspect_id':      aspect.id,
            'name':           aspect.get_display_name(),
            'color':          aspect.color,
            'icon':           aspect.icon,
            'locked_in_days': locked,
            'total_days':     days,
            'locked_in_rate': round((locked / days * 100) if days > 0 else 0, 1),
            'current_streak': calculate_streak_for_aspect(aspect),
            'status':         aspect.status,
        })

    return Response({
        'overall_locked_in_rate':      round(
            (grand_locked / grand_days * 100) if grand_days > 0 else 0, 1
        ),
        'grand_total_locked_in_days':  grand_locked,
        'per_aspect':                  per_aspect,
    })