// // app/layout.tsx or app/page.tsx
// // import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from '../components/AuthProvider';
// import AppClientWrapper from "../components/AppClientWrapper";

// // const geistSans = Geist({
// //   variable: "--font-geist-sans",
// //   subsets: ["latin"],
// // });

// // const geistMono = Geist_Mono({
// //   variable: "--font-geist-mono",
// //   subsets: ["latin"],
// // });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>
//           <AppClientWrapper>
//             {children}
//           </AppClientWrapper>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }



// // app/layout.tsx
// import "./globals.css";
// import { AuthProvider } from '../components/AuthProvider';
// import AppClientWrapper from "../components/AppClientWrapper";
// import { CallProvider } from "../app/context/CallProvider";
// import CallUIWrapper from "../components/CallUIWrapper"; // Import the new client component
// import ClickSpark from "@/components/ClickSpark";

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>
//           <CallProvider>
//             <AppClientWrapper>
//               <CallUIWrapper> {/* Now CallUIWrapper is a Client Component */}
//                 <ClickSpark sparkColor="#3B82F6" sparkCount={10}>
//                   {children}
//                 </ClickSpark>
//               </CallUIWrapper>
//             </AppClientWrapper>
//           </CallProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import AppClientWrapper from "../components/AppClientWrapper";
import { CallProvider } from "../app/context/CallProvider";
import CallUIWrapper from "../components/CallUIWrapper";
import ClickSpark from "@/components/ClickSpark";
import OfflineOverlay from "@/components/OfflineOverlay";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import type { Metadata } from 'next'; // Import Metadata type for type safety

// --- SEO Metadata Configuration ---
// This 'metadata' object is automatically used by Next.js to generate <head> tags.
// It's a server-side feature, which is great for SEO as content is available before JS loads.
export const metadata: Metadata = {
  // Primary Title: Appears in browser tabs and search results.
  // Keep it concise and include your main keywords.
  title: 'Vartalaap - Connect, Share & Discover Your Community',

  // Meta Description: A brief, compelling summary of your app.
  // This often appears under the title in search results.
  description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',

  // Keywords: A list of relevant terms. While less impactful for Google now,
  // still useful for other search engines and for internal categorization.
  keywords: [
    'Vartalaap', // Your app's specific name
    'Social media app',
    'Connect with friends',
    'Share photos',
    'Share videos',
    'Online community',
    'Networking app',
    'Public feed',
    'Private messaging',
    'Social groups',
    'User profiles',
    'Post updates',
    'Discover content',
    'Online platform',
    'Community building',
    'Digital connection',
    'Social networking',
    'Online chat',
    'Community forum',
    'Content sharing',
    'Friend finder',
    'Group chat',
    'Live calls', // Based on CallProvider/CallUIWrapper
  ],

  // --- NEW: Robots Meta Tag for Crawler Control ---
  // This tells search engine crawlers how to interact with your site.
  robots: {
    index: true, // Allow search engines to index this page
    follow: true, // Allow search engines to follow links on this page
    nocache: false, // Allow caching (default, but good to be explicit)
    googleBot: { // Specific rules for Googlebot
      index: true,
      follow: true,
      noimageindex: false, // Allow Googlebot to index images
      'max-video-preview': -1, // Allow full video previews
      'max-snippet': -1, // Allow full text snippets
    },
  },

  // Open Graph (OG) Tags: Crucial for how your content appears when shared on
  // social media platforms like Facebook, LinkedIn, etc.
  openGraph: {
    title: 'Vartalaap - Connect, Share & Discover Your Community',
    description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',
    url: 'https://vartalaap-sable.vercel.app', // Your actual app's domain
    siteName: 'Vartalaap',
    images: [
      {
        // --- IMPORTANT CORRECTION: Use a high-quality image, NOT favicon.ico for OG images ---
        // Create an image like 'vartalaap-og-image.jpg' (1200x630px recommended)
        // and place it in your 'public' folder. Then update the URL below.
        url: 'https://vartalaap-sable.vercel.app/favicon.ico', // !!! IMPORTANT: Replace with your actual high-quality image URL
        width: 1200, // Recommended width for OG images
        height: 630, // Recommended height for OG images
        alt: 'Vartalaap Social Media App - Connect and Share',
      },
      // You can add more images if you have different aspect ratios or purposes
    ],
    locale: 'en_US', // Specify the language and region
    type: 'website', // Type of content (e.g., website, article, profile)
  },

  // --- UNCOMMENTED & FILLED: Twitter Card Tags ---
  // Similar to Open Graph, but specifically for Twitter.
  // twitter: {
  //   card: 'summary_large_image', // Displays a prominent image
  //   title: 'Vartalaap - Connect, Share & Discover Your Community',
  //   description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',
  //   creator: '@VartalaapApp', // !!! IMPORTANT: Replace with your app's Twitter handle (e.g., @VartalaapApp)
  //   images: ['https://vartalaap-sable.vercel.app/vartalaap-twitter-image.jpg'], // !!! IMPORTANT: Replace with a high-quality image URL optimized for Twitter (e.g., 1200x675px)
  // },

  // --- UNCOMMENTED & FILLED: Canonical URL ---
  // Helps prevent duplicate content issues if your site is accessible via multiple URLs.
  alternates: {
    canonical: 'https://vartalaap-sable.vercel.app', // !!! IMPORTANT: Replace with your actual canonical domain
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <AuthProvider>
          <CallProvider>
            <AppClientWrapper>
              <CallUIWrapper>
                <ClickSpark sparkColor="#3B82F6" sparkCount={10}>
                  <OfflineOverlay />
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </ClickSpark>
              </CallUIWrapper>
            </AppClientWrapper>
          </CallProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
