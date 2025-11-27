/** @type {import('next').NextConfig} */
const nextConfig = {
  // Phase 30 - F45: Production Bundle Optimization
  compress: true, // Enable gzip + brotli compression
  swcMinify: true, // Use SWC minification (faster than Terser)
  
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Phase 30 - F45: Prefer WebP/AVIF
  },
  
  // Phase 30 - F45: Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Phase 30 - F45: Code splitting optimization
  webpack: (config, { isServer, dev }) => {
    // F48: Fix emitter dependency for html-pdf-node
    if (isServer) {
      const webpack = require('webpack');
      // Replace 'emitter' with Node's built-in 'events' module
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^emitter$/, 'events')
      );
      // Ensure 'events' is treated as a Node.js built-in
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'events': false, // Use Node.js built-in
      };
    } else {
      // Client-side: externalize html-pdf-node and its dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        'html-pdf-node': false,
        'emitter': false,
      };
    }
    
    if (!isServer && !dev) {
      // Phase 30 - F45: Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Three.js + R3F chunk
            three: {
              name: 'three',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // GSAP chunk
            gsap: {
              name: 'gsap',
              test: /[\\/]node_modules[\\/]gsap[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // PDF libraries chunk
            pdf: {
              name: 'pdf',
              test: /[\\/]node_modules[\\/](pdf-lib|jspdf|html2canvas)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Firebase chunk
            firebase: {
              name: 'firebase',
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common vendor chunk
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Phase 30 - F45: Enable turbo mode if stable (commented for now, enable when stable)
    // turbo: {},
  },
}

module.exports = nextConfig

