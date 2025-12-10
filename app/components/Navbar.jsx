"use client";
import "../styles/Navbar.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function goTo(path) {
    router.push(path);
    setIsOpen(false); // close menu after navigating
  }

  return (
    <>
      <nav className="navbar">
        <button
          className="nav-btn"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          ☰
        </button>

        <h1 className="nav-title" onClick={() => goTo("/")}>
          Manageable
        </h1>

        <div className="nav-profile">pp</div>
      </nav>

      {/* Slide-out sidebar */}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <button
          className="sidebar-close"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>

        <ul className="sidebar-menu">
          <li onClick={() => goTo("/")}>Home</li>
          <li onClick={() => goTo("/notes")}>School</li>
          <li onClick={() => goTo("/cooldown")}>Cool Down</li>
          <li onClick={() => goTo("/tasks")}>Tasks</li>
          <li onClick={() => goTo("/revision")}>Revision Mode</li>
        </ul>
      </aside>
    </>
  );
}
