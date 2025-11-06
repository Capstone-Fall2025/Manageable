// app/utils/storage.js
export function loadNotes() {
  try {
    const raw = localStorage.getItem("manageable_notes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem("manageable_notes", JSON.stringify(notes));
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createNote({ title, content, cover }) {
  const notes = loadNotes();
  const now = new Date().toISOString();
  const note = {
    id: uid(),
    title: title?.trim() || "Untitled note",
    content: content || "",
    cover: cover || { image: "/images/default.JPG", template: "Blank" },
    createdAt: now,
    updatedAt: now,
  };
  saveNotes([note, ...notes]);
  return note;
}
