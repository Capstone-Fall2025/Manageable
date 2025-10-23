"use client";
import React from "react";
import "../styles/CardGrid.css";

export default function CardGrid() {
  return (
    <section className="card-grid">
      <div className="card career">
        <h2>Career</h2>
      </div>

      <div className="right-column">
        <div className="card school">
          <h2>School</h2>
        </div>

        <div className="card hobby">
          <h2>Hobby</h2>
        </div>
      </div>
    </section>
  );
}