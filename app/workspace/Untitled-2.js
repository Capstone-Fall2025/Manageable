// ...existing code...
import Link from "next/link";

export default function LandingPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold mb-6">Manageable</h1>
            <p className="text-center max-w-xl mb-8">
                A small gamified focus/task app. Choose where to go next:
            </p>

            <div className="flex gap-4">
                <Link href="/workspace" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Go to Workspace
                </Link>

                <Link href="/lockin" className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
                    Lock In Mode
                </Link>

                <Link href="/about" className="px-6 py-3 bg-gray-200 text-gray-900 rounded hover:bg-gray-300">
                    About
                </Link>
            </div>
        </main>
    );
}
// ...existing code...