"use client";
import React, { useEffect, useState } from "react";
import { loadNotes, saveNotes } from "../utils/storage";
import { useRouter } from "next/navigation";
import NewNoteModal from "../components/NewNoteModal";
import "../styles/NotesGallery.css";
import { IconArrowNarrowLeftDashed } from '@tabler/icons-react';


export default function NotesGallery() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Load notes whenever page is focused
  useEffect(() => {
    const refresh = () => setNotes(loadNotes());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  // delete handler
  function handleDelete(noteId) {
    const filtered = notes.filter((n) => n.id !== noteId);
    saveNotes(filtered);
    setNotes(filtered);
    setEditingNote(null);
  }

  return (
    <main className="notes-page">
      <header className="notes-header">
         <button
            className="text-gray-400 hover:text-green-400 transition"
            onClick={() => router.push("/home")}
            >
            <IconArrowNarrowLeftDashed stroke={2} /> 
        </button>
        <h1>Your Notes</h1>
        <button className="add-btn" onClick={() => setOpen(true)}>
          ＋
        </button>
      </header>



      <section className="notes-grid">
        {notes.map((n) => (
          <div key={n.id} className="relative note-wrapper">
            {/* main note card */}
            <button
              onClick={() => router.push(`/workspace?id=${n.id}`)}
              className="note-card"
            >
              <img
                src={n.cover?.image || "/images/default.JPG"}
                alt=""
                className="note-image"
              />
              <div className="note-meta">
                <h3>{n.title}</h3>
                <span>{n.cover?.template || "Blank"}</span>
              </div>
            </button>

            {/* ⋯ menu button */}
            <button
              onClick={() => setEditingNote(n)}
              className="menu-btn"
              title="Options"
            >
              ⋯
            </button>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="no-notes">No notes yet. Click ＋ to create one.</div>
        )}
      </section>

      <NewNoteModal open={open} onClose={() => setOpen(false)} />

      {/* simple modal for ⋯ options */}
      {editingNote && (
        <div className="modal-overlay" onClick={() => setEditingNote(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">{editingNote.title}</h3>
            <div className="modal-options">
              <button
                onClick={() => router.push(`/workspace?id=${editingNote.id}`)}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(editingNote.id)}
                className="danger"
              >
                Delete
              </button>
              <button onClick={() => setEditingNote(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

