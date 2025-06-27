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
      // Localhost patterns (keep for local development)
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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/uploads/**', // Add this line for your /api/uploads path
      },
      // Render Backend URL patterns (REQUIRED for Vercel deployment)
      {
        protocol: 'https', // Render uses HTTPS
        hostname: 'vartalaap-r36o.onrender.com', // Your Render backend hostname
        port: '', // No explicit port for HTTPS, or leave it out
        pathname: '/avatars/**',
      },
      {
        protocol: 'https', // Render uses HTTPS
        hostname: 'vartalaap-r36o.onrender.com', // Your Render backend hostname
        port: '', // No explicit port for HTTPS, or leave it out
        pathname: '/uploads/**',
      },
      {
        protocol: 'https', // Render uses HTTPS
        hostname: 'vartalaap-r36o.onrender.com', // Your Render backend hostname
        port: '', // No explicit port for HTTPS, or leave it out
        // Note: '/api/uploads/**' path might not be correct if '/api' is your route prefix for server,
        // and images are served directly from '/uploads' by express.static.
        // Based on your backend's `app.use('/uploads', express.static(uploadsBaseDir));`
        // the path should likely be just `/uploads/**`.
        // If your frontend explicitly calls /api/uploads, then keep this.
        pathname: '/api/uploads/**', // Adjust if /api is not part of the image path
      },
      // Google User Content (keep this if you use it)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;