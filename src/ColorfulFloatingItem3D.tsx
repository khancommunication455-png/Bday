import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const ColorfulFloatingItem3D = ({ color = "#ffb7c5", scale = 1, speed = 1, variant = 0 }: any) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5 * speed;
      mesh.current.position.y = Math.sin(state.clock.getElapsedTime() * 2 * speed) * 0.15;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh ref={mesh} scale={scale}>
        {variant === 0 ? <icosahedronGeometry args={[1, 0]} /> : variant === 1 ? <boxGeometry args={[1, 1, 1]} /> : <torusGeometry args={[0.7, 0.3, 12, 24]} />}
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8} 
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};
