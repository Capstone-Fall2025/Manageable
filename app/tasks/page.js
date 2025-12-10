"use client";
import React, { useState, useEffect, useMemo } from "react";

// Handle the Canvas due dates formatting
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

const CATEGORY_OPTIONS = ["All", "Assignments", "Career", "Health", "Fun", "General"];

function importanceLabel(priority) {
  if (priority === 1) return "Critical";
  if (priority === 2) return "High";
  if (priority === 3) return "Medium";
  if (priority === 4) return "Low";
  return "None";
}

function importanceDotClass(priority) {
  if (priority === 1 || priority === 2) return "bg-red-400";
  if (priority === 3) return "bg-yellow-400";
  if (priority === 4) return "bg-emerald-400";
  return "bg-slate-500";
}

export default function Workspace() {
  const [tasks, setTasks] = useState([]);

  // new task form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState(3); // default = Medium
  const [category, setCategory] = useState("Assignments");

  // UI state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [importanceFilter, setImportanceFilter] = useState("All");

  // fetch on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const response = await fetch("http://127.0.0.1:5000/all");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  // Add a manual task
  async function handleAddTask() {
    if (!title.trim()) return;

    const newTask = {
      title,
      description,
      // send date exactly as chosen
      due_date: dueDate ? dueDate.trim() : "",
      priority,
      category,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        console.error("Failed to add task");
        return;
      }

      // clear form and refresh
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

  // Edit manual task (still available for “Edit” button if you want to wire it)
  async function handleEditTask(taskId, updatedTask) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error editing task:", err);
    }
  }

  // (Optional) local-only completed state – does not touch backend
  const [completedLocal, setCompletedLocal] = useState({});
  function toggleLocalComplete(idOrTitle) {
    setCompletedLocal((prev) => ({
      ...prev,
      [idOrTitle]: !prev[idOrTitle],
    }));
  }

  // derived list with filters
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
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
    <main className="min-h-screen bg-[#050713] text-slate-50 flex">
      {/* LEFT SIDEBAR – CATEGORIES */}
      <aside className="w-64 bg-[#050711] border-r border-slate-800/70 flex flex-col px-6 py-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.35em] text-slate-500">
            MY CATEGORIES
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition
                  ${
                    isActive
                      ? "bg-indigo-500/90 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
              >
                <span>{cat.toUpperCase()}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-dashed border-slate-600 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 transition"
        >
          + ADD CATEGORY
        </button>
      </aside>

      {/* RIGHT PANEL – TASK CREATION + LIST */}
      <section className="flex-1 px-8 py-10 flex flex-col gap-6 max-w-4xl mx-auto">
        {/* ADD NEW TASK HEADER */}
        <header>
          <p className="text-[11px] font-semibold tracking-[0.35em] text-slate-500 mb-3">
            ADD NEW TASK
          </p>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 bg-[#0B1020] border border-slate-700/70 rounded-3xl px-5 py-3 flex items-center">
              <input
                type="text"
                placeholder="What needs to be done?"
                className="w-full bg-transparent text-sm md:text-base placeholder:text-slate-500 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddTask}
              className="shrink-0 rounded-2xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 text-xs md:text-sm font-semibold shadow-sm transition"
            >
              ADD TASK
            </button>
          </div>

          {/* QUICK SELECTOR ROW */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {/* Date selector pill */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#0B1020] border border-slate-700/70 px-3 py-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[11px]">
                📅
              </span>
              <input
                type="date"
                className="bg-transparent text-slate-200 focus:outline-none text-xs"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Category selector pill */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#0B1020] border border-slate-700/70 px-3 py-2">
              <span className="text-slate-400">Category</span>
              <select
                className="bg-transparent text-slate-100 focus:outline-none text-xs"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance segmented control */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#0B1020] border border-slate-700/70 px-3 py-2">
              <span className="text-slate-400">Importance</span>
              <div className="flex rounded-full bg-slate-900/70 overflow-hidden text-[11px]">
                <button
                  type="button"
                  onClick={() => setPriority(2)}
                  className={`px-3 py-1 ${
                    priority === 2 ? "bg-red-500 text-white" : "text-slate-300"
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
        </header>

        {/* SORT / FILTER ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1 hover:bg-slate-800/70"
            >
              Date
              <span className="text-xs">▾</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Filter by importance</span>
            <select
              className="rounded-xl bg-[#0B1020] border border-slate-700/70 px-2 py-1 text-[11px] focus:outline-none"
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION TEXTAREA (optional – stays under quick selectors) */}
        <textarea
          placeholder="Task details (optional)"
          className="mt-3 w-full min-h-[80px] resize-none rounded-2xl bg-[#050711] border border-slate-800 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* TASK LIST */}
        <div className="mt-4 flex-1 flex flex-col gap-3 overflow-y-auto pb-6">
          {visibleTasks.length === 0 ? (
            <p className="text-sm text-slate-500 mt-6">No tasks to show yet.</p>
          ) : (
            visibleTasks.map((task) => {
              const key = task.id || task.title;
              const prio = Number(task.priority ?? 3);
              const completed = completedLocal[key];

              return (
                <div
                  key={key}
                  className="rounded-2xl bg-[#0B1020] border border-slate-800/70 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  {/* Left side: checkbox + title + description */}
                  <div className="flex-1 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLocalComplete(key)}
                      className={`mt-1 h-4 w-4 rounded border flex items-center justify-center
                        ${
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
                          {task.title}
                        </h3>
                        {task.html_url && (
                          <span className="rounded-full bg-slate-800/80 border border-slate-700 px-2 py-[2px] text-[10px] uppercase tracking-wide text-slate-300">
                            Canvas
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <div
                          className="text-xs text-slate-400 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: task.description || "",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right side: meta info */}
                  <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end gap-2 text-[11px]">
                    <span className="text-slate-400">
                      {formatDueDate(task.due_date)}
                    </span>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {/* Category pill */}
                      {task.category && (
                        <span className="rounded-full bg-slate-800/80 px-3 py-[4px] text-[11px] text-slate-200">
                          {task.category}
                        </span>
                      )}

                      {/* Importance pill */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-[4px] text-[11px]">
                        <span
                          className={`h-2 w-2 rounded-full ${importanceDotClass(prio)}`}
                        />
                        {importanceLabel(prio)}
                      </span>
                    </div>

                    {/* Canvas link or Edit placeholder */}
                    {task.html_url ? (
                      <a
                        href={task.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-300 hover:text-indigo-200 underline mt-1"
                      >
                        View in Canvas
                      </a>
                    ) : task.id ? (
                      <button
                        type="button"
                        className="text-[11px] text-slate-400 hover:text-slate-200 mt-1"
                        onClick={() =>
                          handleEditTask(task.id, {
                            ...task,
                            title: task.title,
                          })
                        }
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
