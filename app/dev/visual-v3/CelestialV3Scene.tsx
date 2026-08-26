'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  progress: number
}

type GrahaDefinition = {
  key: string
  name: string
  vedicName: string
  distance: number
  radius: number
  speed: number
  color: string
  emissive: string
  phase: number
  inclination: number
  verticalScale: number
  ring?: boolean
  node?: boolean
}

const grahas: GrahaDefinition[] = [
  {
    key: 'chandra',
    name: 'Moon',
    vedicName: 'Chandra',
    distance: 3.35,
    radius: 0.16,
    speed: 0.32,
    color: '#e8dfbd',
    emissive: '#6d654f',
    phase: 0.3,
    inclination: 0.16,
    verticalScale: 0.56,
  },
  {
    key: 'budha',
    name: 'Mercury',
    vedicName: 'Budha',
    distance: 4.05,
    radius: 0.13,
    speed: 0.27,
    color: '#9d9276',
    emissive: '#41392c',
    phase: 1.1,
    inclination: -0.2,
    verticalScale: 0.48,
  },
  {
    key: 'shukra',
    name: 'Venus',
    vedicName: 'Shukra',
    distance: 4.72,
    radius: 0.2,
    speed: 0.22,
    color: '#d8b36c',
    emissive: '#5c401d',
    phase: 2.0,
    inclination: 0.24,
    verticalScale: 0.5,
  },
  {
    key: 'mangala',
    name: 'Mars',
    vedicName: 'Mangala',
    distance: 5.42,
    radius: 0.19,
    speed: 0.18,
    color: '#a94824',
    emissive: '#541607',
    phase: 2.85,
    inclination: -0.34,
    verticalScale: 0.52,
  },
  {
    key: 'guru',
    name: 'Jupiter',
    vedicName: 'Guru',
    distance: 6.18,
    radius: 0.38,
    speed: 0.135,
    color: '#b9834f',
    emissive: '#4a2814',
    phase: 3.6,
    inclination: 0.3,
    verticalScale: 0.46,
  },
  {
    key: 'shani',
    name: 'Saturn',
    vedicName: 'Shani',
    distance: 7.0,
    radius: 0.31,
    speed: 0.105,
    color: '#aa9870',
    emissive: '#39301f',
    phase: 4.45,
    inclination: -0.18,
    verticalScale: 0.5,
    ring: true,
  },
  {
    key: 'rahu',
    name: 'North Node',
    vedicName: 'Rahu',
    distance: 7.85,
    radius: 0.15,
    speed: -0.08,
    color: '#4d8582',
    emissive: '#123c3b',
    phase: 5.1,
    inclination: 0.48,
    verticalScale: 0.42,
    node: true,
  },
  {
    key: 'ketu',
    name: 'South Node',
    vedicName: 'Ketu',
    distance: 7.85,
    radius: 0.15,
    speed: -0.08,
    color: '#a5673d',
    emissive: '#4b2413',
    phase: 5.1 + Math.PI,
    inclination: 0.48,
    verticalScale: 0.42,
    node: true,
  },
]

const sunVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`

const sunFragmentShader = `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;

float plasma(vec3 p) {
  float a = sin(p.x * 4.5 + uTime * 0.65);
  float b = sin(p.y * 6.2 - uTime * 0.42);
  float c = sin((p.x + p.y + p.z) * 5.1 + uTime * 0.31);
  float d = sin(length(p.xy) * 10.0 - uTime * 0.85);

  return (a + b + c + d) * 0.25;
}

