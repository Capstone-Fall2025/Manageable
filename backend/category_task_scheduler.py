
from datetime import datetime, timedelta

# Lower weight = more important in sorting
CATEGORY_WEIGHTS = {
    "Assignments": 1,
    "Career": 2,
    "Health": 3,
    "Fun": 4,
    "General": 5,
}

def get_category(task):
    """
    Safely get category string from dict- or object-like task.
    Defaults to 'General' if missing.
    """
    if isinstance(task, dict):
        cat = task.get("category") or "General"
    else:
        cat = getattr(task, "category", "General")
    return cat if cat in CATEGORY_WEIGHTS else "General"

def get_priority(task):
    """
    Priority: 1 = Critical, 2 = High, 3 = Medium, 4 = Low, 5+ = None.
    Defaults to 3 (Medium) if missing/invalid.
    """
    try:
        if isinstance(task, dict):
            val = task.get("priority", 3)
        else:
            val = getattr(task, "priority", 3)
        return int(val)
    except Exception:
        return 3

def get_due_date(task):
    """
    Parse due_date as datetime.
    - If missing or invalid: return datetime.max so it goes last.
    - Accepts 'YYYY-MM-DD' or ISO strings, uses first 10 chars.
    """
    if isinstance(task, dict):
        due_str = task.get("due_date")
    else:
        due_str = getattr(task, "due_date", None)

    if not due_str:
        return datetime.max

    try:
        date_part = str(due_str)[:10]
        return datetime.strptime(date_part, "%Y-%m-%d")
    except Exception:
        return datetime.max

def estimate_minutes(task):
    """
    Heuristic duration estimate (in minutes).

    Rules:
    - If task has 'estimated_minutes', use that (min 15).
    - Else:
        base by priority:
          1: 90, 2: 60, 3: 45, 4: 30, 5+: 20
        if task has 'points' or 'points_possible', scale up to max 180.
    """
    # Manual override
    if isinstance(task, dict):
        est = task.get("estimated_minutes")
        points = task.get("points") or task.get("points_possible")
    else:
        est = getattr(task, "estimated_minutes", None)
        points = getattr(task, "points", None)

    if est is not None:
        try:
            return max(15, int(est))
        except Exception:
            pass

    prio = get_priority(task)
    base_by_priority = {
        1: 90,   # Critical
        2: 60,   # High
        3: 45,   # Medium
        4: 30,   # Low
        5: 20,   # Very low / none
    }
    base = base_by_priority.get(prio, 45)

    if points:
        try:
            p = float(points)
            base = max(base, min(int(p * 5), 180))  # 5 mins per point, cap 3h
        except Exception:
            pass

    return base

def sort_tasks(tasks):
    """
    Sort tasks by:
      1) category weight (Assignments, Career, Health, Fun, General)
      2) due date (earlier first)
      3) priority (1 critical → 5 none)
    """
    def sort_key(t):
        cat_weight = CATEGORY_WEIGHTS.get(get_category(t), 5)
        due_dt = get_due_date(t)
        prio = get_priority(t)
        return (cat_weight, due_dt, prio)

    return sorted(tasks, key=sort_key)

def build_schedule(tasks, daily_limit=240, work_block=50, break_block=10, day_start_hour=9):
    """
    Build a roadmap-like schedule.

    Returns a list of blocks:
      {
        "type": "work" | "break",
        "task_id": ...,
        "title": ...,
        "category": ...,
        "start": ISO_STRING,
        "end": ISO_STRING,
      }

    - Schedules tasks in order of sort_tasks().
    - Splits work into 50-minute blocks with 10-minute breaks between.
    - Limits to 'daily_limit' minutes of work per day, then spills into the next day.
    """
    sorted_tasks = sort_tasks(tasks)
    schedule = []

    now = datetime.now()
    current = now.replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
    if current < now:
        current = now

    remaining_today = daily_limit

    for task in sorted_tasks:
        duration = estimate_minutes(task)

        while duration > 0:
            if remaining_today < work_block:
                # Move to next day morning
                current = (current + timedelta(days=1)).replace(
                    hour=day_start_hour, minute=0, second=0, microsecond=0
                )
                remaining_today = daily_limit

            this_block = min(work_block, duration)
            start = current
            end = current + timedelta(minutes=this_block)

            schedule.append({
                "type": "work",
                "task_id": task.get("id") if isinstance(task, dict) else getattr(task, "id", None),
                "title": (task.get("title") or task.get("name"))
                    if isinstance(task, dict)
                    else (getattr(task, "title", None) or getattr(task, "name", None)),
                "category": get_category(task),
                "start": start.isoformat(),
                "end": end.isoformat(),
            })

            duration -= this_block
            current = end
            remaining_today -= this_block

            # insert a break if this task still has remaining duration
            if duration > 0 and remaining_today >= break_block:
                b_start = current
                b_end = current + timedelta(minutes=break_block)
                schedule.append({
                    "type": "break",
                    "start": b_start.isoformat(),
                    "end": b_end.isoformat(),
                })
                current = b_end
                remaining_today -= break_block

    return schedule

def compute_focus_points(tasks):
    """
    Focus points reward doing more urgent + important work.

    Returns:
      (earned_points, total_points)
    """
    total = 0.0
    earned = 0.0

    for t in tasks:
        cat_weight = CATEGORY_WEIGHTS.get(get_category(t), 5)
        prio = get_priority(t)
        minutes = estimate_minutes(t)

        # base points: 10 pts per 30 minutes
        base = (minutes / 30.0) * 10.0

        # category importance boost: Assignments > Career > Health > Fun > General
        importance_boost = (6 - cat_weight) * 0.2   # 0.2..1.0

        # priority boost: Critical > High > Medium > Low
        priority_boost = (6 - prio) * 0.15          # 0.15..0.75

        pts = base * (1 + importance_boost + priority_boost)
        total += pts

        completed = False
        if isinstance(t, dict):
            completed = bool(t.get("completed"))
        else:
            completed = bool(getattr(t, "completed", False))

        if completed:
            earned += pts

    return round(earned), round(total)
