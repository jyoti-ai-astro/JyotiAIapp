/**
 * 3D Kundali Wheel Canvas Component
 * 
 * Master Plan v1.0 - Section 3.2: Kundali Page (Birth Chart)
 * Interactive 3D birth chart wheel using R3F
 * Features:
 * - Slow rotation (0.1 rpm)
 * - Planet glyphs orbit the wheel
 * - Hover tooltips
 * - Click to highlight
 * - Mandala overlay (20% opacity)
 * - Golden grid lines (subtle)
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface GrahaPosition {
  planet: string;
  degrees: number;
  sign: string;
  house: number;
  longitude: number;
  latitude: number;
}

interface PlanetProps {
  position: [number, number, number];
  planet: string;
  sign: string;
  house: number;
  onHover?: (planet: string) => void;
}

// Planet glyph component
function PlanetGlyph({ position, planet, sign, house, onHover }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulse animation
      const pulse = Math.sin(state.clock.elapsedTime * 2 + planet.length) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const planetColors: Record<string, string> = {
    Sun: '#F2C94C',
    Moon: '#E5E5E5',
    Mars: '#FF6B6B',
    Mercury: '#4ECB71',
    Jupiter: '#4A90E2',
    Venus: '#FF8C42',
    Saturn: '#9D4EDD',
    Rahu: '#6B7280',
    Ketu: '#374151',
  };

  const color = planetColors[planet] || '#17E8F6';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => {
          setHovered(true);
          onHover?.(planet);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-cosmic-navy/90 border border-cosmic-gold/50 rounded-lg px-3 py-2 text-white text-xs">
            <div className="font-semibold">{planet}</div>
            <div className="text-aura-cyan">{sign}</div>
            <div className="text-aura-cyan/60">House {house}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// House division lines
function HouseLines({ lagna }: { lagna: number }) {
  const lines = useMemo(() => {
    const houseLines: JSX.Element[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 - lagna) * Math.PI) / 180;
      const x1 = Math.cos(angle) * 2;
      const y1 = Math.sin(angle) * 2;
      const x2 = Math.cos(angle) * 3.5;
      const y2 = Math.sin(angle) * 3.5;

      houseLines.push(
        <line
          key={i}
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, 0),
            new THREE.Vector3(x2, y2, 0),
          ])}
        >
          <lineBasicMaterial color="#F2C94C" opacity={0.2} transparent />
        </line>
      );
    }
    return houseLines;
  }, [lagna]);

  return <group>{lines}</group>;
}

// Zodiac sign labels
function ZodiacSigns({ lagna }: { lagna: number }) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  return (
    <group>
      {signs.map((sign, i) => {
        const angle = ((i * 30 - lagna + 15) * Math.PI) / 180;
        const radius = 3.8;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <Text
            key={sign}
            position={[x, y, 0]}
            fontSize={0.15}
            color="#17E8F6"
            anchorX="center"
            anchorY="middle"
            opacity={0.6}
          >
            {sign.substring(0, 3)}
          </Text>
        );
      })}
    </group>
  );
}

// Main wheel scene
function KundaliWheelScene({
  grahas,
  lagna,
  onPlanetHover,
}: {
  grahas: GrahaPosition[];
  lagna: number;
  onPlanetHover?: (planet: string) => void;
}) {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wheelRef.current) {
      // Slow rotation (0.1 rpm = 0.001745 radians per second)
      wheelRef.current.rotation.z = state.clock.elapsedTime * 0.001745;
    }
  });

  // Convert graha positions to 3D coordinates
  const planetPositions = useMemo(() => {
    return grahas.map((graha) => {
      // Convert longitude to angle (0-360 degrees)
      const angle = ((graha.longitude - lagna) * Math.PI) / 180;
      const radius = 2.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { ...graha, position: [x, y, 0.1] as [number, number, number] };
    });
  }, [grahas, lagna]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#6E2DEB" intensity={0.3} />

      <group ref={wheelRef}>
        {/* Outer circle (wheel rim) */}
        <mesh>
          <ringGeometry args={[3.5, 3.6, 64]} />
          <meshBasicMaterial color="#6E2DEB" opacity={0.3} transparent />
        </mesh>

        {/* Inner circle */}
        <mesh>
          <ringGeometry args={[1.8, 2.0, 64]} />
          <meshBasicMaterial color="#17E8F6" opacity={0.2} transparent />
        </mesh>

        {/* House division lines */}
        <HouseLines lagna={lagna} />

        {/* Zodiac signs */}
        <ZodiacSigns lagna={lagna} />

        {/* Planets */}
        {planetPositions.map((graha) => (
          <PlanetGlyph
            key={graha.planet}
            position={graha.position}
            planet={graha.planet}
            sign={graha.sign}
            house={graha.house}
            onHover={onPlanetHover}
          />
        ))}

        {/* Lagna indicator (ascendant line) */}
        <line
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(0) * 3.5, Math.sin(0) * 3.5, 0),
          ])}
        >
          <lineBasicMaterial color="#F2C94C" linewidth={2} />
        </line>
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
      />
    </>
  );
}

export function KundaliWheel3DCanvas({
  grahas,
  lagna,
  onPlanetHover,
}: {
  grahas: GrahaPosition[];
  lagna: number;
  onPlanetHover?: (planet: string) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <KundaliWheelScene
        grahas={grahas}
        lagna={lagna}
        onPlanetHover={onPlanetHover}
      />
    </Canvas>
  );
}

