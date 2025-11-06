export async function POST(req) {
    try{
        const { content,title } = await req.json();
        if (!content || typeof content !== "string")
            return Response.json({ success: false,error:"Invalid Content"},{ status: 400 })

    const lines = content.split(/\r?\n/);  //split lines 
    const flashcards = [];

    let currentSection = title || "General";
    let currentSubsection = null;
    let buffer = [];
    let indentStack = [];

    const flushBuffer = () => {
        if (buffer.length > 0) {
            flashcards.push ({
                question:`List key points of ${currentSubsection || currentSection}`,
                answer: buffer.join(", "),
                section: currentSubsection || currentSection,
            });
            buffer = [];
        }
    };
    for (let line of lines) {
        if (!line.trim()) continue;

        const indent = line.match(/^\s*/) [0].length;
        const text = line.trim();

        //Adjust hierarchy based on indentation
        while (indentStack.length && indent< indentStack[indentStack.length - 1].indent){
            indentStack.pop();
        }

        // Detect new section or subsection
        if(/^#{1,6}\s*/.test(text) || /^[A-Z][A-Za-z\s&]+$/.test(text)) {
            flushBuffer();
            currentSection = text.replace(/^#{1,6}\s*/, "").trim();
            currentSection = null;
            indentStack = [{ title: currentSection, indent }];
            continue;
        }

        if (text.endsWith(":") || /^[A-Z].*:$/.test(text)) {
            flushBuffer();
            currentSubsection = text.replace(":", "").trim();
            indentStack.push({ title: currentSubsection, indent });
            continue;
      }
      //Cases for Definitions
        if (text.includes(" - ") && !text.startsWith("-")) {
            const [term,def] = text.split(" - ")
            flashcards.push({
                question: `What is ${term.trim ()}?`,
                answer: def.trim(),
                section: currentSubsection || currentSection,
            });
            continue;
        }

        if (text.toLowerCase().includes(" is ") && text.split (" ").length < 20) {
            const [term,def] = text.split(/ is /i);
            flashcards.push({
                question: `What is ${term.trim()}?`,
                answer: def?.trim || "",
                section: currentSubsection || currentSection
            });
            continue;
        }

        //Cases for Comparison
        if (/\b(vs|versus)\b/i.test(text)) {
            const [a, b] = text.split(/\b(vs|versus)\b/i);
            flashcards.push ({
                question:`What is the difference between ${a.trim()} and  ${b.trim}?`,
                answer: `Compare their definitions or features.`,
                section: currentSubsection || currentSection,

            });
            continue;
        }

        //Cause and Effect
        if(text.toLowerCase().includes(" because ")) {
            const [effect, cause] = text.split(/ because /i);
            flashcards.push ({
                question:`Why ${effect.trim}?`,
                answer:`Because ${cause.trim}`,
                section: currentSubsection || currentSection,
            });
            continue;
        }
        // Cases for Advantages( pros) and Disadvantages (cons)
        if (/advantages?| disadvantages?|pros|cons/i.test(text)) {
            flashcards.push ({
                question:`List the ${text}`,
                answer:"Summarize the pros and cons mentioned in the section.",
                section: currentSubsection || currentSection,
            })
            continue;
        }
        // Cases for Bullet point
        if (/^[-•*+]\s*/.test(text)) {
            buffer.push(text.replace(/^[-•*+]\s*/, "").trim());
            continue;
        }
        //Cases for paragrpahs and long statements into summary
        if (text.split("").length > 6){
            flashcards.push ({
                question:`Summarize: ${text.split(" ").slice(0,5).join(" ")}....`,
                answer: text,
                section: currentSubsection || currentSection,
            });
            continue;
        }
    }

    flushBuffer();

    if (flashcards.length == 0) {
        flashcards.push({
            question: "Summarize this note:",
            answer: content.slice(0, 200),
            section: currentSection,
        });
    }

    return Response.json({ success: true, flashcards});
} catch (error) {
    console.error(" Flashcards generation error:", error);
    return Response.json({ success: false, error: "Internal Server error" }, { status: 500});
}
}