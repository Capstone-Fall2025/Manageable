"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FlashcardViewer from "./FlashcardViewer";    
import "../styles/Revision.css";
import { IconArrowNarrowLeftDashed } from '@tabler/icons-react';

export default function RevisionPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load notes from localStorage (simulate saved workspace notes)
  useEffect(() => {
    const stored = localStorage.getItem("manageable_notes");
    if (stored) setNotes(JSON.parse(stored));
  }, []);

  async function generateFlashcards(note) {
    setSelectedNote(note);
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content, title: note.title }),
      });
      const data = await res.json();
      if (data.success) setFlashcards(data.flashcards);
    } catch (err) {
      console.error("Flashcard generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="revision-container">
      <h1 className="revision-title">Revision Mode</h1>
      <button
            className="text-gray-400 hover:text-green-400 transition"
            onClick={() => router.push("/home")}
            >
            <IconArrowNarrowLeftDashed stroke={2} /> 
        </button>

      {!selectedNote ? (
        <div className="note-list">
          <h2>Select a note to review:</h2>
          {notes.length === 0 && <p className="no-notes">No saved notes yet.</p>}
          {notes.map((note) => (
            <button
              key={note.id}
              className="note-button"
              onClick={() => generateFlashcards(note)}
            >
              {note.title}
            </button>
          ))}
        </div>
      ) : loading ? (
        <div className="loading">Generating flashcards...</div>
      ) : (
        <FlashcardViewer
          flashcards={flashcards}
          noteTitle={selectedNote.title}
          onBack={() => {
            setSelectedNote(null);
            setFlashcards([]);
          }}
        />
      )}
    </div>
  );
}
