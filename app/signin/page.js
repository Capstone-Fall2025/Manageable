"use client";
import { useRouter } from "next/navigation";
import "../styles/signin.css"

export default function SignInPage() {
    const router = useRouter();

    const handleSignIn = (e) => {
        e.preventDefault();
        router.push("/home");
    };
    return(
        <div className="signin">
            <h2>Welcome back</h2>
            <form onSubmit ={handleSignIn}>
                <input type ="text" placeholder ="Username" />
                <input type ="password" placeholder ="Password" />
                <button type ="submit">Sign In</button>
            </form>
            <p className="hint">
                No account? <span>Sign up</span>
            </p>
        </div>
    );
}