void main() {
  float p = plasma(vPosition);

  vec3 deep = vec3(0.78, 0.18, 0.015);
  vec3 middle = vec3(1.0, 0.39, 0.035);
  vec3 hot = vec3(1.0, 0.82, 0.28);

  vec3 color = mix(deep, middle, p * 0.5 + 0.5);

  float fresnel = pow(
    1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0),
    2.0
  );

  color = mix(
    color,
    hot,
    clamp(fresnel + p * 0.14, 0.0, 1.0)
  );

  gl_FragColor = vec4(color, 1.0);
}
`

function StarField() {
  const group = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const count = 2200
    const positions = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const radius = 12 + Math.random() * 32
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[index * 3] =
        radius * Math.sin(phi) * Math.cos(theta)

      positions[index * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta)

      positions[index * 3 + 2] =
        radius * Math.cos(phi)
    }

    const result = new THREE.BufferGeometry()

    result.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    return result
  }, [])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((state) => {
    if (!group.current) return

    group.current.rotation.y =
      state.clock.getElapsedTime() * 0.006
  })

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          color="#fff1c8"
          size={0.025}
          transparent
          opacity={0.68}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

function CelestialDust() {
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const count = 1100
    const positions = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2
      const radius = 2.8 + Math.random() * 7.8
      const spread = (Math.random() - 0.5) * 1.25

      positions[index * 3] = Math.cos(angle) * radius
      positions[index * 3 + 1] =
        Math.sin(angle) * radius * 0.42 + spread
      positions[index * 3 + 2] =
        (Math.random() - 0.5) * 2.6
    }

    const result = new THREE.BufferGeometry()

    result.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    return result
  }, [])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.z += delta * 0.006
    }
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color="#d9b75f"
        size={0.018}
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </points>
  )
}

function OrbitRing({
  radius,
  inclination,
  verticalScale,
  node = false,
}: {
  radius: number
  inclination: number
  verticalScale: number
  node?: boolean
}) {
  const object = useMemo(() => {
    const points: THREE.Vector3[] = []

    for (let index = 0; index <= 200; index += 1) {
      const angle = (index / 200) * Math.PI * 2

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * verticalScale,
          Math.sin(angle) * inclination
        )
      )
    }

    const geometry =
      new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({
      color: node ? '#4c8988' : '#c9a24a',
      transparent: true,
      opacity: node ? 0.12 : 0.13,
      depthWrite: false,
    })

    return new THREE.LineLoop(geometry, material)
  }, [inclination, node, radius, verticalScale])

  useEffect(() => {
    return () => {
      object.geometry.dispose()

      const material = object.material

      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose())
      } else {
        material.dispose()
      }
    }
  }, [object])

  return <primitive object={object} />
}

function SaturnRing() {
  return (
    <mesh rotation={[Math.PI / 2.35, 0.25, 0]}>
      <ringGeometry args={[0.42, 0.66, 64]} />
      <meshBasicMaterial
        color="#c6ae7d"
        transparent
        opacity={0.48}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Graha({
  definition,
}: {
  definition: GrahaDefinition
}) {
  const group = useRef<THREE.Group>(null)
  const planet = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const time =
      state.clock.getElapsedTime() * definition.speed +
      definition.phase

    if (group.current) {
      group.current.position.set(
        Math.cos(time) * definition.distance,
        Math.sin(time) *
          definition.distance *
          definition.verticalScale,
        Math.sin(time * 0.83) * definition.inclination
      )
    }

    if (planet.current) {
      planet.current.rotation.y += delta * 0.28
      planet.current.rotation.x += delta * 0.07
    }

    if (halo.current) {
      const pulse =
        1 +
        Math.sin(
          state.clock.getElapsedTime() * 1.4 +
            definition.phase
        ) *
          0.06

      halo.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={group}>
      {definition.node ? (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry
              args={[
                definition.radius * 1.15,
                definition.radius * 0.34,
                18,
                48,
              ]}
            />
            <meshStandardMaterial
              color={definition.color}
              emissive={definition.emissive}
              emissiveIntensity={0.8}
              roughness={0.5}
            />
          </mesh>

          <mesh ref={halo}>
            <sphereGeometry
              args={[
                definition.radius * 1.8,
                24,
                24,
              ]}
            />
            <meshBasicMaterial
              color={definition.color}
              transparent
              opacity={0.07}
              depthWrite={false}
            />
          </mesh>
        </>
      ) : (
        <>
          <mesh ref={planet}>
            <sphereGeometry
              args={[
                definition.radius,
                48,
                48,
              ]}
            />

            <meshStandardMaterial
              color={definition.color}
              emissive={definition.emissive}
              emissiveIntensity={0.35}
              roughness={0.72}
              metalness={0.04}
            />
          </mesh>

          {definition.ring ? <SaturnRing /> : null}

          <mesh ref={halo}>
            <sphereGeometry
              args={[
                definition.radius * 1.45,
                32,
                32,
              ]}
            />

            <meshBasicMaterial
              color={definition.color}
              transparent
              opacity={0.045}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

function Sun() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const sun = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (material.current) {
      material.current.uniforms.uTime.value =
        state.clock.getElapsedTime()
    }

    if (sun.current) {
      sun.current.rotation.y += delta * 0.035
    }
  })

  return (
    <group ref={sun}>
      <mesh>
        <sphereGeometry args={[2.05, 96, 96]} />

        <shaderMaterial
          ref={material}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={{
            uTime: { value: 0 },
          }}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.22, 72, 72]} />

        <meshBasicMaterial
          color="#ff8a1f"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.5, 72, 72]} />

        <meshBasicMaterial
          color="#ffb74d"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        color="#ff9d3b"
        intensity={12}
        distance={26}
        decay={2}
      />
    </group>
  )
}

function ChartWheel({
  opacity,
}: {
  opacity: number
}) {
  const group = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const objects: THREE.Object3D[] = []

    const createMaterial = (value: number) =>
      new THREE.LineBasicMaterial({
        color: '#e3bc66',
        transparent: true,
        opacity: value,
      })

    const outerCurve = new THREE.EllipseCurve(
      0,
      0,
      3.45,
      3.45,
      0,
      Math.PI * 2
    )

    const outerPoints = outerCurve
      .getPoints(180)
      .map(
        (point) =>
          new THREE.Vector3(point.x, point.y, 0)
      )

    objects.push(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          outerPoints
        ),
        createMaterial(0.46)
      )
    )

    const innerCurve = new THREE.EllipseCurve(
      0,
      0,
      2.3,
      2.3,
      0,
      Math.PI * 2
    )

    const innerPoints = innerCurve
      .getPoints(160)
      .map(
        (point) =>
          new THREE.Vector3(point.x, point.y, 0)
      )

    objects.push(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          innerPoints
        ),
        createMaterial(0.24)
      )
    )

    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2

      const start = new THREE.Vector3(
        Math.cos(angle) * 2.3,
        Math.sin(angle) * 2.3,
        0
      )

      const end = new THREE.Vector3(
        Math.cos(angle) * 3.45,
        Math.sin(angle) * 3.45,
        0
      )

      objects.push(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            start,
            end,
          ]),
          createMaterial(0.25)
        )
      )
    }

    return objects
  }, [])

  useEffect(() => {
    return () => {
      geometry.forEach((object) => {
        if (
          object instanceof THREE.Line ||
          object instanceof THREE.LineLoop
        ) {
          object.geometry.dispose()

          const material = object.material

          if (Array.isArray(material)) {
            material.forEach((entry) =>
              entry.dispose()
            )
          } else {
            material.dispose()
          }
        }
      })
    }
  }, [geometry])

  useFrame((state, delta) => {
    if (!group.current) return

    group.current.rotation.z += delta * 0.045
    group.current.rotation.x =
      Math.sin(
        state.clock.getElapsedTime() * 0.15
      ) * 0.08
  })

  return (
    <group
      ref={group}
      position={[0, 0, 0.1]}
      scale={opacity}
      visible={opacity > 0.02}
    >
      {geometry.map((object, index) => (
        <primitive
          key={index}
          object={object}
        />
      ))}

      {Array.from({ length: 9 }).map((_, index) => {
        const angle =
          (index / 9) * Math.PI * 2 + 0.38

        const radius =
          2.55 + (index % 3) * 0.22

        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0.12,
            ]}
          >
            <sphereGeometry
              args={[
                0.075 + (index % 2) * 0.025,
                24,
                24,
              ]}
            />

            <meshBasicMaterial
              color={
                index % 3 === 0
                  ? '#f4a53b'
                  : index % 3 === 1
                    ? '#d9c48b'
                    : '#4e8582'
              }
            />
          </mesh>
        )
      })}
    </group>
  )
}


function KundaliArchitecture({
  opacity,
}: {
  opacity: number
}) {
  const group = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const objects: THREE.Object3D[] = []

    const lineMaterial = (
      color: string,
      alpha: number
    ) =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: alpha,
        depthWrite: false,
      })

    const ringRadii = [2.05, 2.7, 3.35]

    ringRadii.forEach((radius, index) => {
      const curve = new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius,
        0,
        Math.PI * 2
      )

      const points = curve
        .getPoints(180)
        .map(
          (point) =>
            new THREE.Vector3(
              point.x,
              point.y,
              index * 0.16 - 0.14
            )
        )

      objects.push(
        new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(
            points
          ),
          lineMaterial(
            index === 2
              ? '#f1c56f'
              : '#8f7545',
            index === 2 ? 0.38 : 0.18
          )
        )
      )
    })

    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2

      const inner = new THREE.Vector3(
        Math.cos(angle) * 2.05,
        Math.sin(angle) * 2.05,
        -0.14
      )

      const outer = new THREE.Vector3(
        Math.cos(angle) * 3.35,
        Math.sin(angle) * 3.35,
        0.18
      )

      objects.push(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            inner,
            outer,
          ]),
          lineMaterial('#d9b75f', 0.22)
        )
      )
    }

    return objects
  }, [])

  useEffect(() => {
    return () => {
      geometry.forEach((object) => {
        if (
          object instanceof THREE.Line ||
          object instanceof THREE.LineLoop
        ) {
          object.geometry.dispose()

          const material = object.material

          if (Array.isArray(material)) {
            material.forEach((item) =>
              item.dispose()
            )
          } else {
            material.dispose()
          }
        }
      })
    }
  }, [geometry])

  useFrame((state, delta) => {
    if (!group.current) return

    group.current.rotation.z += delta * 0.026

    group.current.rotation.x =
      -0.22 +
      Math.sin(
        state.clock.getElapsedTime() * 0.28
      ) * 0.025
  })

  return (
    <group
      ref={group}
      visible={opacity > 0.02}
      scale={opacity}
      rotation={[0.28, -0.22, 0]}
    >
      {geometry.map((object, index) => (
        <primitive
          key={`kundali-geometry-${index}`}
          object={object}
        />
      ))}

      {Array.from({ length: 12 }).map(
        (_, index) => {
          const angle =
            (index / 12) * Math.PI * 2

          return (
            <mesh
              key={`bhava-node-${index}`}
              position={[
                Math.cos(angle) * 3.35,
                Math.sin(angle) * 3.35,
                0.24,
              ]}
            >
              <sphereGeometry
                args={[0.055, 18, 18]}
              />
              <meshBasicMaterial
                color={
                  index % 3 === 0
                    ? '#f3a53a'
                    : index % 3 === 1
                      ? '#d9c48b'
                      : '#4e8582'
                }
              />
            </mesh>
          )
        }
      )}
    </group>
  )
}

function GuruIntelligenceField({
  opacity,
}: {
  opacity: number
}) {
  const group = useRef<THREE.Group>(null)

  const nodes = useMemo(
    () => [
      [-2.2, 0.8, 0.1],
      [-1.25, 1.55, 0.55],
      [0.0, 1.9, 0.9],
      [1.35, 1.35, 0.45],
      [2.1, 0.25, 0.0],
      [1.3, -1.25, 0.35],
      [0.0, -1.65, 0.75],
      [-1.55, -1.15, 0.25],
    ] as const,
    []
  )

  const links = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: '#d9b75f',
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })

    const pairs = [
      [0, 2],
      [1, 4],
      [2, 5],
      [3, 6],
      [4, 7],
      [0, 6],
      [1, 5],
      [3, 7],
    ]

    return pairs.map(([a, b]) => {
      const start = nodes[a]
      const end = nodes[b]

      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...start),
          new THREE.Vector3(...end),
        ]),
        material.clone()
      )
    })
  }, [nodes])

  useEffect(() => {
    return () => {
      links.forEach((line) => {
        line.geometry.dispose()

        const material = line.material

        if (Array.isArray(material)) {
          material.forEach((entry) =>
            entry.dispose()
          )
        } else {
          material.dispose()
        }
      })
    }
  }, [links])

  useFrame((state, delta) => {
    if (!group.current) return

    const elapsed =
      state.clock.getElapsedTime()

    group.current.rotation.y += delta * 0.045
    group.current.rotation.z =
      Math.sin(elapsed * 0.22) * 0.06
  })

  return (
    <group
      ref={group}
      visible={opacity > 0.02}
      scale={opacity}
    >
      {/* A2.10 v6 — restrained intelligence core.
          Guru must read as a connected intelligence field,
          not as another orange planet. */}
      {/* A2.13 — intelligence core remains intentionally small.
          The network, not the primitive, owns this chapter. */}
      <mesh scale={0.34}>
        <icosahedronGeometry args={[0.52, 2]} />
        <meshStandardMaterial
          color="#d9b75f"
          emissive="#9d6b13"
          emissiveIntensity={0.55}
          roughness={0.48}
          metalness={0.16}
          transparent
          opacity={0.78}
        />
      </mesh>

      <pointLight
        color="#d9b75f"
        intensity={2.8}
        distance={7}
      />

      {links.map((line, index) => (
        <primitive
          key={`guru-link-${index}`}
          object={line}
        />
      ))}

      {nodes.map((node, index) => (
        <mesh
          key={`guru-node-${index}`}
          position={[...node]}
        >
          <sphereGeometry
            args={[
              index % 3 === 0
                ? 0.078
                : 0.052,
              22,
              22,
            ]}
          />
          <meshStandardMaterial
            color={
              index % 3 === 0
                ? '#f1c56f'
                : index % 3 === 1
                  ? '#4e8582'
                  : '#fff0c8'
            }
            emissive={
              index % 3 === 0
                ? '#9d6b13'
                : '#0d3534'
            }
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

function TemporalArchitecture({
  opacity,
}: {
  opacity: number
}) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return

    const elapsed =
      state.clock.getElapsedTime()

    group.current.rotation.z =
      Math.sin(elapsed * 0.11) * 0.035
  })

  return (
    <group
      ref={group}
      visible={opacity > 0.02}
      scale={opacity}
      rotation={[0.12, -0.48, 0]}
    >
      {Array.from({ length: 7 }).map(
        (_, index) => {
          const depth =
            -index * 0.58

          const scale =
            1 + index * 0.085

          return (
            <group
              key={`time-gate-${index}`}
              position={[0, 0, depth]}
              scale={scale}
            >
              <mesh>
                <torusGeometry
                  args={[
                    1.82,
                    0.012,
                    8,
                    128,
                  ]}
                />
                <meshBasicMaterial
                  color={
                    index % 3 === 0
                      ? '#d9b75f'
                      : index % 3 === 1
                        ? '#4e8582'
                        : '#f0d9a5'
                  }
                  transparent
                  opacity={
                    0.34 -
                    index * 0.024
                  }
                />
              </mesh>

              {index < 8 && (
                <mesh
                  position={[
                    Math.cos(index * 0.75) *
                      1.82,
                    Math.sin(index * 0.75) *
                      1.08,
                    0.02,
                  ]}
                >
                  <sphereGeometry
                    args={[0.075, 16, 16]}
                  />
                  <meshBasicMaterial
                    color="#ff9d31"
                  />
                </mesh>
              )}
            </group>
          )
        }
      )}
    </group>
  )
}

function Scene({ progress }: Props) {
  const universe = useRef<THREE.Group>(null)
  const chart = useRef<THREE.Group>(null)
  const timeTunnel = useRef<THREE.Group>(null)
  const guruField = useRef<THREE.Group>(null)
  const kundaliArchitecture =
    useRef<THREE.Group>(null)
  const guruArchitecture =
    useRef<THREE.Group>(null)
  const timelineArchitecture =
    useRef<THREE.Group>(null)

  const { camera, pointer } = useThree()
  const smooth = useRef(progress)

  useFrame((state, delta) => {
    smooth.current = THREE.MathUtils.damp(
      smooth.current,
      progress,
      3.6,
      delta
    )

    const p = smooth.current
    const elapsed = state.clock.getElapsedTime()

    const heroToKundali = THREE.MathUtils.smoothstep(
      p,
      0.12,
      0.34
    )

    const kundaliToGuru = THREE.MathUtils.smoothstep(
      p,
      0.30,
      0.56
    )

    const guruToTime = THREE.MathUtils.smoothstep(
      p,
      0.52,
      0.78
    )

    // A2.12 — protect Timeline/final typography.
    // Delay universe restoration until the final composition
    // is already established.
    const finalPullback = THREE.MathUtils.smoothstep(
      p,
      0.90,
      1.0
    )

    // A2.10 v6 — EARLY CHAPTER OWNERSHIP SIGNALS
    //
    // Camera and universe calculations occur before the
    // architecture ownership declarations later in this frame.
    // Keep scope-safe equivalents here.

    const cameraKundaliOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.18,
        0.28
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.40,
          0.49
        ))

    const cameraGuruOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.45,
        0.54
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.66,
          0.75
        ))

    const cameraTimelineOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.71,
        0.81
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.93,
          1.0
        ))

    const targetX =
      THREE.MathUtils.lerp(
        3.7,
        -2.25,
        heroToKundali
      ) +
      THREE.MathUtils.lerp(
        0,
        2.2,
        kundaliToGuru
      ) +
      THREE.MathUtils.lerp(
        0,
        -1.1,
        guruToTime
      ) +
      pointer.x * 0.3 +
      Math.sin(elapsed * 0.08) * 0.07

    const targetY =
      THREE.MathUtils.lerp(
        0.2,
        0.95,
        heroToKundali
      ) +
      THREE.MathUtils.lerp(
        0,
        -0.55,
        kundaliToGuru
      ) +
      THREE.MathUtils.lerp(
        0,
        0.7,
        guruToTime
      ) +
      pointer.y * 0.18 +
      Math.cos(elapsed * 0.07) * 0.05

    const targetZ =
      THREE.MathUtils.lerp(
        12.4,
        8.4,
        heroToKundali
      ) +
      THREE.MathUtils.lerp(
        0,
        -0.65,
        kundaliToGuru
      ) +
      THREE.MathUtils.lerp(
        0,
        1.5,
        guruToTime
      ) +
      // A2.10 — physically move through temporal depth.
      THREE.MathUtils.lerp(
        0,
        -1.72,
        cameraTimelineOwnership
      ) +
      THREE.MathUtils.lerp(
        0,
        3.15,
        finalPullback
      )

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetX,
      3.2,
      delta
    )

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetY,
      3.2,
      delta
    )

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetZ,
      3.2,
      delta
    )

    // A2.10 — chapter-aware cinematic gaze.
    // Restrained values preserve typography and avoid
    // abrupt camera jumps.
    const directedLookX =
      THREE.MathUtils.lerp(
        0,
        -0.6,
        heroToKundali
      ) +
      THREE.MathUtils.lerp(
        0,
        0.34,
        cameraGuruOwnership
      ) +
      THREE.MathUtils.lerp(
        0,
        0.22,
        cameraTimelineOwnership
      )

    const directedLookY =
      THREE.MathUtils.lerp(
        0,
        0.35,
        guruToTime
      ) +
      THREE.MathUtils.lerp(
        0,
        0.18,
        cameraTimelineOwnership
      )

    const directedLookZ =
      THREE.MathUtils.lerp(
        0,
        -0.72,
        finalPullback
      ) +
      THREE.MathUtils.lerp(
        0,
        0.56,
        cameraTimelineOwnership
      )

    const lookTarget = new THREE.Vector3(
      directedLookX,
      directedLookY,
      directedLookZ
    )

    camera.lookAt(lookTarget)

    if (universe.current) {
      universe.current.rotation.y =
        heroToKundali * Math.PI * 0.52 +
        kundaliToGuru * Math.PI * 0.28 +
        Math.sin(elapsed * 0.05) * 0.02

      universe.current.rotation.x =
        -0.06 +
        heroToKundali * 0.34 -
        guruToTime * 0.22

      universe.current.rotation.z =
        heroToKundali * 0.14 +
        Math.sin(elapsed * 0.045) * 0.018

      universe.current.position.x =
        THREE.MathUtils.lerp(
          0,
          1.35,
          heroToKundali
        ) +
        THREE.MathUtils.lerp(
          0,
          1.0,
          kundaliToGuru
        ) +
        THREE.MathUtils.lerp(
          0,
          -1.15,
          guruToTime
        ) +
        // A2.13 — final composition clears the centered headline.
        THREE.MathUtils.lerp(
          0,
          1.55,
          finalPullback
        )

      universe.current.position.z =
        THREE.MathUtils.lerp(
          0,
          -3.8,
          heroToKundali
        ) +
        THREE.MathUtils.lerp(
          0,
          -1.8,
          kundaliToGuru
        ) +
        THREE.MathUtils.lerp(
          0,
          -1.4,
          guruToTime
        ) +
        THREE.MathUtils.lerp(
          0,
          0.82,
          finalPullback
        )

      // A2.10 v6 — chapter architecture temporarily
      // overtakes the base celestial universe.
      //
      // Scope-safe: these ownership signals are declared above
      // the camera/universe calculations.
      const architectureOwnership =
        Math.max(
          cameraKundaliOwnership,
          cameraGuruOwnership,
          cameraTimelineOwnership
        )

      const universeScale =
        (
          1 -
          heroToKundali * 0.16 -
          kundaliToGuru * 0.12 -
          guruToTime * 0.08 +
          finalPullback * 0.08
        ) *
        // A2.13 — preserve enough celestial context during
        // chapter takeovers. Architecture still owns the frame,
        // but the universe no longer collapses into a tiny object.
        THREE.MathUtils.lerp(
          1,
          0.42,
          architectureOwnership *
            (1 - finalPullback)
        )

      universe.current.scale.setScalar(
        universeScale
      )
    }

    if (chart.current) {
      const chartAmount =
        THREE.MathUtils.smoothstep(
          p,
          0.12,
          0.38
        )

      const guruFade =
        1 -
        THREE.MathUtils.smoothstep(
          p,
          0.55,
          0.74
        )

      const chartScale =
        THREE.MathUtils.lerp(
          0.15,
          1.08,
          chartAmount
        ) *
        THREE.MathUtils.lerp(
          1,
          0.64,
          1 - guruFade
        )

      const chartPresence =
        chartAmount * guruFade

      chart.current.visible =
        chartPresence > 0.025

      // A2.9 — progressively surrender visual dominance
      // as the experience leaves Kundali.
      const chapterChartSuppression =
        1 -
        THREE.MathUtils.smoothstep(
          p,
          0.43,
          0.76
        ) * 0.54

      chart.current.scale.setScalar(
        chartScale *
          THREE.MathUtils.lerp(
            0.86,
            1,
            chartPresence
          ) *
          chapterChartSuppression
      )

      chart.current.position.x =
        THREE.MathUtils.lerp(
          1.6,
          -1.5,
          chartAmount
        ) +
        THREE.MathUtils.lerp(
          0,
          -1.08,
          kundaliToGuru
        )

      chart.current.position.y =
        THREE.MathUtils.lerp(
          -0.9,
          0.25,
          chartAmount
        )

      chart.current.position.z =
        THREE.MathUtils.lerp(
          -3.5,
          1.8,
          chartAmount
        ) +
        THREE.MathUtils.lerp(
          0,
          -1.2,
          guruToTime
        )

      chart.current.rotation.x =
        THREE.MathUtils.lerp(
          0.42,
          0.02,
          chartAmount
        )

      chart.current.rotation.y =
        THREE.MathUtils.lerp(
          -0.5,
          0.08,
          chartAmount
        )
    }


    // A2.8 — CHAPTER IDENTITY LOCK
    // Kundali owns the first architecture chapter.
    // Fast acquisition + protected hold + decisive exit.
    const kundaliIdentity =
      THREE.MathUtils.smoothstep(
        p,
        0.16,
        0.27
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.40,
          0.49
        ))

    // Guru owns the intelligence chapter.
    // Its entrance begins only as Kundali releases control.
    const guruIdentity =
      THREE.MathUtils.smoothstep(
        p,
        0.43,
        0.53
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.66,
          0.75
        ))

    // Timeline owns the final architecture chapter.
    // Delayed acquisition prevents premature tunnel dominance.
    const timelineIdentity =
      THREE.MathUtils.smoothstep(
        p,
        0.70,
        0.80
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.94,
          1.0
        ))

    // A2.9 — CINEMATIC HIERARCHY + DEPTH
    // These values deliberately sit on top of the A2.8 identity
    // windows. They control visual dominance rather than existence.
    const kundaliOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.18,
        0.28
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.40,
          0.49
        ))

    const guruOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.45,
        0.54
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.66,
          0.75
        ))

    const timelineOwnership =
      THREE.MathUtils.smoothstep(
        p,
        0.71,
        0.81
      ) *
      (1 -
        THREE.MathUtils.smoothstep(
          p,
          0.93,
          1.0
        ))

    if (kundaliArchitecture.current) {
      kundaliArchitecture.current.visible =
        kundaliIdentity > 0.02

      // A2.10 — Kundali becomes the dominant spatial system
      // during its chapter instead of merely coexisting with
      // the base celestial universe.
      const kundaliDirectedScale =
        THREE.MathUtils.lerp(
          0.40,
          1.26,
          kundaliIdentity
        ) *
        THREE.MathUtils.lerp(
          1,
          1.18,
          kundaliOwnership
        )

      kundaliArchitecture.current.scale.setScalar(
        kundaliDirectedScale
      )

      kundaliArchitecture.current.position.set(
        THREE.MathUtils.lerp(
          4.4,
          -0.42,
          kundaliIdentity
        ),
        THREE.MathUtils.lerp(
          -1.25,
          0.12,
          kundaliIdentity
        ),
        THREE.MathUtils.lerp(
          -4.0,
          2.34,
          kundaliIdentity
        )
      )

      kundaliArchitecture.current.rotation.y =
        THREE.MathUtils.lerp(
          -1.05,
          0.12,
          kundaliIdentity
        )

      kundaliArchitecture.current.rotation.x =
        THREE.MathUtils.lerp(
          0.26,
          -0.05,
          kundaliIdentity
        )

      kundaliArchitecture.current.rotation.z =
        THREE.MathUtils.lerp(
          -0.16,
          0.04,
          kundaliIdentity
        )
    }

    if (guruArchitecture.current) {
      guruArchitecture.current.visible =
        guruIdentity > 0.02

      // A2.10 — Guru gains architectural presence without
      // recreating the oversized orange primitive problem.
      // A2.13 — Guru authority comes from connected geometry,
      // not oversized primitives or excessive scene scale.
      const guruDirectedScale =
        THREE.MathUtils.lerp(
          0.36,
          1.12,
          guruIdentity
        ) *
        THREE.MathUtils.lerp(
          1,
          1.14,
          guruOwnership
        )

      guruArchitecture.current.scale.setScalar(
        guruDirectedScale
      )

      guruArchitecture.current.position.set(
        THREE.MathUtils.lerp(
          4.8,
          0.72,
          guruIdentity
        ),
        THREE.MathUtils.lerp(
          -0.9,
          0.02,
          guruIdentity
        ),
        THREE.MathUtils.lerp(
          -4.2,
          2.12,
          guruIdentity
        )
      )

      guruArchitecture.current.rotation.x =
        THREE.MathUtils.lerp(
          -0.18,
          0.06,
          guruIdentity
        )

      guruArchitecture.current.rotation.y =
        THREE.MathUtils.lerp(
          0.58,
          -0.10,
          guruIdentity
        )

      guruArchitecture.current.rotation.z =
        THREE.MathUtils.lerp(
          0.16,
          -0.06,
          guruIdentity
        )
    }

    if (timelineArchitecture.current) {
      timelineArchitecture.current.visible =
        timelineIdentity > 0.02

      // A2.10 — Timeline scale remains restrained.
      // Its cinematic dominance will come from depth and
      // camera movement rather than raw ring size.
      // A2.13 — Timeline depth comes from Z separation and
      // camera penetration, not a viewport-sized circular wall.
      const timelineDirectedScale =
        THREE.MathUtils.lerp(
          0.30,
          0.72,
          timelineIdentity
        ) *
        THREE.MathUtils.lerp(
          1,
          0.96,
          timelineOwnership
        )

      timelineArchitecture.current.scale.setScalar(
        timelineDirectedScale
      )

      timelineArchitecture.current.position.set(
        THREE.MathUtils.lerp(
          4.8,
          0.38,
          timelineIdentity
        ),
        THREE.MathUtils.lerp(
          -0.55,
          0.08,
          timelineIdentity
        ),
        THREE.MathUtils.lerp(
          -5.4,
          1.58,
          timelineIdentity
        ) +
        THREE.MathUtils.lerp(
          0,
          0.34,
          timelineOwnership
        )
      )

      timelineArchitecture.current.rotation.x =
        THREE.MathUtils.lerp(
          0.38,
          -0.10,
          timelineIdentity
        )

      timelineArchitecture.current.rotation.y =
        THREE.MathUtils.lerp(
          -0.64,
          0.20,
          timelineIdentity
        )

      timelineArchitecture.current.rotation.z =
        THREE.MathUtils.lerp(
          -0.28,
          0.03,
          timelineIdentity
        )
    }

    if (guruField.current) {
      // A2.7: superseded by GuruIntelligenceField.
      // Keep mounted for rollback, but do not render both systems.
      guruField.current.visible = false
    }

    if (timeTunnel.current) {
      // A2.7: superseded by TemporalArchitecture.
      // Prevent duplicate torus systems from competing on screen.
      timeTunnel.current.visible = false
    }

  })

  const chartOpacity = THREE.MathUtils.smoothstep(
    progress,
    0.12,
    0.38
  )

  const guruOpacity =
    THREE.MathUtils.smoothstep(
      progress,
      0.34,
      0.58
    ) *
    (1 -
      THREE.MathUtils.smoothstep(
        progress,
        0.62,
        0.78
      ))

  const timeOpacity =
    THREE.MathUtils.smoothstep(
      progress,
      0.58,
      0.84
    )

  return (
    <>
      <ambientLight intensity={0.25} />

      <StarField />

      <group ref={universe}>
        <CelestialDust />
        <Sun />

        {grahas.map((definition) => (
          <group key={definition.key}>
            <OrbitRing
              radius={definition.distance}
              inclination={definition.inclination}
              verticalScale={definition.verticalScale}
              node={definition.node}
            />

            <Graha definition={definition} />
          </group>
        ))}
      </group>

      <group ref={chart}>
        <ChartWheel opacity={chartOpacity} />
      </group>

      <group ref={kundaliArchitecture}>
        <KundaliArchitecture
          opacity={1}
        />
      </group>

      <group ref={guruArchitecture}>
        <GuruIntelligenceField
          opacity={1}
        />
      </group>

      <group ref={timelineArchitecture}>
        <TemporalArchitecture
          opacity={1}
        />
      </group>

      <group ref={guruField}>
        {Array.from({ length: 7 }).map(
          (_, index) => {
            const angle =
              (index / 7) *
              Math.PI *
              2

            const radius =
              1.1 +
              (index % 3) *
              0.34

            return (
              <group
                key={index}
                position={[
                  Math.cos(angle) *
                    radius,
                  Math.sin(angle) *
                    radius,
                  Math.sin(
                    angle * 1.7
                  ) * 0.45,
                ]}
              >
                <mesh>
                  <sphereGeometry
                    args={[
                      0.09 +
                        (index % 2) *
                          0.035,
                      24,
                      24,
                    ]}
                  />

                  <meshBasicMaterial
                    color={
                      index === 0
                        ? '#f3a642'
                        : index % 2
                          ? '#4c8988'
                          : '#d9b75f'
                    }
                    transparent
                    opacity={guruOpacity}
                  />
                </mesh>
              </group>
            )
          }
        )}
      </group>

      <group ref={timeTunnel}>
        {Array.from({ length: 10 }).map(
          (_, index) => {
            const z =
              (index - 4.5) * 0.72

            const radius =
              1.3 +
              index * 0.12

            return (
              <mesh
                key={index}
                position={[
                  0,
                  0,
                  z,
                ]}
                rotation={[
                  Math.PI / 2,
                  0,
                  index * 0.08,
                ]}
              >
                <torusGeometry
                  args={[
                    radius,
                    0.012,
                    8,
                    64,
                  ]}
                />

                <meshBasicMaterial
                  color={
                    index % 3 === 0
                      ? '#f29a32'
                      : index % 3 === 1
                        ? '#d9b75f'
                        : '#4c8988'
                  }
                  transparent
                  opacity={
                    timeOpacity *
                    (0.14 +
                      index * 0.018)
                  }
                  depthWrite={false}
                />
              </mesh>
            )
          }
        )}
      </group>
    </>
  )
}

export default function CelestialV3Scene({
  progress,
}: Props) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{
        position: [3.7, 0.2, 12.4],
        fov: 43,
        near: 0.1,
        far: 80,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <Scene progress={progress} />
    </Canvas>
  )
}
