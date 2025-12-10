"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../components/Navbar";
import "../styles/Home.css";

// Map backend categories  
const CATEGORY_COLUMNS = [
  { key: "Assignments", label: "STUDENT" }, // school work
  { key: "Career", label: "CAREER" },
  { key: "Fun", label: "HOBBIES" },        
];

function parseDueDate(due) {
  if (!due) return null;
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinNextDays(date, days = 2) {
  if (!date) return false;
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);
  return date >= now && date <= end;
}

function formatTimeOrDate(due) {
  const d = parseDueDate(due);
  if (!d) return "";

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  return d.toLocaleDateString();
}

function taskKey(task) {
  return task.id ?? `${task.title}-${task.due_date ?? ""}`;
}



function buildMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const firstDayOfWeek = first.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}



function ScheduleModal({ tasks, selectedDate, setSelectedDate, onClose }) {
  const [monthView, setMonthView] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const monthDays = useMemo(() => buildMonthDays(monthView), [monthView]);

  const scheduleTasks = useMemo(() => {
    return tasks
      .map((t) => ({ ...t, _due: parseDueDate(t.due_date) }))
      .filter((t) => t._due && sameDay(t._due, selectedDate))
      .sort((a, b) => a._due - b._due);
  }, [tasks, selectedDate]);

  const monthLabel = monthView.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  function goMonth(offset) {
    setMonthView((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  }

  function handleDayClick(day) {
    if (!day) return;
    setSelectedDate(
      new Date(monthView.getFullYear(), monthView.getMonth(), day)
    );
  }

  return (
    <div className="schedule-backdrop">
      <div className="schedule-modal">
        <header className="schedule-header">
          <div>
            <h2 className="schedule-title">Full Schedule</h2>
            <p className="schedule-subtitle">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button className="schedule-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="schedule-body">
          {/* Calendar */}
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => goMonth(-1)}>{"<"}</button>
              <span>{monthLabel}</span>
              <button onClick={() => goMonth(1)}>{">"}</button>
            </div>

            <div className="calendar-weekdays">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {monthDays.map((day, idx) => {
                if (day === null) return <div key={idx} />;
                const dateObj = new Date(
                  monthView.getFullYear(),
                  monthView.getMonth(),
                  day
                );
                const isSelected = sameDay(dateObj, selectedDate);
                return (
                  <button
                    key={idx}
                    className={
                      "calendar-day" + (isSelected ? " calendar-day-selected" : "")
                    }
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day schedule */}
          <div className="schedule-list">
            <h3 className="schedule-list-title">Day&apos;s Schedule</h3>
            {scheduleTasks.length === 0 ? (
              <p className="schedule-empty">No tasks scheduled for this day.</p>
            ) : (
              <div className="schedule-items">
                {scheduleTasks.map((task) => (
                  <div key={taskKey(task)} className="schedule-item">
                    <div className="schedule-item-content">
                      <p className="schedule-item-title">{task.title}</p>
                      {task.category && (
                        <p className="schedule-item-category">
                          {task.category}
                        </p>
                      )}
                    </div>
                    {task._due && (
                      <span className="schedule-item-time">
                        {task._due.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [completedKeys, setCompletedKeys] = useState(new Set());
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Load tasks from Flask backend
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("http://127.0.0.1:5000/all");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    }
    fetchTasks();
  }, []);

  // Helper: is this task completed? (uses backend field if you add one later)
  const isTaskCompleted = (task) => {
    const key = taskKey(task);
    return task.completed === true || completedKeys.has(key);
  };

  // Toggle completion (currently only in frontend state)
  function toggleComplete(task) {
    const key = taskKey(task);
    const willBeCompleted = !completedKeys.has(key);

    setCompletedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

    // Also update the task list so other calculations use the new value
    setTasks((prev) =>
      prev.map((t) =>
        taskKey(t) === key ? { ...t, completed: willBeCompleted } : t
      )
    );


  }

  /* ---------- STATS CALCULATIONS ---------- */

  const {
    totalTasks,
    completedTasks,
    tasksThisWeek,
    completedThisWeek,
    completionRateThisWeek,
    streakDays,
    focusPoints,
  } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    let total = tasks.length;
    let completed = 0;

    const tasksInWeek = [];
    let completedInWeek = 0;

    const completedDates = new Set(); // for streak

    for (const t of tasks) {
      const due = parseDueDate(t.due_date);
      const completedFlag = isTaskCompleted(t);

      if (completedFlag) {
        completed += 1;
        if (due) completedDates.add(due.toDateString());
      }

      if (due && due >= weekAgo && due <= now) {
        tasksInWeek.push(t);
        if (completedFlag) completedInWeek += 1;
      }
    }

    // streak: how many consecutive days (up to today) have at least 1 completed task
    let streak = 0;
    const cursor = new Date(now);
    while (true) {
      const key = cursor.toDateString();
      if (completedDates.has(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    const completionRate =
      tasksInWeek.length === 0
        ? 0
        : (completedInWeek / tasksInWeek.length) * 100;

    const points = completedInWeek * 10; // 10 pts per completed task this week

    return {
      totalTasks: total,
      completedTasks: completed,
      tasksThisWeek: tasksInWeek.length,
      completedThisWeek: completedInWeek,
      completionRateThisWeek: completionRate,
      streakDays: streak,
      focusPoints: points,
    };
  }, [tasks, completedKeys]);

  /* ---------- TASK COLUMNS (NEXT 2 DAYS) ---------- */

  const upcomingByCategory = useMemo(() => {
    const map = {};
    for (const col of CATEGORY_COLUMNS) {
      map[col.key] = [];
    }

    for (const t of tasks) {
      const due = parseDueDate(t.due_date);
      if (!isWithinNextDays(due, 2)) continue;

      const cat = t.category || t.Category;
      if (!cat) continue;
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    }

    // limit to max 4 per column
    for (const key of Object.keys(map)) {
      map[key] = map[key].slice(0, 4);
    }
    return map;
  }, [tasks]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="home">
      <NavBar />

      <main className="home-content">
    
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome to Manageable!</h1>
            <p className="dashboard-subtitle">{todayLabel}</p>
          </div>

          <button
            className="schedule-button"
            type="button"
            onClick={() => setShowSchedule(true)}
          >
            🗓 Schedule
          </button>
        </header>

        {/* Stats row – now dynamic */}
        <section className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Tasks Completed</p>
            <p className="stat-main">
              {completedTasks} / {totalTasks || 0}
            </p>
            <p className="stat-badge">
              {tasksThisWeek === 0
                ? "No tasks this week yet"
                : `${completedThisWeek}/${tasksThisWeek} this week · ${completionRateThisWeek.toFixed(
                    0
                  )}%`}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Current Streak</p>
            <p className="stat-main">
              {streakDays} {streakDays === 1 ? "day" : "days"}
            </p>
            <p className="stat-badge">
              {streakDays === 0
                ? "Finish one task today to start a streak"
                : "Keep it going! 🔥"}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Focus Points</p>
            <p className="stat-main">{focusPoints} pts</p>
            <p className="stat-badge">
              10 pts per task finished this week
            </p>
          </div>
        </section>

        {/* Task columns */}
        <section className="task-columns">
          {CATEGORY_COLUMNS.map((col) => {
            const list = upcomingByCategory[col.key] || [];
            const doneCount = list.filter((t) => isTaskCompleted(t)).length;

            return (
              <div key={col.key} className="task-column">
                <div className="task-column-header">
                  <span className="task-column-title">{col.label}</span>
                  <span className="task-column-progress">
                    {doneCount}/{list.length || 0}
                  </span>
                </div>

                <div className="task-list">
                  {list.length === 0 ? (
                    <p className="task-empty">No tasks in the next 2 days.</p>
                  ) : (
                    list.map((task) => {
                      const key = taskKey(task);
                      const done = isTaskCompleted(task);
                      return (
                        <div key={key} className="task-card">
                          <button
                            type="button"
                            className={
                              "task-checkbox" +
                              (done ? " task-checkbox-checked" : "")
                            }
                            onClick={() => toggleComplete(task)}
                          >
                            {done && <span className="task-checkbox-dot" />}
                          </button>

                          <div className="task-card-content">
                            <p
                              className={
                                "task-title" + (done ? " task-title-done" : "")
                              }
                            >
                              {task.title}
                            </p>
                            <p className="task-meta">
                              {formatTimeOrDate(task.due_date)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {showSchedule && (
          <ScheduleModal
            tasks={tasks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onClose={() => setShowSchedule(false)}
          />
        )}
      </main>
    </div>
  );
}
