"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import * as THREE from "three";

export default function FloatingLetters() {
  const letters = "MANAGEABLE".split("");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background: "black",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 10]} color="#00ff99" intensity={1.5} />
        {letters.map((letter, index) => (
          <FloatingLetter key={index} letter={letter} index={index} />
        ))}
      </Canvas>
    </div>
  );
}

function FloatingLetter({ letter, index }) {
  const ref = useRef();

  const base = useMemo(() => {
    return new THREE.Vector3(
      (index - 5) * 1.8,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2
    );
  }, [index]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // const { x, y} = state.mouse;
    ref.current.position.y = base.y + Math.sin(t + index) * 0.5;
    ref.current.rotation.y = Math.sin(t / 2 + index) * 0.3;
    ref.current.rotation.x = Math.cos(t / 3 + index) * 0.2;


    //Make letters float and react to mouse movements
    // ref.current.position.x = (index - 4) * 0.8 + x * 2;
    // ref.current.position.y = Math.sin(t + index) * 0.5 + y * 2;
    // ref.current.rotation.y = Math.sin(t / 2) * 0.2;
  });

  return (
    <Text3D
      ref={ref}
      font="/fonts/helvetiker_regular.typeface.json"
      size={1}
      height={0.25}
      bevelEnabled
      bevelThickness={0.03}
      bevelSize={0.02}
      position={[base.x, base.y, base.z]}
    >
      {letter}
      <meshStandardMaterial
        color="#f7fdfaff"
        emissive="#00ff99"
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.2}
      />
    </Text3D>
  );
}
