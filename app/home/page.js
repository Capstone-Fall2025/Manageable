"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
// import GreetingsSection from "../components/GreetingsSection";
import CardGrid from "../components/CardGrid";
// import ProgressBar from  "./components/ProgressBar";
// import NotesButton from ".components/NotesButton";
import "../styles/Home.css";

export default function HomePage () {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // First, try session endpoint (HttpOnly cookie)
        (async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user?.email) {
                        localStorage.setItem('manageable_user', JSON.stringify(data.user));
                        return;
                    }
                }
            } catch (e) {
                // ignore
            }

            // Fallback: check query params (older flow)
            try {
                const email = searchParams.get("email");
                const name = searchParams.get("name");
                if (email) {
                    localStorage.setItem("manageable_user", JSON.stringify({ email, name }));
                    // clean the URL (client-side navigation)
                    router.replace('/home');
                }
            } catch (e) {
                // ignore
            }
        })();
    }, [router, searchParams]);

    return (
        <div className="home">
            <Navbar/>
            <main className="home-content">
                {/* <GreetingsSection/> */}
                <CardGrid/>
                {/* <ProgressBar/> */}
            </main>
            {/* <NotesButton/> */}
        </div>
    );
}