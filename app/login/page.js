"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
            router.push("/workspace");
        } catch {
            setError("Could not sign in. Try again.");
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-black">
            <div className="w-full max-w-md bg-black rounded-lg shadow-md p-6 border border-gray-800">
                <h1 className="text-2xl font-bold mb-4 text-white">Sign in to Manageable</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1 text-gray-300">Email</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label className="flex flex-col text-sm">
                        <span className="mb-1 text-gray-300">Password</span>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="px-3 py-2 border rounded bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-700"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </label>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="mt-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-300">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-400 hover:underline">
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}