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
      // ✅ Render backend (production)
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

      // ✅ Localhost backend (development)
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

      // ✅ Google profile images (for Google login)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
