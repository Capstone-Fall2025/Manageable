"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowNarrowLeftDashed } from "@tabler/icons-react";
import { gsap } from "gsap";
import "../styles/Workspace.css";

import { loadNotes, saveNotes } from "../utils/storage";
import RevisionPage from "../revision/page";

// // --- Storage helpers ---
// function loadNotes() {
//   if (typeof window === "undefined") return [];
//   try {
//     const raw = localStorage.getItem("manageable_notes");
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// function saveNotes(notes) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem("manageable_notes", JSON.stringify(notes));
// }

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Workspace() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id"); // optional ?id=<noteId>

  const [notes, setNotes] = useState([]);
  const [noteId, setNoteId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState(null);


  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);

  // Entrance animation with GSAP
  useEffect(() => {
    if (!rootRef.current) return;

    const tl = gsap.timeline();
    tl.from(rootRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    })
      .from(
        sidebarRef.current,
        {
          x: -40,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3"
      )
      .from(
        editorRef.current,
        {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.4"
      );

    return () => {
      tl.kill();
    };
  }, []);

  // Initial load of all notes + choose current note
  useEffect(() => {
    const all = loadNotes();
    setNotes(all);

    if (editingId) {
      const n = all.find((x) => x.id === editingId);
      if (n) {
        setNoteId(n.id);
        setTitle(n.title || "");
        setBody(n.content || "");
        setLastSaved(n.updatedAt || n.createdAt || null);
        return;
      }
    }

    // If no ?id or not found, select first note if exists
    if (all.length > 0) {
      const first = all[0];
      setNoteId(first.id);
      setTitle(first.title || "");
      setBody(first.content || "");
      setLastSaved(first.updatedAt || first.createdAt || null);
    }
  }, [editingId]);

  //Debounced autosave
  useEffect(() => {
    if (!title.trim() && !body.trim()) return; // nothing to save

    setSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const all = loadNotes();
      const now = new Date().toISOString();
      let updated = [...all];

      if (noteId) {
        const idx = updated.findIndex((n) => n.id === noteId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            title: title.trim() || "Untitled note",
            content: body,
            updatedAt: now,
          };
        } else {
          const newNote = {
            id: noteId,
            title: title.trim() || "Untitled note",
            content: body,
            createdAt: now,
            updatedAt: now,
          };
          updated = [newNote, ...updated];
        }
      } else {
        const newId = uid();
        const newNote = {
          id: newId,
          title: title.trim() || "Untitled note",
          content: body,
          createdAt: now,
          updatedAt: now,
        };
        updated = [newNote, ...updated];
        setNoteId(newId);
      }

      saveNotes(updated);
      setNotes(updated);
      setLastSaved(now);
      setSaving(false);
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [title, body, noteId]);

  // Explicit Save
  function handleSaveExplicit() {
    if (!title.trim() && !body.trim()) return;
    const all = loadNotes();
    const now = new Date().toISOString();
    let updated = [...all];

    if (noteId) {
      const idx = updated.findIndex((n) => n.id === noteId);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          title: title.trim() || "Untitled note",
          content: body,
          cover,
          updatedAt: now,
        };
      } else {
        const newNote = {
          id: uid(),
          title: "Untitled note",
          content: "",
          cover,
          createdAt: now,
          updatedAt: now,
        };
        updated = [newNote, ...updated];
      }
    } else {
      const newId = uid();
      const newNote = {
        id: newId,
        title: title.trim() || "Untitled note",
        content: body,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newNote, ...updated];
      setNoteId(newId);
    }

    saveNotes(updated);
    setNotes(updated);
    setLastSaved(now);
  }

  // Save as new copy
  function handleSaveAsNew() {
    const all = loadNotes();
    const now = new Date().toISOString();
    const newId = uid();
    const duplicate = {
      id: newId,
      title: (title.trim() || "Untitled note") + " (copy)",
      content: body,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [duplicate, ...all];
    saveNotes(updated);
    setNotes(updated);
    setNoteId(newId);
    setLastSaved(now);
  }

  // Create brand new empty note
  function handleCreateNote() {
    const now = new Date().toISOString();
    const newNote = {
      id: uid(),
      title: "Untitled note",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setNotes(updated);
    setNoteId(newNote.id);
    setTitle(newNote.title);
    setBody("");
    setLastSaved(now);
  }

  // Select note from sidebar
  function handleSelectNote(id) {
    const n = notes.find((note) => note.id === id);
    if (!n) return;
    setNoteId(n.id);
    setTitle(n.title || "");
    setBody(n.content || "");
    setLastSaved(n.updatedAt || n.createdAt || null);
  }

  //Delete note
  function handleDeleteNote(id) {
    const filtered = notes.filter((n) => n.id !== id);
    saveNotes(filtered);
    setNotes(filtered);

    if (noteId === id) {
      if (filtered.length > 0) {
        const first = filtered[0];
        setNoteId(first.id);
        setTitle(first.title || "");
        setBody(first.content || "");
        setLastSaved(first.updatedAt || first.createdAt || null);
      } else {
        setNoteId(null);
        setTitle("");
        setBody("");
        setLastSaved(null);
      }
    }
  }

  function handleClear() {
    setTitle("");
    setBody("");
  }

  function handleRevisionPage() {
    router.push("/revision");
  }

  function handleLockIn() {
    router.push("/lockin");
  }

  function formatTimeLabel(value) {
    if (!value) return "Not saved yet";
    const d = new Date(value);
    return `Saved • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function formatSidebarDate(value) {
    if (!value) return "";
    const d = new Date(value);
    const now = new Date();

    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function getPreview(content) {
    const firstLine = (content || "").split("\n").find((line) => line.trim()) || "";
    if (!firstLine) return "No content yet";
    return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine;
  }

  return (
    <main ref={rootRef} className="workspace-root">
      <div className="workspace-inner">
        {/* Top bar */}
        <header className="ws-topbar">
          <button
            className="ws-back-btn"
            onClick={() => router.push("/notes")}
          >
            <IconArrowNarrowLeftDashed stroke={2} />
            <span>Back to Notes</span>
          </button>

          <div className="ws-status">
            {saving ? "Saving…" : formatTimeLabel(lastSaved)}
          </div>
        </header>

        {/* Main layout */}
        <div className="ws-layout">
          {/* Sidebar */}
          <aside ref={sidebarRef} className="ws-sidebar">
            <div className="ws-sidebar-header">
              <div>
                <h1 className="ws-sidebar-title">Notes</h1>
                <p className="ws-sidebar-subtitle">
                  {notes.length === 1 ? "1 note" : `${notes.length} notes`}
                </p>
              </div>
              <button
                className="ws-icon-btn"
                onClick={handleCreateNote}
                title="New note"
              >
                ＋
              </button>
            </div>

            <div className="ws-divider" />

            <div className="ws-notes-list">
              {notes.length === 0 && (
                <div className="ws-empty-state">
                  <p>No notes yet.</p>
                  <p className="ws-empty-sub">Create your first note to get started.</p>
                </div>
              )}

              {notes.map((note) => (
                <div
                  key={note.id}
                  className={
                    "ws-note-item" +
                    (note.id === noteId ? " ws-note-item--active" : "")
                  }
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div className="ws-note-item-main">
                    <div className="ws-note-title-row">
                      <span className="ws-note-title">
                        {note.title || "Untitled note"}
                      </span>
                      <span className="ws-note-date">
                        {formatSidebarDate(note.updatedAt || note.createdAt)}
                      </span>
                    </div>
                    <p className="ws-note-preview">{getPreview(note.content)}</p>
                  </div>
                  <button
                    className="ws-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    title="Delete note"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* Editor */}
          <section ref={editorRef} className="ws-editor">
            {noteId ? (
              <>
                <div className="ws-editor-toolbar">
                  <div className="ws-editor-meta">
                    <span className="ws-editor-label">Workspace</span>
                    <span className="ws-editor-dot">•</span>
                    <span className="ws-editor-sublabel">
                      {formatTimeLabel(lastSaved)}
                    </span>
                  </div>

                  <div className="ws-editor-actions">
                    <button
                      className="ws-btn ws-btn-ghost"
                      onClick={handleSaveExplicit}
                    >
                      Save
                    </button>
                    <button
                      className="ws-btn ws-btn-ghost"
                      onClick={handleSaveAsNew}
                    >
                      Save as New
                    </button>
                    <button
                      className="ws-btn ws-btn-primary"
                      onClick={handleLockIn}
                    >
                      Lock In Mode
                    </button>
                    <button
                        className="ws-btn ws-btn-ghost"
                        onClick={handleRevisionPage}
                    >
                    Revise This
                    </button>
                  </div>
                </div>

                <div className="ws-editor-body">
                  <input
                    type="text"
                    placeholder="Untitled note"
                    className="ws-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <textarea
                    placeholder="Let's get on with it…"
                    className="ws-body-textarea"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <div className="ws-editor-footer">
                  <button
                    className="ws-btn ws-btn-ghost"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div className="ws-editor-empty">
                <p className="ws-empty-main">No note selected</p>
                <button
                  className="ws-btn ws-btn-primary"
                  onClick={handleCreateNote}
                >
                  Create New Note
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

