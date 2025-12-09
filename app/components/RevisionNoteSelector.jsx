"use client";
import React, { useEffect } from "react";
import {gsap} from "gsap";
import "../styles/RevisionNoteSelector.css";
import { IconBook, IconBrain } from '@tabler/icons-react';

//create for when notes is hover over for selection
export default function RevisionNoteSelector ({notes, onSelect}) {
    useEffect(() =>{
        gsap.from(".rev-note-card",{
            opacity: 0,
            y: 30,
            durartion: 0.6,
            stagger: 0.08,
            ease: "power3.out"
        });
    }, []);

    function handleCardClick (el, note)  {
        gsap.to(el, {
            scale: 1.15,
            rotatateY: 360,
            opacity: 0,
            y: -80,
            duration: 0.6,
            ease: "power3.inOut",
            onComplete: () => onSelect(note)
        });
    };
    
    return (
        <div className="rev-selector">
            <div className="rev-selector-header">
                <IconBrain stroke={2} />
            <div>
                <h2>Choose a note to revise</h2>
                <p>We'll generate flashcards from your saved notes</p>
            </div>
        </div>
        {notes.length === 0 && (
            <p className="rev-no-notes">
                No save Notes yet. Create a Note first in your workspace.
            </p>
        )}

            <div className="rev-note-grid">
                {notes.map((note, idx) =>(
                    <div
                        key={note.id}
                        className="rev-note-wrapper"
                    >
                        <div className="rev-note-card"
                            onClick={(e) => handleCardClick(e.currentTarget, note)}
                        >
                        <div className="rev-note-card-inner">
                            <div className="rev-note-top">
                            <IconBook className="rev-note-icon" stroke={2} />
                            <span className="rev-note-badge">                   
                                {note.content ? note.content.split(" ").length :0 } words
                            </span>
                        </div>

                        <div className="rev-note-body">
                            <p className="rev-note-subject">
                                {note.subject || "Personal Note"}
                            </p>
                            <h3 className="rev-note-title">
                                {note.title || "Untitled note"}
                            </h3>
                            {note.lastStudied && (
                                <p className="rev-note-last">
                                    Last Studied: {note.lastStudied}
                                </p>
                            )}
                        </div>
        
                        <div className="rev-note-footer">
                            <span>Click to Start</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
</div>
    );
}