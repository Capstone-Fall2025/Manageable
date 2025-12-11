
"use client";

import React, { useState, useEffect, useMemo } from "react";

const CATEGORY_OPTIONS = ["All", "Assignments", "Career", "Health", "Fun", "General"];

function formatDueDate(dateString) {
  if (!dateString) return "No due date";
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

function importanceLabel(priority) {
  const p = Number(priority);
  if (p === 1) return "Critical";
  if (p === 2) return "High";
  if (p === 3) return "Medium";
  if (p === 4) return "Low";
  return "None";
}

function importanceDotClass(priority) {
  const p = Number(priority);
  if (p === 1 || p === 2) return "bg-red-400";
  if (p === 3) return "bg-yellow-400";
  if (p === 4) return "bg-emerald-400";
  return "bg-slate-500";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);

  // Add-task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(3);
  const [category, setCategory] = useState("Assignments");

  // Filters
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [importanceFilter, setImportanceFilter] = useState("All");

  // Local completion fallback for non-id tasks (Canvas)
  const [completedLocal, setCompletedLocal] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("http://127.0.0.1:5000/all");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  async function handleAddTask() {
    if (!title.trim()) return;

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || "",
      priority,
      category,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        console.error("Failed to add task");
        return;
      }

      // Clear form and refresh list
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority(3);
      setCategory("Assignments");
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  }

  async function toggleComplete(task) {
    const key = task.id || task.title || task.name;

    // No id so probably Canvas only; just local visual toggle
    if (!task.id) {
      setCompletedLocal(prev => ({
        ...prev,
        [key]: !prev[key],
      }));
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) {
        console.error("Failed to toggle task completion");
        return;
      }

      const updatedTask = await res.json();

      setTasks(prev =>
        prev.map(t => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );
    } catch (err) {
      console.error("Error toggling completion:", err);
    }
  }

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      const cat = task.category || "General";
      const prio = Number(task.priority ?? 3);

      if (activeCategoryFilter !== "All" && cat !== activeCategoryFilter) {
        return false;
      }

      if (importanceFilter !== "All") {
        const label = importanceLabel(prio);
        if (label !== importanceFilter) return false;
      }

      return true;
    });
  }, [tasks, activeCategoryFilter, importanceFilter]);

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/60 bg-[#050816]">
        <div className="p-4 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold tracking-wide text-slate-300">
            Manageable Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Capture manual tasks and Canvas assignments in one place.
          </p>
        </div>

        <div className="p-4 space-y-4 text-xs flex-1 overflow-y-auto">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
              Categories
            </p>
            <div className="space-y-1">
              {CATEGORY_OPTIONS.map(cat => {
                const active = activeCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                      active
                        ? "bg-indigo-500/90 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/70"
                    }`}
                  >
                    <span>{cat}</span>
                    {active && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-[11px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800/60 pt-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
              Importance Legend
            </p>
            <div className="space-y-2">
              {[
                { label: "Critical", color: "bg-red-400" },
                { label: "High", color: "bg-red-400" },
                { label: "Medium", color: "bg-yellow-400" },
                { label: "Low", color: "bg-emerald-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[11px]">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col">
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            Tasks & Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Add manual tasks, view Canvas assignments, and filter by category or importance.
          </p>
        </header>

        {/* Add Task */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-[#050816] p-4 md:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.7)]">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">
            Add a Manual Task
          </h2>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="Task title"
              className="flex-1 rounded-xl bg-[#0B1020] border border-slate-700/70 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="shrink-0 rounded-2xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-xs md:text-sm font-semibold shadow-sm transition"
            >
              Add Task
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Due date</span>
              <input
                type="date"
                className="rounded-xl bg-[#0B1020] border border-slate-700/70 px-2 py-1 text-[11px] focus:outline-none"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Category</span>
              <select
                className="rounded-xl bg-[#0B1020] border border-slate-700/70 px-2 py-1 text-[11px] focus:outline-none"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Assignments">Assignments</option>
                <option value="Career">Career</option>
                <option value="Health">Health</option>
                <option value="Fun">Fun</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Importance</span>
              <div className="inline-flex rounded-full border border-slate-700/80 bg-[#050816] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPriority(1)}
                  className={`px-3 py-1 ${
                    priority === 1 ? "bg-red-500 text-black" : "text-slate-300"
                  }`}
                >
                  Critical
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(2)}
                  className={`px-3 py-1 ${
                    priority === 2 ? "bg-orange-500 text-black" : "text-slate-300"
                  }`}
                >
                  High
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(3)}
                  className={`px-3 py-1 ${
                    priority === 3 ? "bg-yellow-500 text-black" : "text-slate-300"
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(4)}
                  className={`px-3 py-1 ${
                    priority === 4 ? "bg-emerald-500 text-black" : "text-slate-300"
                  }`}
                >
                  Low
                </button>
              </div>
            </div>
          </div>

          <textarea
            placeholder="Task details (optional)"
            className="mt-3 w-full min-h-[70px] rounded-xl bg-[#0B1020] border border-slate-700/70 px-3 py-2 text-xs md:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setDueDate("");
                setPriority(3);
                setCategory("Assignments");
              }}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>

            <div className="flex items-center gap-2">
              <span>Filter by importance</span>
              <select
                className="rounded-xl bg-[#0B1020] border border-slate-700/70 px-2 py-1 text-[11px] focus:outline-none"
                value={importanceFilter}
                onChange={e => setImportanceFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Tasks list */}
        <section className="flex-1 rounded-2xl border border-slate-800 bg-[#050816] p-4 md:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.7)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-200">All Tasks</h2>
            <p className="text-xs text-slate-500">
              Showing {visibleTasks.length} of {tasks.length} total tasks
            </p>
          </div>

          <div className="mt-3 flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
            {visibleTasks.length === 0 ? (
              <p className="text-sm text-slate-500 mt-4">No tasks to show yet.</p>
            ) : (
              visibleTasks.map(task => {
                const key = task.id || task.title || task.name;
                const prio = Number(task.priority ?? 3);
                const completed =
                  typeof task.completed === "boolean"
                    ? task.completed
                    : !!completedLocal[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl bg-[#0B1020] border border-slate-800/70 px-3 py-3 md:px-4 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleComplete(task)}
                        className={`mt-1 h-4 w-4 rounded border flex items-center justify-center ${
                          completed
                            ? "border-indigo-400 bg-indigo-500/80"
                            : "border-slate-500 bg-transparent"
                        }`}
                      >
                        {completed && (
                          <span className="text-[10px] leading-none text-white">✓</span>
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm md:text-base font-semibold ${
                              completed ? "line-through text-slate-500" : ""
                            }`}
                          >
                            {task.title || task.name}
                          </h3>
                          {task.html_url && (
                            <span className="rounded-full bg-slate-800/90 px-2 py-[2px] text-[10px] uppercase tracking-wide text-slate-300">
                              Canvas
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs md:text-sm text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 text-[11px]">
                      <span className="text-slate-400">
                        {formatDueDate(task.due_date)}
                      </span>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <span className="inline-flex items-center rounded-full border border-slate-700/80 px-2 py-[3px] text-[10px] uppercase tracking-wide text-slate-300">
                          {task.category || "General"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2 py-[3px] text-[10px] uppercase tracking-wide text-slate-300">
                          <span
                            className={`h-2 w-2 rounded-full ${importanceDotClass(prio)}`}
                          />
                          <span>{importanceLabel(prio)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
