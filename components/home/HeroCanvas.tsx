'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';

// Particle component for a floating sphere
const FloatingParticle = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Animate the particle
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + position[0]) * 0.5;
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.y += 0.002;
        }
    });

    return (
        <Sphere args={[0.1, 16, 16]} position={position} ref={meshRef}>
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.2} roughness={0.5} metalness={0.8} />
        </Sphere>
    );
};

// Main Hero Canvas component
const HeroCanvas = () => {
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const [mousePosition, setMousePosition] = useState<Vector3>(new Vector3(0, 0, 0));

    // Handle mouse movement to influence light position
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            setMousePosition(new Vector3(x * 5, y * 5, 0)); // Scale for effect
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame(() => {
        // Move the light based on mouse position
        if (lightRef.current) {
            lightRef.current.position.lerp(mousePosition, 0.1); // Smoothly interpolate light position
        }
        // Rotate the entire particle group slowly
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.0005;
            groupRef.current.rotation.x += 0.0001;
        }
    });

    // Generate a grid of particles
    const particles = [];
    const gridSize = 10;
    const spacing = 2;
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
        for (let y = -gridSize / 2; y < gridSize / 2; y++) {
            for (let z = -gridSize / 2; z < gridSize / 2; z++) {
                particles.push(
                    <FloatingParticle
                        key={`${x}-${y}-${z}`}
                        position={[x * spacing, y * spacing, z * spacing]}
                    />
                );
            }
        }
    }

    return (
        <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
            <ambientLight intensity={0.1} />
            <pointLight ref={lightRef} position={[0, 0, 5]} intensity={10} decay={0.5} color="#00c8ff" />
            <pointLight position={[5, 5, -5]} intensity={5} decay={0.5} color="#ff00c8" />

            <group ref={groupRef}>
                {particles}
            </group>

            {/* A subtle background plane with moving material (optional) */}
            <mesh position={[0, 0, -10]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>
            {/* Removed OrbitControls as it conflicts with mouse movement for light */}
            {/* <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} /> */}
        </Canvas>
    );
};

export default HeroCanvas;