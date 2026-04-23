'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ASCII_SHADER } from './AsciiShaderMaterial';
import { SceneObjects } from './SceneObjects';
import { useSystem } from '@/context/SystemContext';

const ASCIIEffect = () => {
  const { size } = useThree();
  const { actualPerformance } = useSystem();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create an offline buffer to render the 3D scene
  const sceneBuffer = useFBO();
  const secondaryScene = useMemo(() => new THREE.Scene(), []);
  
  // Fixed amber color — no theme switching
  const primaryColor = '#FFB000';

  useFrame((state) => {
    const { gl, camera } = state;
    
    // 1. Render the secondary scene (SceneObjects) to the buffer
    gl.setRenderTarget(sceneBuffer);
    gl.render(secondaryScene, camera);
    gl.setRenderTarget(null);
    
    // 2. Update material uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.tDiffuse.value = sceneBuffer.texture;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uPrimaryColor.value.set(primaryColor);
      
      // Adapt resolution based on performance
      materialRef.current.uniforms.uCharSize.value = actualPerformance === 'low' ? 12.0 : 8.0;
    }
  });

  return (
    <>
      {/* 3D Scene rendered via portal to local scene */}
      {createPortal(<SceneObjects />, secondaryScene)}

      {/* Screen-space quad with ASCII shader */}
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          {...ASCII_SHADER}
          transparent={true}
        />
      </mesh>
    </>
  );
};

export const ASCIIEngine: React.FC = () => {
  const { device } = useSystem();

  // Mobile: skip WebGL entirely — don't load the Canvas at all
  if (device === 'mobile') {
    return (
      <div
        className="w-full h-full min-h-[200px] flex flex-col items-center justify-center font-mono"
        aria-label="Visual engine disabled — mobile safe mode"
      >
        <p className="text-[9px] tracking-[0.5em] text-primary/30 uppercase">
          &gt; VISUAL_ENGINE_DISABLED
        </p>
        <p className="text-[11px] tracking-[0.3em] text-primary/50 uppercase pt-1">
          MOBILE SAFE MODE ACTIVE
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas dpr={[1, 1.5]}>
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={1} />
        <ASCIIEffect />
      </Canvas>
      
      {/* HUD Label for the visualizer */}
      <div className="absolute top-4 left-4 font-mono text-[9px] opacity-30 uppercase tracking-[0.5em] pointer-events-none">
        &gt; LIVE_ARTIFACT_RENDERING // 60FPS
      </div>
    </div>
  );
};
