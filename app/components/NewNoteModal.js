"use client";
import React, { useState } from "react";
import { createNote } from "../utils/storage";
import { useRouter } from "next/navigation";
import "../styles/NewNoteModal.css";

const IMAGE_COVERS = [
  "/covers/green.jpg",
  "/covers/purple.jpg",
  "/covers/blue.jpg",
  "/covers/yellow.jpg",
  "/covers/orange.jpg",
  "/images/default.jpg",
];

const TEMPLATES = ["Blank", "Cornell", "Dotted", "Code"];

export default function NewNoteModal({ open, onClose }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(IMAGE_COVERS[0]);
  const [template, setTemplate] = useState("Blank");

  if (!open) return null;

  function handleCreate() {
    const note = createNote({
      title,
      content:
        template === "Cornell"
          ? "# Notes\n\n---\n**Cue** | **Notes**\n\n---\n**Summary**"
          : template === "Dotted"
          ? "• \n• \n• "
          : template === "Code"
          ? "// Start coding notes...\n"
          : "",
      cover: { image, template },
    });
    onClose?.();
    router.push(`/workspace?id=${note.id}`);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>New Note</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <label>Title</label>
        <input
          type="text"
          placeholder="Untitled note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Choose a Cover</label>
        <div className="cover-grid">
          {IMAGE_COVERS.map((img) => (
            <button
              key={img}
              className={`cover-choice ${image === img ? "selected" : ""}`}
              onClick={() => setImage(img)}
            >
              <img src={img} alt="cover" />
            </button>
          ))}
        </div>

        <label>Template</label>
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          {TEMPLATES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="create-btn" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
