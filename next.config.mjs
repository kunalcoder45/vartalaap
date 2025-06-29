// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/avatars/**',
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/uploads/**',
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/api/uploads/**',  // Add this line for your /api/uploads path
//       },
//       {
//         protocol: 'https',
//         hostname: 'lh3.googleusercontent.com',
//       },
//     ],
//   },
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ✅ Production frontend (vercel app)
      {
        protocol: 'https',
        hostname: 'vartalaap-sable.vercel.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'vartalaap-sable.vercel.app',
        pathname: '/avatars/**',
      },

      // ✅ Backend (Render - production)
      {
        protocol: 'https',
        hostname: 'vartalaap-r36o.onrender.com',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'vartalaap-r36o.onrender.com',
        pathname: '/uploads/**',
      },

      // ✅ Backend (Render - sometimes HTTP)
      {
        protocol: 'http',
        hostname: 'vartalaap-r36o.onrender.com',
        pathname: '/uploads/**',
      },

      // ✅ Local development backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/avatars/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },

      // ✅ Google profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
