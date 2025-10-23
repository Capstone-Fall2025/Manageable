"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../styles/Signup.css"; // <-- import the stylesheet

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function validate() {
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setBusy(true);
    try {
      const raw = localStorage.getItem("manageable_accounts");
      const accounts = raw ? JSON.parse(raw) : [];

      const exists = accounts.find((a) => a.email === email.trim().toLowerCase());
      if (exists) {
        setError("An account with that email already exists. Please sign in.");
        setBusy(false);
        return;
      }

      const newAccount = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      localStorage.setItem("manageable_accounts", JSON.stringify(accounts));

      router.push(`/login?email=${encodeURIComponent(newAccount.email)}`);
    } catch {
      setError("Could not create account. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={busy} className="signup-btn">
            {busy ? "Creating..." : "Create account"}
          </button>

          <div className="signup-footer">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  );
}