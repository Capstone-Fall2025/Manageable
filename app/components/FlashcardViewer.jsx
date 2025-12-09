"use client";
import React, { useState } from "react";
import "../styles/Flashcards.css";

export default function FlashcardViewer({ flashcards, noteTitle, onBack }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0)
    return (
      <div className="flashcard-empty">
        <p>No flashcards available.</p>
      </div>
    );

  const card = flashcards[index];

  return (
    <div className="flashcard-viewer">
      <h2 className="note-title">{noteTitle}</h2>

      <div
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="front">{card.question}</div>
        <div className="back">{card.answer}</div>
      </div>

      <div className="controls">
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.max(i - 1, 0));
          }}
          disabled={index === 0}
        >
          ◀ Prev
        </button>
        <span>
          {index + 1}/{flashcards.length}
        </span>
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.min(i + 1, flashcards.length - 1));
          }}
          disabled={index === flashcards.length - 1}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
