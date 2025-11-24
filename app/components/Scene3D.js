'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Ring } from '@react-three/drei';
import { useRef } from 'react';

// Sun
function Sun() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial
        color="#fdb813"
        emissive="#fdb813"
        emissiveIntensity={0.8}
        roughness={0.3}
      />
    </mesh>
  );
}

// Planet component
function Planet({ distance, size, color, speed, orbitSpeed, hasRing = false }) {
  const groupRef = useRef();
  const meshRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += orbitSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += speed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {hasRing && (
        <mesh position={[distance, 0, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
          <meshStandardMaterial
            color="#8b9dc3"
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      )}
      {/* Orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.01, distance + 0.01, 128]} />
        <meshBasicMaterial
          color="#4a5568"
          transparent
          opacity={0.15}
          side={2}
        />
      </mesh>
    </group>
  );
}

// Small satellites/asteroids
function Satellite({ distance, size, color, speed }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += speed;
      const angle = state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.cos(angle) * distance;
      meshRef.current.position.z = Math.sin(angle) * distance;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[size, size * 0.6, size * 1.2]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-slate-950">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#fdb813" />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.3}
        />
        
        {/* Sun */}
        <Sun />
        
        {/* Planets - Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune */}
        <Planet distance={2.5} size={0.15} color="#8c7853" speed={0.02} orbitSpeed={0.015} />
        <Planet distance={3.5} size={0.25} color="#ffc649" speed={0.015} orbitSpeed={0.012} />
        <Planet distance={4.8} size={0.28} color="#4a90e2" speed={0.018} orbitSpeed={0.010} />
        <Planet distance={6} size={0.2} color="#e27b58" speed={0.019} orbitSpeed={0.008} />
        <Planet distance={8} size={0.6} color="#c88b3a" speed={0.025} orbitSpeed={0.005} />
        <Planet distance={10.5} size={0.55} color="#daa520" speed={0.022} orbitSpeed={0.004} hasRing={true} />
        <Planet distance={12.5} size={0.35} color="#4fd0e0" speed={0.016} orbitSpeed={0.003} />
        <Planet distance={14} size={0.33} color="#4169e1" speed={0.014} orbitSpeed={0.002} />
        
        {/* Satellites/Space stations */}
        <Satellite distance={5.5} size={0.08} color="#3b82f6" speed={0.02} />
        <Satellite distance={7.2} size={0.06} color="#8b5cf6" speed={0.015} />
        <Satellite distance={9.5} size={0.07} color="#ec4899" speed={0.018} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={8}
          maxDistance={25}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
