"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FlashcardViewer from "../components/FlashcardViewer";  
import RevisionNoteSelector from "../components/RevisionNoteSelector";
//import RevisionCoolDown from "../components/RevisionCoolDown";
import "../styles/Revision.css";
import { IconArrowNarrowLeftDashed } from '@tabler/icons-react';

export default function RevisionPage() {
  const [notes, setNotes] = useState([]);
  const [mode, setMode] = useState("select");
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [results, setResults] = useState([]);
  const router = useRouter();

  // Load notes from localStorage (simulate saved workspace notes)
  // useEffect(() => {
  //   const stored = localStorage.getItem("manageable_notes");
  //   if (stored) setNotes(JSON.parse(stored));
  // }, []);

  // async function generateFlashcards(note) {
  //   setSelectedNote(note);
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/flashcards/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ content: note.content, title: note.title }),
  //     });
  //     const data = await res.json();
  //     if (data.success) setFlashcards(data.flashcards);
  //   } catch (err) {
  //     console.error("Flashcard generation failed:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    const stored = localStorage.getItem("manageable_notes");
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes ([]);
      }
    }
  }, []);

  async function handleNoteSelect(note) {
    setSelectedNote(note);
    setMode("loading");

    try{
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ content: note.content, title: note.title})
      });

      const data = await res.json();
      if (data.success) {
        setFlashcards(data.flashcards || []);
        setMode("flashcards");
      } else {
        setFlashcards([]);
        setMode("flashcards");
      } 
    }catch (err) {
        console.error("Flashcard generation failed:", err);
        setFlashcards([]);
        setMode("flashcards");
      }
    }
    
    function handleBackToSelect () {
      setSelectedNote(null);
      setFlashcards([]);
      setResults([]);
      setMode("select");
    }

    function handleSessionComplete(sessionResults) {
      setResults(sessionResults);
      setMode("cooldown");
    }

  

  return (
    <div className="revision-page">
      <header className="revision-header">
        <div className="revision-title-block">
          <h1>REVISION MODE</h1>
          <p>Select your study material to begin flashcard review.</p>
        </div>
        <button
            className="revision-back-btn"
            onClick={() => router.push("/home")}
            >
            <IconArrowNarrowLeftDashed stroke={2} /> 
        </button>
      </header>

      {mode === "select" && (
        <RevisionNoteSelector notes={notes} onSelect={handleNoteSelect} />
      )}
      
      {mode === "loading" && (
        <div className="revision-loading"> Generating flashcards...</div>
      )}

      {mode === "flashcards" && selectedNote && (
        <FlashcardViewer
          flashcards={flashcards}
          noteTitle={selectedNote.title}
          OnBack={handleBackToSelect}
          onComplete={handleSessionComplete}
          />
      )}
      {mode === "cooldown" && (
        <RevisionCooldown 
          results={results}
          onBack={handleBackToSelect}
        />
      )}      
    </div>
  );
}
