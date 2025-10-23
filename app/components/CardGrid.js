"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/CardGrid.css";


 
export default function CardGrid() {
    const router = useRouter ();

  function schoolPage() {
    router.push("/school");
    }
    
  return (
    <section className="card-grid">
      <div className="card career">
        <h2>Career</h2>
      </div>

      <div className="right-column">
        <div className="card school">
          <button className="school-btn" onClick={schoolPage} >School</button>
        </div>

        <div className="card hobby">
          <h2>Hobby</h2>
        </div>
      </div>
    </section>
  );
}