'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, PerspectiveCamera, SpotLight } from '@react-three/drei';


export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'black' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <Box args={[1, 1, 1]} material-color="orange" />
        <OrbitControls />
        <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <SpotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} />
      </Canvas>
    </div>
  );
} 