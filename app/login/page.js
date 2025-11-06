"use client";
import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FloatingLetters from "../components/FloatingLetters";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "../styles/login.css";

// function FallingElements() {
//   const count = 25; // number of spheres
//   const spheres = useMemo(
//     () =>
//       new Array(count).fill().map(() => ({
//         position: [
//           (Math.random() - 0.5) * 10,
//           Math.random() * 10,
//           (Math.random() - 0.5) * 10,
//         ],
//         speed: 0.01 + Math.random() * 0.02,
//         size: 0.2 + Math.random() * 0.3,
//       })),
//     []
//   );

//   return (
//     <Canvas
//       camera={{ position: [0, 0, 6], fov: 60 }}
//       style={{
//         position: "absolute",
//         inset: 0,
//         zIndex: 0,
//         background: "radial-gradient(circle at 50% 50%, #0b0b0b, #000)",
//       }}
//     >
//       <ambientLight intensity={0.4} />
//       <pointLight position={[10, 10, 10]} color="#00ff99" intensity={1.2} />
//       {spheres.map((props, i) => (
//         <FallingSphere key={i} {...props} />
//       ))}
//       <OrbitControls enableZoom={false} enablePan={false} />
//     </Canvas>
//   );
// }

// function FallingSphere({ position, speed, size }) {
//   const ref = useRef();
//   useFrame(() => {
//     if (ref.current) {
//       ref.current.position.y -= speed;
//       if (ref.current.position.y < -5) ref.current.position.y = 6; // loop
//       ref.current.rotation.x += 0.01;
//       ref.current.rotation.y += 0.005;
//     }
//   });

//   return (
//     <mesh ref={ref} position={position}>
//       <sphereGeometry args={[size, 32, 32]} />
//       <meshStandardMaterial
//         color="#00ff99"
//         emissive="#00ff99"
//         emissiveIntensity={0.6}
//         metalness={0.3}
//         roughness={0.2}
//       />
//     </mesh>
//   );
// }

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
      <div className="canvas-wrapper">
        <FloatingLetters /> 
      </div>

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
