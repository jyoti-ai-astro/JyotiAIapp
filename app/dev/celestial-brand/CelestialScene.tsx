'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import styles from './celestial-brand.module.css'

const STAR_COUNT = 180
const SOLAR_PARTICLE_COUNT = 48
const PLANET_COUNT = 4

function useDocumentVisible() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const update = () => setVisible(!document.hidden)

    update()
    document.addEventListener('visibilitychange', update)

    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return visible
}

function createRingGeometry(radius: number, yScale = 0.42, segments = 160) {
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * yScale, 0))
  }

  return new THREE.BufferGeometry().setFromPoints(points)
}

function createSacredGeometry() {
  const points: THREE.Vector3[] = []
  const radius = 2.85

  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const b = (((i + 2) % 6) / 6) * Math.PI * 2 + Math.PI / 6
    points.push(
      new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, -0.08),
      new THREE.Vector3(Math.cos(b) * radius, Math.sin(b) * radius, -0.08),
    )
  }

  return new THREE.BufferGeometry().setFromPoints(points)
}

function SceneContents({ paused }: { paused: boolean }) {
  const rootRef = useRef<THREE.Group>(null)
  const sunRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const planetRootRef = useRef<THREE.Group>(null)
  const starsRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const materialRefs = useRef<THREE.Material[]>([])

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const color = new THREE.Color()

    for (let i = 0; i < STAR_COUNT; i += 1) {
      const i3 = i * 3
      const radius = 7 + Math.random() * 11
      const theta = Math.random() * Math.PI * 2
      const depth = -3 - Math.random() * 8

      positions[i3] = Math.cos(theta) * radius
      positions[i3 + 1] = (Math.random() - 0.5) * 7
      positions[i3 + 2] = depth + Math.sin(theta) * radius * 0.22

      color.setHSL(0.11 + Math.random() * 0.08, 0.38, 0.72 + Math.random() * 0.22)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return geometry
  }, [])

  const solarParticleGeometry = useMemo(() => {
    const positions = new Float32Array(SOLAR_PARTICLE_COUNT * 3)

    for (let i = 0; i < SOLAR_PARTICLE_COUNT; i += 1) {
      const i3 = i * 3
      const angle = Math.random() * Math.PI * 2
      const radius = 1.06 + Math.random() * 1.5
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.sin(angle) * radius * 0.55
      positions[i3 + 2] = (Math.random() - 0.5) * 0.35
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    return geometry
  }, [])

  const orbitGeometries = useMemo(
    () => [createRingGeometry(1.55), createRingGeometry(2.25), createRingGeometry(3.05), createRingGeometry(3.85)],
    [],
  )
  const sacredGeometry = useMemo(() => createSacredGeometry(), [])

  const sunMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCore: { value: new THREE.Color('#fff4b7') },
        uGold: { value: new THREE.Color('#d6a84f') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec3 uCore;
        uniform vec3 uGold;
        varying vec2 vUv;
        varying vec3 vNormal;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float radial = 1.0 - smoothstep(0.02, 0.5, length(centered));
          float grain = hash(vUv * 42.0 + uTime * 0.08) * 0.08;
          float limb = pow(1.0 - abs(vNormal.z), 1.8);
          vec3 color = mix(uGold, uCore, radial);
          color += vec3(0.9, 0.42, 0.12) * limb * 0.55;
          color += grain;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
    materialRefs.current.push(material)
    return material
  }, [])

  const coronaMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        varying vec3 vNormal;
        void main() {
          float rim = pow(1.0 - abs(vNormal.z), 2.4);
          float breath = 0.84 + sin(uTime * 0.7) * 0.08;
          vec3 color = vec3(1.0, 0.62, 0.2) * rim * breath;
          gl_FragColor = vec4(color, rim * 0.38);
        }
      `,
    })
    materialRefs.current.push(material)
    return material
  }, [])

  const materials = useMemo(() => {
    const star = new THREE.PointsMaterial({
      size: 0.018,
      transparent: true,
      opacity: 0.78,
      vertexColors: true,
      depthWrite: false,
    })
    const solar = new THREE.PointsMaterial({
      size: 0.026,
      color: '#f0b85f',
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const orbit = new THREE.LineBasicMaterial({
      color: '#d6a84f',
      transparent: true,
      opacity: 0.22,
    })
    const sacred = new THREE.LineBasicMaterial({
      color: '#edd6a2',
      transparent: true,
      opacity: 0.13,
    })
    const planet = [
      new THREE.MeshStandardMaterial({ color: '#d8b463', roughness: 0.72, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ color: '#8da6a6', roughness: 0.8, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: '#b46d57', roughness: 0.84, metalness: 0.03 }),
      new THREE.MeshStandardMaterial({ color: '#d9cfb6', roughness: 0.76, metalness: 0.05 }),
    ]

    materialRefs.current.push(star, solar, orbit, sacred, ...planet)

    return { star, solar, orbit, sacred, planet }
  }, [])

  const lineObjects = useMemo(
    () => ({
      sacred: new THREE.LineSegments(sacredGeometry, materials.sacred),
      orbits: orbitGeometries.map((geometry) => new THREE.Line(geometry, materials.orbit)),
    }),
    [materials.orbit, materials.sacred, orbitGeometries, sacredGeometry],
  )

  useFrame((state, delta) => {
    if (paused) return

    const elapsed = state.clock.elapsedTime
    const step = Math.min(delta, 0.032)

    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(elapsed * 0.06) * 0.045
      rootRef.current.rotation.x = Math.sin(elapsed * 0.04) * 0.018
    }
    if (sunRef.current) {
      sunRef.current.rotation.y += step * 0.045
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1.48 + Math.sin(elapsed * 0.68) * 0.035)
    }
    if (planetRootRef.current) {
      planetRootRef.current.rotation.z += step * 0.024
    }
    if (starsRef.current) {
      starsRef.current.rotation.y += step * 0.006
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z -= step * 0.045
      particlesRef.current.rotation.y += step * 0.018
    }
    sunMaterial.uniforms.uTime.value = elapsed
    coronaMaterial.uniforms.uTime.value = elapsed
  })

  useEffect(() => {
    return () => {
      starGeometry.dispose()
      solarParticleGeometry.dispose()
      sacredGeometry.dispose()
      orbitGeometries.forEach((geometry) => geometry.dispose())
      materialRefs.current.forEach((material) => material.dispose())
    }
  }, [orbitGeometries, sacredGeometry, solarParticleGeometry, starGeometry])

  const planets = [
    { radius: 1.55, size: 0.075, offset: 0.4, z: 0.28 },
    { radius: 2.25, size: 0.115, offset: 2.1, z: -0.18 },
    { radius: 3.05, size: 0.09, offset: 3.8, z: 0.18 },
    { radius: 3.85, size: 0.135, offset: 5.1, z: -0.32 },
  ]

  return (
    <group ref={rootRef} position={[0.85, 0.06, 0]}>
      <points ref={starsRef} geometry={starGeometry} material={materials.star} />

      <group rotation={[0.18, -0.18, -0.12]}>
        <primitive object={lineObjects.sacred} />
        {lineObjects.orbits.map((line, index) => (
          <primitive
            key={index}
            object={line}
            rotation={[0.18, 0.06 * index, 0]}
          />
        ))}

        <mesh ref={sunRef} material={sunMaterial}>
          <sphereGeometry args={[0.92, 64, 64]} />
        </mesh>
        <mesh ref={coronaRef} material={coronaMaterial}>
          <sphereGeometry args={[1.28, 48, 48]} />
        </mesh>
        <points ref={particlesRef} geometry={solarParticleGeometry} material={materials.solar} />

        <group ref={planetRootRef}>
          {planets.map((planet, index) => {
            const angle = planet.offset
            return (
              <mesh
                key={index}
                material={materials.planet[index]}
                position={[
                  Math.cos(angle) * planet.radius,
                  Math.sin(angle) * planet.radius * 0.42,
                  planet.z,
                ]}
              >
                <sphereGeometry args={[planet.size, 24, 24]} />
              </mesh>
            )
          })}
        </group>
      </group>

      <ambientLight intensity={0.38} />
      <pointLight position={[0, 0, 1.2]} intensity={7.5} color="#f4c96f" distance={8} />
      <pointLight position={[-3, 2, 4]} intensity={0.5} color="#b8c8c0" />
    </group>
  )
}

export default function CelestialScene() {
  const visible = useDocumentVisible()

  return (
    <div className={styles.scene} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42, near: 0.1, far: 30 }}
        dpr={[1, 1.6]}
        frameloop={visible ? 'always' : 'demand'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
      >
        <SceneContents paused={!visible} />
      </Canvas>
    </div>
  )
}
