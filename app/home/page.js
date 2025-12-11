"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../components/Navbar";
import "../styles/Home.css";



function parseDueDate(due) {
  if (!due) return null;
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatTimeOrDate(due) {
  const d = parseDueDate(due);
  if (!d) return "No due date";

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

/** Map backend categories  */
const CATEGORY_TO_CARD = {
  Assignments: "STUDENT",
  Career: "CAREER",
  Fun: "HOBBIES",
  Health: "HOBBIES",
  General: "STUDENT",
};

const CARD_LABELS = {
  STUDENT: "Student",
  CAREER: "Career",
  HOBBIES: "Hobbies",
};

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* --------- Home Page --------- */

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cat state
  const [catMessage, setCatMessage] = useState(
    "Hi, I'm Mochi. Let's have a gentle, productive day. "
  );
  const [catLoading, setCatLoading] = useState(false);
  const [catHappy, setCatHappy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        await Promise.all([fetchTasks(), fetchSummary(), fetchCatMessage()]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  async function fetchSummary() {
    try {
      const res = await fetch("http://127.0.0.1:5000/summary");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSummary(data || null);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  }

  async function fetchCatMessage() {
    try {
      setCatLoading(true);
      const res = await fetch("http://127.0.0.1:5000/motivation");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCatMessage(data.message || "I'm rooting for you today. ");
    } catch (err) {
      console.error("Error fetching motivation:", err);
      setCatMessage("Even when tech breaks, you're still doing your best. ");
    } finally {
      setCatLoading(false);
      setCatHappy(true);
      setTimeout(() => setCatHappy(false), 700);
    }
  }

  // Toggle completion – PATCH to backend when we have an id
  async function toggleComplete(task) {
    const key = taskKey(task);
    const newValue = !task.completed;
    const isManual = task.origin === "manual"; 
  
    // --------- CASE 1: Canvas / non-manual task ----------
    if (!isManual) {
      // Just toggle locally
      setTasks(prev =>
        prev.map(t =>
          taskKey(t) === key ? { ...t, completed: newValue } : t
        )
      );
  
      // Refresh summary (rings, focus points, roadmap)
      await fetchSummary();
  
      return;
    }
  
    // --------- CASE 2: Manual task (backend PATCH) ----------
    try {
      const res = await fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newValue }),
      });
  
      if (!res.ok) {
        console.error("Failed to toggle completion from home");
        return;
      }
  
      const updatedTask = await res.json();
  
      // Update local state
      setTasks(prev =>
        prev.map(t =>
          t.id === updatedTask.id ? { ...t, ...updatedTask } : t
        )
      );
  
      // Refresh summary so stats + roadmap update
      await fetchSummary();
    } catch (err) {
      console.error("Error toggling completion from home:", err);
    }
  }
  
  

  /* --------- Derived stats --------- */

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const tasksDueToday = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return tasks.filter(t => (t.due_date || "").slice(0, 10) === todayStr)
      .length;
  }, [tasks]);

  // For category rings
  function getCardCounts(cardKey) {
    if (!summary || !summary.per_category) return { total: 0, nextTwo: 0 };

    let total = 0;
    let nextTwo = 0;

    for (const [cat, vals] of Object.entries(summary.per_category)) {
      if (CATEGORY_TO_CARD[cat] === cardKey) {
        total += vals.total || 0;
        nextTwo += vals.next_two_days || 0;
      }
    }

    return { total, nextTwo };
  }

  // “Today & Upcoming” – first few tasks
  const todayAndUpcoming = tasks;

  // Roadmap: group schedule blocks by weekday
  const roadmapByDay = useMemo(() => {
    const out = {};
    if (!summary?.schedule) return out;

    summary.schedule.forEach(block => {
      const d = new Date(block.start);
      if (Number.isNaN(d.getTime())) return;
      const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        d.getDay()
      ];
      if (!out[dayLabel]) out[dayLabel] = [];
      out[dayLabel].push(block);
    });

    // sort blocks in each day by time
    Object.values(out).forEach(list =>
      list.sort((a, b) => new Date(a.start) - new Date(b.start))
    );

    return out;
  }, [summary]);

  /* --------- UI --------- */

  return (
    <div className="home-shell">
      <NavBar />

      <main className="home-main">
        {/* HERO ROW */}
        <section className="hero-row">
          {/* Left: cat + welcome + main stats */}
          <div className="hero-card">
            <div className="hero-top">
              <div className="hero-text">
                <p className="hero-kicker">Welcome back</p>
                <h1 className="hero-title">Let&apos;s make your day manageable.</h1>
                <p className="hero-date">{todayLabel}</p>
              </div>

              {/* Cat companion */}
              <div className="hero-cat-area">
                <button
                  type="button"
                  className={`cat-character ${catHappy ? "cat-happy" : ""}`}
                  onClick={fetchCatMessage}
                  aria-label="Click Mochi for a motivational message"
                >
                  <div className="cat-face">
                    <div className="cat-ear cat-ear-left" />
                    <div className="cat-ear cat-ear-right" />
                    <div className="cat-eyes">
                      <span className="cat-eye" />
                      <span className="cat-eye" />
                    </div>
                    <div className="cat-mouth" />
                    <div className="cat-whiskers cat-whiskers-left" />
                    <div className="cat-whiskers cat-whiskers-right" />
                  </div>
                </button>

                <div className="cat-bubble">
                  {catLoading
                    ? "Mochi is thinking of something encouraging…"
                    : catMessage}
                </div>
                <p className="cat-caption">Click Mochi for a pep talk </p>
              </div>
            </div>

            {/* Main stats: completion, focus, due today */}
            <div className="hero-stats">
              <div className="hero-stat-card">
                <p className="hero-stat-label">Tasks Completed</p>
                <div className="hero-stat-main">
                  <span className="hero-stat-number">
                    {summary?.tasks_completed ?? 0}
                  </span>
                  <span className="hero-stat-sublabel">
                    / {summary?.tasks_total ?? 0}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        summary && summary.tasks_total
                          ? `${
                              (summary.tasks_completed /
                                Math.max(summary.tasks_total, 1)) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="hero-stat-footnote">
                  {summary?.tasks_total
                    ? "Every checkmark gives you more breathing room."
                    : "No tasks yet — add some from the Tasks page."}
                </p>
              </div>

              <div className="hero-stat-card">
                <p className="hero-stat-label">Focus Points</p>
                <div className="hero-stat-main">
                  <span className="hero-stat-number">
                    {summary?.focus_points_earned ?? 0}
                  </span>
                  <span className="hero-stat-sublabel">
                    / {summary?.focus_points_total ?? 0}
                  </span>
                </div>
                <div className="xp-bar">
                  <div
                    className="xp-fill"
                    style={{
                      width:
                        summary && summary.focus_points_total
                          ? `${
                              (summary.focus_points_earned /
                                Math.max(summary.focus_points_total, 1)) *
                              100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
                <p className="hero-stat-footnote">
                  Earn points by finishing higher-impact tasks.
                </p>
              </div>

              <div className="hero-stat-card">
                <p className="hero-stat-label">Due Today</p>
                <div className="hero-stat-main">
                  <span className="hero-stat-number">{tasksDueToday}</span>
                </div>
                <p className="hero-stat-footnote">
                  We'll prioritize these in your roadmap.
                </p>
              </div>
            </div>
          </div>

          {/* Right: category progress rings */}
          <div className="hero-right">
            {["STUDENT", "CAREER", "HOBBIES"].map(key => {
              const { total, nextTwo } = getCardCounts(key);
              const pct = total ? Math.round((nextTwo / total) * 100) : 0;

              return (
                <div key={key} className="category-ring-card">
                  <div className="ring-wrapper">
                    <svg className="ring" viewBox="0 0 36 36">
                      <path
                        className="ring-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="ring-fg"
                        strokeDasharray={`${pct}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="ring-center">{pct}%</span>
                  </div>
                  <div className="ring-info">
                    <p className="ring-title">{CARD_LABELS[key]}</p>
                    <p className="ring-sub">
                      {nextTwo} due in 2 days · {total} total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* LOWER GRID: tasks list + roadmap grid */}
        <section className="lower-grid">
          {/* Today & Upcoming */}
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Today &amp; Upcoming</h2>
                <p className="panel-sub">Your next few moves.</p>
              </div>
              <span className="panel-pill">
                Showing up to {todayAndUpcoming.length} tasks
              </span>
            </div>

            {loading ? (
              <p className="panel-empty">Loading tasks…</p>
            ) : todayAndUpcoming.length === 0 ? (
              <p className="panel-empty">
                No upcoming tasks. You&apos;re all caught up!
              </p>
            ) : (
              <div className="task-list">
                {todayAndUpcoming.map(task => {
                  const key = taskKey(task);
                  const done = !!task.completed;
                  const cat = task.category || "General";

                  return (
                    <div key={key} className="task-row">
                      <button
                        type="button"
                        className={
                          "task-check" + (done ? " task-check-checked" : "")
                        }
                        onClick={() => toggleComplete(task)}
                      >
                        {done && <span className="task-check-dot" />}
                      </button>
                      <div className="task-main">
                        <p
                          className={
                            "task-title" + (done ? " task-title-done" : "")
                          }
                        >
                          {task.title || task.name}
                        </p>
                        <div className="task-meta">
                          <span>{formatTimeOrDate(task.due_date)}</span>
                          <span className="pill">{cat}</span>
                          {task.html_url && (
                            <span className="pill pill-canvas">Canvas</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

         
          {/* Roadmap grid */}
<section className="panel-card">
  <div className="panel-header">
    <div>
      <h2 className="panel-title">Roadmap for the Next Few Days</h2>
      <p className="panel-sub">
        We broke your tasks into bite-sized work blocks with breaks.
      </p>
    </div>
  </div>

  {loading ? (
    <p className="panel-empty">Building roadmap…</p>
  ) : !summary?.schedule?.length ? (
    <p className="panel-empty">
      No roadmap yet — add some tasks or due dates to see your schedule.
    </p>
  ) : (
    <div className="roadmap-grid">
      {DAY_ORDER.map((day) => {
        const blocks = roadmapByDay[day] || [];
        return (
          <div key={day} className="roadmap-day">
            <p className="roadmap-day-label">{day}</p>
            <div className="roadmap-column">
              {blocks.length === 0 ? (
                <div className="roadmap-empty-slot">—</div>
              ) : (
                blocks.slice(0, 4).map((block, i) => {
                  const isWork = block.type === "work";
                  const label = isWork ? block.title : "Break";

                  const timeRange = (() => {
                    try {
                      const s = new Date(block.start);
                      const e = new Date(block.end);
                      const opts = { hour: "numeric", minute: "2-digit" };
                      return `${s.toLocaleTimeString([], opts)} – ${e.toLocaleTimeString(
                        [],
                        opts
                      )}`;
                    } catch {
                      return "";
                    }
                  })();

                  const hoverText = timeRange
                    ? `${label} · ${timeRange}`
                    : label;

                  return (
                    <div
                      key={`${day}-${i}`}
                      className={
                        "roadmap-block" +
                        (isWork
                          ? " roadmap-block-work"
                          : " roadmap-block-break")
                      }
                      title={hoverText}
                    >
                      <div className="roadmap-block-main">
                        <span className="roadmap-block-title">{label}</span>
                        {timeRange && (
                          <span className="roadmap-block-time">
                            {timeRange}
                          </span>
                        )}
                      </div>
                      {isWork && i === 0 && (
                        <span className="roadmap-block-cat"></span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>


        </section>
      </main>
    </div>
  );
}
