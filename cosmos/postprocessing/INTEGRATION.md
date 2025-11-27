# Celestial Bloom Engine (E12) Integration Guide

## Usage

The Celestial Bloom Engine must be integrated at the Canvas level, not inside GalaxyScene.

### Example Integration

```tsx
import { Canvas } from '@react-three/fiber';
import { GalaxyScene } from '@/cosmos/scenes/galaxy-scene';
import { CelestialBloom } from '@/cosmos/postprocessing/bloom-engine';

function CosmicCanvas() {
  const [scroll, setScroll] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [audioReactive, setAudioReactive] = useState({
    bass: 0,
    mid: 0,
    high: 0,
  });

  return (
    <Canvas>
      {/* Post-processing effects at Canvas root */}
      <CelestialBloom
        intensity={1.0}
        scroll={scroll}
        audioReactive={audioReactive}
        threshold={0.85}
        bloomIntensity={1.0}
        bloomRadius={0.4}
        godrayIntensity={0.3}
        lensDirtIntensity={1.0}
      />
      
      {/* Galaxy Scene with all cosmic layers */}
      <GalaxyScene
        intensity={1.0}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
      />
    </Canvas>
  );
}
```

## Features

- **HDR Tone Mapping (ACES)**: Cinematic HDR rendering
- **Multi-Stage Bloom**: Pre-threshold extract, Gaussian blur, composite
- **Audio-Reactive Bloom**: Bass boosts strength, mid modulates radius, high adds sparkle
- **Godray Pass**: Radial blur using Solar Rays as mask
- **Lens Dirt Overlay**: Subtle spiritual dust texture
- **Selective Bloom Thresholding**: Based on masks from cosmic layers

## Component Order

The post-processing effects are applied in this order:

1. Bloom (Pre-threshold extract + Gaussian blur + composite)
2. HDR Tone Mapping (ACES)
3. Godray Pass
4. Lens Dirt Overlay
5. Vignette

