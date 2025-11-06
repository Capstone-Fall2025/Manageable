from datetime import datetime

# Lower = higher importance
CATEGORY_WEIGHTS = {
    "Assignments": 1,
    "Career": 2,
    "Health": 3,
    "Fun": 4,
    "General": 5
} # For canvas assignments I am using category 1 AND weight value - will look more into this #

def sort_tasks(tasks):
    """
    Sorts tasks by category weight, priority, and due date
    Handles both manual Flask tasks and Canvas assignments
    """
        
    def get_due_date(task):
        due_str = None

        if isinstance(task, dict):
            due_str = task.get("due_date") or task.get("due_at")
        else:
            due_str = getattr(task, "due_date", None)

        if not due_str:
            return datetime.max  # push undated tasks to the bottom

        # try to parse multiple possible formats - error with adding the date for manual tasks
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(due_str.strip(), fmt)
            except Exception:
                continue


        return datetime.max


    def get_category(task):
        cat = task.get("category") if isinstance(task, dict) else getattr(task, "category", "General")
        return cat if cat in CATEGORY_WEIGHTS else "General"

    def get_priority(task):
        try:
            return int(task.get("priority") if isinstance(task, dict) else getattr(task, "priority", 3))
        except Exception:
            return 3


    def sort_key(task):
        group_weight = float(task.get("group_weight", 0)) if isinstance(task, dict) else getattr(task, "group_weight", 0)
        return (
            get_due_date(task),                          # Soonest due date first
            CATEGORY_WEIGHTS.get(get_category(task), 5), # Then by category
            -group_weight,                               # Higher course weight next
            get_priority(task)                           # Lower priority number = higher rank
        )

    return sorted(tasks, key=sort_key)
