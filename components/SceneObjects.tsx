'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SceneObjects: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= 0.003;
      ringRef.current.rotation.x += 0.001;
    }
    
    // Add subtle floating motion
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group>
      {/* INNER GLOBE */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color="#FFB000" 
          wireframe 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* OUTER RING */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 8, 48]} />
        <meshBasicMaterial color="#FFB000" transparent opacity={0.3} />
      </mesh>
      
      {/* FLOATING DATA POINTS */}
      <points>
        <sphereGeometry args={[2.5, 8, 8]} />
        <pointsMaterial size={0.05} color="#FFB000" transparent opacity={0.2} />
      </points>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </group>
  );
};
