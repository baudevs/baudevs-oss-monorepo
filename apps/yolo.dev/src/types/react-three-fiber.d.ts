declare module '@react-three/fiber' {
  import { ReactNode } from 'react';
  import { Scene, Camera, WebGLRenderer } from 'three';
  
  interface RootState {
    scene: Scene;
    camera: Camera;
    gl: WebGLRenderer;
  }
  
  interface CanvasProps {
    children?: ReactNode;
    camera?: { position: [number, number, number] };
    gl?: { antialias: boolean };
  }
  
  export const Canvas: React.FC<CanvasProps>;
  export function useFrame(callback: (state: RootState, delta: number) => void): void;
} 