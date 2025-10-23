"use client";
import React, {useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles/Openanimation.css";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(()=> { 
      router.push("/login");
    },2500);

    return () => clearTimeout(timer);
  },[router]);

  return (
    <div className="entry">
      <h1 className="logo">Manageable</h1>
      <p className="subtitle">Focus.Simplified</p>
    </div>
  );
}