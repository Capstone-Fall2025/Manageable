"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowNarrowLeftDashed } from '@tabler/icons-react';

// --- Storage helpers ---
function loadNotes() {
  try {
    const raw = localStorage.getItem("manageable_notes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveNotes(notes) {
  localStorage.setItem("manageable_notes", JSON.stringify(notes));
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Workspace() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id"); // optional ?id=<noteId> to edit an existing note

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [noteId, setNoteId] = useState(editingId || null);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load existing note if ?id= provided
  useEffect(() => {
    const all = loadNotes();
    if (editingId) {
      const n = all.find((x) => x.id === editingId);
      if (n) {
        setNoteId(n.id);
        setTitle(n.title || "");
        setBody(n.content || "");
        setLastSaved(n.updatedAt || n.createdAt || null);
      }
    }
  }, [editingId]);

  // Debounced autosave while typing
  const debounceRef = useRef(null);
  useEffect(() => {
    // don’t autosave if both empty
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const all = loadNotes();
      const now = new Date().toISOString();

      if (noteId) {
        // update existing
        const idx = all.findIndex((n) => n.id === noteId);
        if (idx !== -1) {
          all[idx] = {
            ...all[idx],
            title: title.trim() || "Untitled note",
            content: body,
            updatedAt: now,
          };
          saveNotes(all);
          setLastSaved(now);
          setSaving(false);
          return;
        }
      }
      // create new (autosave will create new draft if no id)
      const newId = uid();
      const newNote = {
        id: newId,
        title: title.trim() || "Untitled note",
        content: body,
        createdAt: now,
        updatedAt: now,
      };
      saveNotes([newNote, ...all]);
      setNoteId(newId);
      setLastSaved(now);
      setSaving(false);
    }, 800); // 800ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [title, body, noteId]);

  function handleSaveExplicit() {
    if (!title.trim() && !body.trim()) return; // nothing to save
    const all = loadNotes();
    const now = new Date().toISOString();

    if (noteId) {
      const idx = all.findIndex((n) => n.id === noteId);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          title: title.trim() || "Untitled note",
          content: body,
          updatedAt: now,
        };
        saveNotes(all);
        setLastSaved(now);
        return;
      }
    }
    // Save as new
    const newId = uid();
    const newNote = {
      id: newId,
      title: title.trim() || "Untitled note",
      content: body,
      createdAt: now,
      updatedAt: now,
    };
    saveNotes([newNote, ...all]);
    setNoteId(newId);
    setLastSaved(now);
  }

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
    saveNotes([duplicate, ...all]);
    setNoteId(newId);
    setLastSaved(now);
  }

  function handleClear() {
    setTitle("");
    setBody("");
    // keep noteId to keep editing same record (or reset if you prefer)
    // setNoteId(null);
  }

  function handleLockIn() {
    router.push("/lockin");
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <div className="w-full max-w-3xl flex flex-col gap-3">
        {/* Header row: Save status + actions */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            {saving ? "Saving…" : lastSaved ? `Saved • ${new Date(lastSaved).toLocaleTimeString()}` : "—"}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition"
              onClick={handleSaveExplicit}
              title="Save"
            >
              Save
            </button>
            <button
              className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition"
              onClick={handleSaveAsNew}
              title="Save as a new copy"
            >
              Save as New
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
            <button
            className="text-gray-400 hover:text-green-400 transition"
            onClick={() => router.push("/notes")}
            >
            <IconArrowNarrowLeftDashed stroke={2} /> 
            </button>
        <span className="text-sm text-gray-500">
            {lastSaved ? `Saved • ${new Date(lastSaved).toLocaleTimeString()}` : ""}
        </span>
        </div>


        <input
          type="text"
          placeholder="Untitled note"
          className="w-full text-2xl font-semibold bg-transparent border-b border-gray-700 outline-none focus:border-green-400 pb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Let's get on with it…"
          className="w-full min-h-[70vh] resize-none bg-transparent text-lg outline-none leading-relaxed"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex justify-end mt-6 gap-3">
          <button
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition"
            onClick={handleClear}
          >
            Clear
          </button>

          <button
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-md transition"
            onClick={handleLockIn}
          >
            Lock In Mode
          </button>
        </div>
      </div>
    </main>
  );
}
