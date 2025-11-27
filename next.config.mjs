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
    // Ensure shader files (.glsl, .vert, .frag) are loaded as raw strings
    // This prevents tree-shaking and ensures shaders are preserved
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/i,
      type: 'asset/source',
    });

    // Ensure shader strings in TypeScript files are not tree-shaken
    // All shader exports in postfx/*/cosmic-*-shader.ts files must be preserved
    // They are already exported as constants, so they should be safe
    
    // Mark postfx directory as having side effects to prevent tree-shaking
    config.optimization = {
      ...config.optimization,
      sideEffects: [
        '**/*.css',
        '**/postfx/**/*.ts',
        '**/cosmos/**/*.ts',
      ],
    };

    return config;
  }

};



export default nextConfig;
