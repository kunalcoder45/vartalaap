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

  // Open Graph (OG) Tags: Crucial for how your content appears when shared on
  // social media platforms like Facebook, LinkedIn, etc.
  openGraph: {
    title: 'Vartalaap - Connect, Share & Discover Your Community',
    description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',
    url: 'https://vartalaap-sable.vercel.app', // !!! IMPORTANT: Replace with your actual app's domain
    siteName: 'Vartalaap',
    images: [
      {
        url: 'https://www.yourdomain.com/og-image.jpg', // !!! IMPORTANT: Replace with a high-quality, appealing image URL (e.g., app screenshot, logo)
        width: 1200, // Recommended width for OG images
        height: 630, // Recommended height for OG images
        alt: 'Vartalaap Social Media App - Connect and Share',
      },
      // You can add more images if you have different aspect ratios or purposes
    ],
    locale: 'en_US', // Specify the language and region
    type: 'website', // Type of content (e.g., website, article, profile)
  },

  // Twitter Card Tags: Similar to Open Graph, but specifically for Twitter.
  // twitter: {
  //   card: 'summary_large_image', // Options: summary, summary_large_image, app, player
  //   title: 'Vartalaap - Connect, Share & Discover Your Community',
  //   description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',
  //   creator: '@yourtwitterhandle', // !!! IMPORTANT: Replace with your app's Twitter handle (e.g., @VartalaapApp)
  //   images: ['https://www.yourdomain.com/twitter-image.jpg'], // !!! IMPORTANT: Replace with a high-quality image URL optimized for Twitter
  // },

  // Optional: Canonical URL. Helps prevent duplicate content issues if your site
  // is accessible via multiple URLs (e.g., with/without www, http/https).
  // Uncomment and replace if you have a specific canonical URL strategy.
  // alternates: {
  //   canonical: 'https://www.yourdomain.com', // !!! IMPORTANT: Replace with your actual canonical domain
  // },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"> {/* 'lang="en"' is good for SEO, indicates content language */}
      <body>
        <AuthProvider>
          <CallProvider>
            <AppClientWrapper>
              <CallUIWrapper>
                <ClickSpark sparkColor="#3B82F6" sparkCount={10}>
                  {children}
                </ClickSpark>
              </CallUIWrapper>
            </AppClientWrapper>
          </CallProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
