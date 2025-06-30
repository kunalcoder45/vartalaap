'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';

function SpinningBox({ position }: { position: [number, number, number] }) {
  const mesh = useRef<Mesh>(null);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.005;
      mesh.current.rotation.y += 0.007;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial color="cyan" wireframe />
    </mesh>
  );
}

export default function BoxyBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight />
        <directionalLight position={[5, 5, 5]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate />

        {Array.from({ length: 40 }).map((_, i) => (
          <SpinningBox
            key={i}
            position={[
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12,
            ]}
          />
        ))}
      </Canvas>
    </div>
  );
}
