/** @type {import('next').NextConfig} */

const nextConfig = {

  eslint: {

    ignoreDuringBuilds: true,

  },

  typescript: {

    ignoreBuildErrors: true,

  },

  images: {

    domains: ["localhost"],

  },

  webpack: (config, { isServer }) => {
    // Ensure shader files (.glsl, .vs, .fs, .vert, .frag) are loaded as raw strings
    // This prevents tree-shaking and ensures shaders are preserved in production
    // If you use ?raw syntax: import shader from './file.glsl?raw';
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });

    // Note: sideEffects array is configured in package.json, not webpack config
    // Webpack will read package.json sideEffects field automatically
    // This ensures shader modules in postfx and cosmos directories are not tree-shaken

    return config;
  }

};



export default nextConfig;
