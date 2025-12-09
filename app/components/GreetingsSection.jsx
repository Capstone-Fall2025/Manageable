"use client";
import React, { useEffect, useState } from "react";
import "../styles/GreetingsSection.css";

export default function GreetingsSection({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish(); 
    }, 10000); 

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <section className={`greeting ${visible ? "fade-in" : "fade-out"}`}>
      <div className="greeting-card">
        <h2 className="greeting-title">Welcome back, username</h2>
        <p className="greeting-sub">You’ve got 2 high-priority tasks for today.</p>
      </div>
    </section>
  );
}