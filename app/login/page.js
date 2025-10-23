"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../styles/Login.css"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter an email and password.");
      return;
    }
    try {
      localStorage.setItem("manageable_user", JSON.stringify({ email }));
      router.push("/home");
    } catch {
      setError("Could not sign in. Try again.");
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Sign in to Manageable</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Sign in
          </button>

          <div className="login-footer">
            Don’t have an account? <Link href="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </main>
  );
}