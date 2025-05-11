/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  transpilePackages: ['react-leaflet', 'leaflet'],
  
  // Base path configuration
  basePath: "",
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      
      // Generic patterns for other hostnames
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Webpack configuration with improved chunk loading
  webpack: (config, { isServer }) => {
    // Avoid canvas issues
    config.resolve.alias.canvas = false;
    
    // Optimize chunk loading
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
 
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Next.js specific configurations
  experimental: {
    // The serverActions option expects an object
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      allowedOrigins: [''],
    },
    // Modern settings for code splitting
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Output configuration
  output: 'standalone',
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Increase the size limit for chunks if needed
  poweredByHeader: false,
};

export default nextConfig;