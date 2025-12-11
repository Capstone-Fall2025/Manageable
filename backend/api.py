from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import json
import os
import re

from canvasAPI_utils import get_canvas_assignments
from category_task_scheduler import sort_tasks

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Manually added tasks (via Tasks page)
tasks = []

# Cached Canvas tasks
canvas_tasks = []


# ---------- KEYWORD KNOWLEDGE BASE ---------- #

DEFAULT_KEYWORD_RULES = {
    "email":        {"minutes": 25, "type": "communication", "weight": 1.0},
    "emails":       {"minutes": 25, "type": "communication", "weight": 1.0},
    "call":         {"minutes": 10, "type": "communication", "weight": 1.0},
    "phone call":   {"minutes": 15, "type": "communication", "weight": 1.2},
    "meeting":      {"minutes": 30, "type": "communication", "weight": 1.0},

    "homework":     {"minutes": 60, "type": "deep_work", "weight": 1.5},
    "hw":           {"minutes": 60, "type": "deep_work", "weight": 1.5},
    "problem set":  {"minutes": 75, "type": "deep_work", "weight": 1.8},
    "assignment":   {"minutes": 60, "type": "deep_work", "weight": 1.3},
    "project":      {"minutes": 90, "type": "deep_work", "weight": 2.0},
    "paper":        {"minutes": 90, "type": "deep_work", "weight": 2.0},
    "essay":        {"minutes": 90, "type": "deep_work", "weight": 2.0},
    "report":       {"minutes": 75, "type": "deep_work", "weight": 1.6},
    "study":        {"minutes": 45, "type": "study",     "weight": 1.2},
    "reading":      {"minutes": 30, "type": "study",     "weight": 1.0},
    "review":       {"minutes": 35, "type": "study",     "weight": 1.0},

    "quiz":         {"minutes": 30, "type": "assessment", "weight": 1.2},
    "exam":         {"minutes": 90, "type": "assessment", "weight": 2.0},
    "midterm":      {"minutes": 90, "type": "assessment", "weight": 2.0},
    "final":        {"minutes": 120, "type": "assessment","weight": 2.2},

    "application":  {"minutes": 45, "type": "career",   "weight": 1.5},
    "apply":        {"minutes": 45, "type": "career",   "weight": 1.5},
    "resume":       {"minutes": 30, "type": "career",   "weight": 1.2},
    "cover letter": {"minutes": 60, "type": "career",   "weight": 1.6},
    "network":      {"minutes": 30, "type": "career",   "weight": 1.2},
    "linkedin":     {"minutes": 30, "type": "career",   "weight": 1.2},

    "clean":        {"minutes": 20, "type": "life",     "weight": 1.0},
    "laundry":      {"minutes": 30, "type": "life",     "weight": 1.2},
    "groceries":    {"minutes": 30, "type": "life",     "weight": 1.0},
    "workout":      {"minutes": 40, "type": "health",   "weight": 1.2},
    "exercise":     {"minutes": 40, "type": "health",   "weight": 1.2},
    "walk":         {"minutes": 20, "type": "health",   "weight": 1.0},
}

KEYWORD_RULES = {}
PHRASE_RULES = []
WORD_RULES = {}


