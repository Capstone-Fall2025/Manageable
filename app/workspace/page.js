"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Workspace () {
    const [title, setTitle]= useState("");
    const [body, setBody] = useState("");
    const router = useRouter ();

    function handleLockIn() {
        router.push("/lockin");
    }

    return (
        <main 
            className="
                min-h-screen 
                bg-black 
                text-white 
                flex flex-col 
                items-center p-8">

            <div 
                className="
                    w-full 
                    max-w-3xl 
                    flex flex-col 
                    gap-4">
                <input
                    type="text"
                    placeholder =" Untitled note "
                    className="
                        w-full
                        text-2xl
                        font-semibold
                        bg-transparent
                        border-b
                        border-gray-700
                        outline-none
                        focus:border-green-400
                        pb-2"
                    value={title}
                    onChange={ (e)=> setTitle(e.target.value)}>
                </input>

                <textarea
                    placeholder="Let's get on with it...."
                    className="
                        w-full
                        min-h-[70vh]
                        resize-none
                        bg-transparent
                        text-lg
                        outline-none
                        leading-relaxed
                        "
                    value={body}
                    onChange={(e)=> setBody(e.target.value)}
                />
                <div className="
                        flex
                        justify-end
                        mt-6
                        gap-3">
                    <button
                        className="
                            px-4
                            py-2
                            bg-gray-800
                            hover:bg-gray-700
                            rounded-md
                            transition"
                        onClick={() => {
                            setTitle("");
                            setBody("");
                        }}
                    >
                        Clear
                    </button>

                    <button
                        className="
                            px-4
                            py-2
                            bg-green-500
                            hover:bg-green-400
                            text-black
                            font-semibold
                            rounded-md
                            transition"
                        onClick={handleLockIn}
                    >
                        Lock In Mode
                    </button>
            </div>
        </div>
    </main>
    );
}