"use client";
import React, {useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(()=> { 
      router.push("/workspace");
    },2500);

    return () => clearTimeout(timer);
  },[router]);

  // Redirect root (/) to the login route
  redirect("/login");

  return (
    <main 
      className="
        min-h-screen 
        flex flex-col 
        justify-center 
        bg-black 
        text-white">
      <h1 
        className="
        text-6xl 
        font-bold 
        mb-3">
          Manageable
      </h1>
      <p 
        className="
        text-gray-400 
        text-lg">
          Focus.Revise.Remember
      </p>
    </main>
  );
}