def load_keyword_rules():
    """
    Load rules from task_keywords.json if it exists.
    Lets you maintain a giant JSON with 1000+ patterns later.
    """
    global KEYWORD_RULES, PHRASE_RULES, WORD_RULES

    KEYWORD_RULES = DEFAULT_KEYWORD_RULES.copy()

    try:
        base_dir = os.path.dirname(__file__)
        path = os.path.join(base_dir, "task_keywords.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                user_rules = json.load(f)
            KEYWORD_RULES.update(user_rules)
            print(f"Loaded {len(user_rules)} custom keyword rules from task_keywords.json")
        else:
            print("task_keywords.json not found, using built-in keyword rules.")
    except Exception as e:
        print("Error loading task_keywords.json, using built-in keyword rules:", e)

    # split into phrases vs single words for faster matching
    PHRASE_RULES = []
    WORD_RULES = {}
    for key, info in KEYWORD_RULES.items():
        key_norm = key.lower().strip()
        if " " in key_norm:
            PHRASE_RULES.append((key_norm, info))
        else:
            WORD_RULES[key_norm] = info


load_keyword_rules()




def parse_due(due_str):
    """Parse many date formats into a naive datetime, or None."""
    if not due_str:
        return None

    try:
        ds = due_str.replace("Z", "")
        if len(ds) == 10:
            return datetime.strptime(ds, "%Y-%m-%d")
        return datetime.fromisoformat(ds)
    except Exception:
        try:
            return datetime.strptime(due_str[:10], "%Y-%m-%d")
        except Exception:
            return None


def combined_tasks(include_past=False):
    """
    Get all manual + Canvas tasks, optionally dropping past-due ones.
    Also tag them with origin: "manual" or "canvas".
    """
    global canvas_tasks

    # Try to refresh Canvas tasks
    try:
        canvas_tasks = get_canvas_assignments()
    except Exception as e:
        print("Error fetching Canvas assignments in combined_tasks:", e)

    combined = []

    # Manual tasks
    for t in tasks:
        c = dict(t)
        c.setdefault("origin", "manual")
        combined.append(c)

    # Canvas tasks
    for t in canvas_tasks or []:
        c = dict(t)
        c.setdefault("origin", "canvas")
        combined.append(c)

    if include_past:
        return combined

    now = datetime.now()
    upcoming = []
    for t in combined:
        due = parse_due(t.get("due_date"))
        if not due or due >= now:
            upcoming.append(t)
    return upcoming


def estimate_minutes(task):
    """
    Smart, efficient estimate of how long a task should take (in minutes),
    using:
      - Category priors
      - Keyword knowledge base (phrases + words)
      - Text complexity
      - Urgency (due date)
    """
    title = (task.get("title") or task.get("name") or "").lower()
    desc = (task.get("description") or "").lower()
    text = f"{title} {desc}".strip()
    cat = (task.get("category") or task.get("Category") or "General")

    # -----  Base by category ----- #
    if cat == "Assignments":
        base = 60
    elif cat == "Career":
        base = 45
    elif cat in ("Fun", "Health"):
        base = 25
    else:
        base = 30

    # ----- Keyword contributions ----- #
    applied = []

    #  phrases like "phone call", "problem set"
    full_text = text
    for phrase, info in PHRASE_RULES:
        if phrase in full_text:
            applied.append(info)

    #  single words
    tokens = re.findall(r"[a-zA-Z]+", full_text)
    for tok in tokens:
        info = WORD_RULES.get(tok.lower())
        if info:
            applied.append(info)

    if applied:
        
        num = float(base)
        den = 1.0
        for info in applied:
            m = info.get("minutes", base)
            w = info.get("weight", 1.0)
            num += m * w
            den += w
        keyword_estimate = num / den
        base = max(base, keyword_estimate)

    # ----- text complexity adjustment ----- #
    word_count = len(tokens)
    if word_count > 8:
        base *= 1.1
    if word_count > 20:
        base *= 1.25

    # ----- urgency adjustment ----- #
    due = parse_due(task.get("due_date"))
    if due:
        days = (due.date() - datetime.now().date()).days
        if days <= 1:
            base *= 1.5      # due today/tomorrow
        elif days <= 3:
            base *= 1.2      # 2–3 days
        elif days >= 10:
            base *= 0.8      # far away, less urgent

    
    base = int(round(base))
    return max(10, min(base, 180))   # between 10 min and 3 hours


def pert_estimate_from_likely(task):
    """
    Soft PERT: use estimate_minutes(task) as 'most likely' (M),
    derive optimistic (O) and pessimistic (P) from M,
    then compute PERT expected time and std dev.

    E = (O + 4M + P) / 6
    σ = (P - O) / 6
    """
    M = float(estimate_minutes(task))
    title = (task.get("title") or task.get("name") or "").lower()

    # Wider uncertainty for big/complex work (projects, exams, papers, etc.)
    if any(k in title for k in ["exam", "midterm", "final", "project", "paper", "essay"]):
        low_factor = 0.5   # 50% of M
        high_factor = 2.0  # 200% of M
    else:
        low_factor = 0.7   # 70% of M
        high_factor = 1.5  # 150% of M

    O = max(5.0, low_factor * M)
    P = min(240.0, high_factor * M)  # cap worst-case at 4 hours

    E = (O + 4 * M + P) / 6.0
    sigma = (P - O) / 6.0

    return {
        "optimistic": O,
        "most_likely": M,
        "pessimistic": P,
        "expected": E,
        "stddev": sigma,
    }


# ----------------- Routes to manage tasks ----------------- #

@app.route("/tasks", methods=["POST"])
def add_task():
    """
    Add a manual task.
    JSON example:
    {
        "title": "Update resume",
        "due_date": "2025-12-14",
        "category": "Career",
        "completed": false,
        "description": "Fix bullet points for internship"
    }
    """

    new_task = request.json or {}
    new_task["id"] = len(tasks) + 1
    new_task.setdefault("completed", False)
    new_task.setdefault("origin", "manual")  #  mark this as a manual task
    tasks.append(new_task)


    all_tasks = combined_tasks()
    sorted_tasks = sort_tasks(all_tasks)
    return jsonify(sorted_tasks), 200


@app.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    """
    Update fields on a manual task (e.g., completed: true).
    """
    data = request.json or {}
    updated = None

    for t in tasks:
        if t.get("id") == task_id:
            t.update(data)
            updated = t
            break

    if not updated:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(updated), 200


# ----------------- Canvas-only endpoints ----------------- #

@app.route("/canvas", methods=["POST"])
def update_canvas_tasks():
    global canvas_tasks
    canvas_tasks = request.json or []

    all_tasks = combined_tasks()
    sorted_tasks = sort_tasks(all_tasks)
    return jsonify(sorted_tasks), 200


@app.route("/canvas", methods=["GET"])
def get_canvas_tasks():
    return jsonify(canvas_tasks), 200


# ----------------- All tasks (Today and Upcoming list) ----------------- #

@app.route("/all", methods=["GET"])
def get_all_tasks():
    """
    Return sorted, upcoming tasks (manual + Canvas).
    This powers the Today & Upcoming list on the homepage.
    """
    try:
        upcoming = combined_tasks(include_past=False)
        sorted_tasks = sort_tasks(upcoming)

        
        for t in sorted_tasks:
            if isinstance(t.get("due_date"), datetime):
                t["due_date"] = t["due_date"].strftime("%Y-%m-%d")

        return jsonify(sorted_tasks), 200
    except Exception as e:
        print("Error combining tasks in /all:", e)
        return jsonify({"error": str(e)}), 500


# ----------------- Summary and Roadmap ----------------- #

@app.route("/summary", methods=["GET"])
def get_summary():
    """
    Return:
    - tasks_total, tasks_completed
    - focus_points_total, focus_points_earned
    - per_category counts (total, next_two_days)
    - schedule: list of work/break blocks for next few days
    Uses Soft PERT to decide how long tasks should take.
    """
    try:
        upcoming = combined_tasks(include_past=False)

        enriched = []
        now = datetime.now()

        for t in upcoming:
            obj = dict(t)
            obj["_due"] = parse_due(t.get("due_date"))
            enriched.append(obj)

        sorted_tasks = sort_tasks(enriched)

        # ---- basic stats ---- #
        tasks_total = len(sorted_tasks)
        tasks_completed = sum(1 for t in sorted_tasks if t.get("completed"))

        # Focus points: scale by total expected minutes from PERT
        total_minutes = 0.0
        for t in sorted_tasks:
            pert = pert_estimate_from_likely(t)
            total_minutes += pert["expected"]

        focus_points_total = int(round(total_minutes / 3))  # just a scaling factor
        focus_points_earned = tasks_completed * 10          # simple: 10 pts per completed task

        # ---- per-category stats ---- #
        per_category = {}
        two_days = now + timedelta(days=2)

        for t in sorted_tasks:
            cat = t.get("category") or t.get("Category") or "General"
            d = t.get("_due")
            info = per_category.setdefault(cat, {"total": 0, "next_two_days": 0})
            info["total"] += 1
            if d and now <= d <= two_days:
                info["next_two_days"] += 1

        # ---- schedule / roadmap ---- #
        # Next 4 days, up to 4 work blocks/day.
        # Each block: 30 min work + 10 min break.
        # Each task gets Soft PERT expected minutes and may span multiple blocks.
        schedule = []
        if sorted_tasks:
            start_base = datetime(now.year, now.month, now.day, 10, 0)  # start 10:00 today

            max_days = 4
            blocks_per_day = 4
            block_minutes = 30
            break_minutes = 10

            task_index = 0
            remaining_for_task = 0.0
            current_task = None

            for day_offset in range(max_days):
                day_start = start_base + timedelta(days=day_offset)
                block_start = day_start

                for _ in range(blocks_per_day):
                    # No current task and nothing remaining so done
                    if task_index >= len(sorted_tasks) and remaining_for_task <= 0:
                        break

                    # Pick next task if needed
                    if remaining_for_task <= 0:
                        if task_index >= len(sorted_tasks):
                            break
                        current_task = sorted_tasks[task_index]
                        task_index += 1
                        pert = pert_estimate_from_likely(current_task)
                        remaining_for_task = pert["expected"]  # Soft PERT expected minutes

                    title = current_task.get("title") or current_task.get("name") or "Task"
                    category = current_task.get("category") or current_task.get("Category") or "General"

                    this_block = min(block_minutes, remaining_for_task)
                    work_end = block_start + timedelta(minutes=this_block)

                    # Work block
                    schedule.append(
                        {
                            "type": "work",
                            "title": title,
                            "category": category,
                            "start": block_start.isoformat(),
                            "end": work_end.isoformat(),
                        }
                    )

                    remaining_for_task -= this_block

                    # Break block after each work block
                    break_start = work_end
                    break_end = break_start + timedelta(minutes=break_minutes)
                    schedule.append(
                        {
                            "type": "break",
                            "title": "Break",
                            "category": "Break",
                            "start": break_start.isoformat(),
                            "end": break_end.isoformat(),
                        }
                    )

                    block_start = break_end

        result = {
            "tasks_total": tasks_total,
            "tasks_completed": tasks_completed,
            "focus_points_total": focus_points_total,
            "focus_points_earned": focus_points_earned,
            "per_category": per_category,
            "schedule": schedule,
        }

        return jsonify(result), 200

    except Exception as e:
        print("Error building summary:", e)
        return jsonify({"error": str(e)}), 500


# ----------------- Mochi motivation ----------------- #

@app.route("/motivation", methods=["GET"])
def get_motivation():
    messages = [
        "Let's just start with 10 focused minutes. We can always stop after that. ",
        "Tiny progress is still progress. I'm proud of you. ",
        "Breaks are part of productivity, not the opposite of it. ",
        "Your future self is already thanking you for showing up today. ",
        "You don't need to be perfect; just keep moving gently forward. ",
        "Deep breath. You've handled harder days than this. ",
    ]
    return jsonify({"message": random.choice(messages)}), 200


if __name__ == "__main__":
    app.run(debug=True)
