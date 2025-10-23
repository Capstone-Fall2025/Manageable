"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import "../styles/Signup.css"; // <-- import the stylesheet
=======
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401

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
<<<<<<< HEAD
=======
      // store accounts locally (demo only). Replace with real API in production.
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
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
<<<<<<< HEAD
        password,
=======
        password, // demo only — do NOT store plain passwords in production
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      localStorage.setItem("manageable_accounts", JSON.stringify(accounts));

<<<<<<< HEAD
      router.push(`/login?email=${encodeURIComponent(newAccount.email)}`);
    } catch {
=======
      // Redirect to sign in so the user can sign in with their new credentials.
      router.push(`/login?email=${encodeURIComponent(newAccount.email)}`);
    } catch (err) {
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
      setError("Could not create account. Try again.");
      setBusy(false);
    }
  }

  return (
<<<<<<< HEAD
    <main className="signup-page">
      <div className="signup-card">
        <h1>Create an account</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Your name"
=======
    <main className="min-h-screen flex items-center justify-center p-8 bg-black">
      <div className="w-full max-w-md bg-black rounded-lg shadow-md p-6 border border-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-white">Create an account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-300">Full name</span>
            <input
              type="text"
              placeholder="Your name"
              className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

<<<<<<< HEAD
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
=======
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-300">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

<<<<<<< HEAD
          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
=======
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-300">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

<<<<<<< HEAD
          <label>
            Confirm password
            <input
              type="password"
              placeholder="••••••••"
=======
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-300">Confirm password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

<<<<<<< HEAD
          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={busy} className="signup-btn">
            {busy ? "Creating..." : "Create account"}
          </button>

          <div className="signup-footer">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
=======
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2">
            <button
              type="submit"
              disabled={busy}
              className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {busy ? "Creating..." : "Create account"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Sign in
            </Link>
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
          </div>
        </form>
      </div>
    </main>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7bf4faf8e7b039c3586a33d63657717a40adc401
