'use client';
    
import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function R3FCanvas({ children }: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} gl={{ antialias: true }}>
      {children}
    </Canvas>
  );
}
