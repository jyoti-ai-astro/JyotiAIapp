/**
 * Astrological Wheel 3D Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * 3D rotating zodiac wheel with 12 signs, slow continuous rotation (0.1 rpm), click to open horoscope modal
 */

'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const zodiacSigns = [
  { name: 'Aries', symbol: '♈', color: '#FF6B6B' },
  { name: 'Taurus', symbol: '♉', color: '#4ECB71' },
  { name: 'Gemini', symbol: '♊', color: '#17E8F6' },
  { name: 'Cancer', symbol: '♋', color: '#F2C94C' },
  { name: 'Leo', symbol: '♌', color: '#FF8C42' },
  { name: 'Virgo', symbol: '♍', color: '#9D4EDD' },
  { name: 'Libra', symbol: '♎', color: '#FF6B6B' },
  { name: 'Scorpio', symbol: '♏', color: '#4ECB71' },
  { name: 'Sagittarius', symbol: '♐', color: '#17E8F6' },
  { name: 'Capricorn', symbol: '♑', color: '#F2C94C' },
  { name: 'Aquarius', symbol: '♒', color: '#FF8C42' },
  { name: 'Pisces', symbol: '♓', color: '#9D4EDD' },
];

function ZodiacWheel({ onSignClick }: { onSignClick: (sign: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // 0.1 rpm = 0.1 * 360 / 60 = 0.6 degrees per second
      groupRef.current.rotation.z += (0.1 * Math.PI * 2) / 60 / 60; // Convert to radians per frame
    }
  });

  return (
    <group ref={groupRef}>
      {/* Zodiac Ring */}
      <mesh>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshBasicMaterial
          color="#F2C94C"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Zodiac Signs */}
      {zodiacSigns.map((sign, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 2.9;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <group key={sign.name} position={[x, y, 0]}>
            <mesh
              onClick={() => onSignClick(sign.name)}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <circleGeometry args={[0.15, 32]} />
              <meshBasicMaterial color={sign.color} />
            </mesh>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.15}
              color={sign.color}
              anchorX="center"
              anchorY="middle"
            >
              {sign.symbol}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.1}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              {sign.name}
            </Text>
          </group>
        );
      })}

      {/* Central point */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#F2C94C" />
      </mesh>
    </group>
  );
}

export function AstrologicalWheel3D() {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignClick = (sign: string) => {
    setSelectedSign(sign);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="astrological-wheel" className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
              Explore Your Zodiac
            </h2>
            <p className="text-xl md:text-2xl text-gold font-heading">
              Click on any sign to discover your horoscope
            </p>
          </motion.div>

          <div className="w-full h-[500px] max-w-2xl mx-auto">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <ZodiacWheel onSignClick={handleSignClick} />
              </Suspense>
              <OrbitControls enableZoom={true} enablePan={false} />
            </Canvas>
          </div>
        </div>
      </section>

      {/* Horoscope Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-cosmic-indigo/95 backdrop-blur-sm border border-cosmic-purple/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display text-gold">
              {selectedSign} Horoscope
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Your cosmic guidance for today
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-white/80">
              Full horoscope details for {selectedSign} will be available after login.
              Get personalized predictions, compatibility analysis, and daily guidance.
            </p>
            <Button
              className="w-full bg-gold text-cosmic-navy hover:bg-gold-light"
              onClick={() => setIsModalOpen(false)}
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

