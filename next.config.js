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

  webpack: (config) => {

    return config;

  }

};



export default nextConfig;
