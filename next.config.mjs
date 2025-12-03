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

  webpack: (config, { isServer, webpack }) => {
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

    // Fix webpack cache serialization warning for CSS/PostCSS loaders
    // This warning occurs because webpack tries to serialize Warning objects which aren't serializable
    // It's a known webpack issue and is harmless. Suppress it by setting infrastructureLogging to 'error'
    // This will suppress warnings but still show errors, keeping build logs clean
    config.infrastructureLogging = {
      level: 'error', // Suppress warnings including cache serialization warnings, only show errors
    };

    return config;
  }

};



export default nextConfig;
