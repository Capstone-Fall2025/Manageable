"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadNotes } from "../utils/storage";
import "../styles/CoolDown.css";

export default function CoolDownPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      setNotes(loadNotes());
      const raw = localStorage.getItem("manageable_reflections");
      setReflections(raw ? JSON.parse(raw) : []);
    } catch {
      setNotes([]);
      setReflections([]);
    }
  }, []);

  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((sum, n) => {
      const words = (n.content || "").trim().split(/\s+/).filter(Boolean).length;
      return sum + words;
    }, 0);
    const recent = [...notes]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 3);
    return { totalNotes, totalWords, recent };
  }, [notes]);

  function saveReflection() {
    if (!text.trim()) return;
    const item = { id: Date.now().toString(), text: text.trim(), createdAt: new Date().toISOString() };
    const updated = [item, ...reflections];
    localStorage.setItem("manageable_reflections", JSON.stringify(updated));
    setReflections(updated);
    setText("");
  }

  return (
    <div className="cooldown-container">
      <div className="cooldown-header">
        <button className="back-link" onClick={() => router.push("/home")}>← Home</button>
        <h1>Cool-down Mode</h1>
      </div>

      <section className="summary">
        <h2>Visual Summary</h2>
        <div className="summary-stats">
          <div className="stat">
            <div className="stat-value">{stats.totalNotes}</div>
            <div className="stat-label">Notes</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.totalWords}</div>
            <div className="stat-label">Total words</div>
          </div>
        </div>

        <div className="recent">
          <h3>Recently worked on</h3>
          {stats.recent.length === 0 && <p className="muted">No recent notes</p>}
          {stats.recent.map((n) => (
            <div key={n.id} className="recent-item">
              <div className="recent-title">{n.title}</div>
              <button onClick={() => router.push(`/workspace?id=${n.id}`)} className="small-btn">Open</button>
            </div>
          ))}
        </div>
      </section>

      <section className="reflection">
        <h2>Reflection</h2>
        <p className="muted">Write a short reflection on what you completed. Save it to revisit later.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you learn? What will you review next?" />
        <div className="reflection-actions">
          <button onClick={saveReflection} className="primary-btn">Save reflection</button>
          <button onClick={() => { setText(""); }} className="ghost-btn">Clear</button>
        </div>

        <div className="past-reflections">
          <h3>Past reflections</h3>
          {reflections.length === 0 && <p className="muted">No reflections yet.</p>}
          {reflections.map((r) => (
            <div key={r.id} className="reflection-item">
              <div className="reflection-text">{r.text}</div>
              <div className="reflection-meta">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
