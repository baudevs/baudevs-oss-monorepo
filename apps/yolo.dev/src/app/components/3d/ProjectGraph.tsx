'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, SpotLight, Center } from '@react-three/drei';
import { Group } from 'three';

const nodes = [
  { position: [0, 0, 0], color: '#60A5FA' },
  { position: [-2, 1, 1], color: '#34D399' },
  { position: [2, -1, -1], color: '#F87171' },
  { position: [-1, -2, 1], color: '#818CF8' },
  { position: [1, 2, -1], color: '#FBBF24' },
] as const;

const connections = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 3],
  [2, 4],
] as const;

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
  });

  return <Center ref={ref}>{children}</Center>;
}

export default function ProjectGraph() {
  return (
    <RotatingGroup>
      <SpotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <SpotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
      {nodes.map((node, i) => (
        <Sphere key={i} position={node.position} args={[0.2, 32, 32]} material-color={node.color} />
      ))}

      {connections.map(([start, end], i) => {
        const startPos = nodes[start].position;
        const endPos = nodes[end].position;

        return (
          <Line
            key={i}
            points={[startPos, endPos]}
            color="#4B5563"
            lineWidth={1}
          />
        );
      })}
    </RotatingGroup>
  );
} 