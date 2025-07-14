import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import AppClientWrapper from "../components/AppClientWrapper";
import { CallProvider } from "../app/context/CallProvider";
import CallUIWrapper from "../components/CallUIWrapper";
import ClickSpark from "@/components/ClickSpark";
import OfflineOverlay from "@/components/OfflineOverlay";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import type { Metadata } from 'next';
import { ChatProvider } from "./context/ChatProvider";

export const metadata: Metadata = {
  title: 'Vartalaap - Connect, Share & Discover Your Community',
  description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations. Join our online platform for seamless digital connection and community building.',
  keywords: [
    'Vartalaap',
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
    'Live calls',
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Vartalaap - Connect, Share & Discover Your Community',
    description: 'Vartalaap is a vibrant social media app where you can connect with friends, share your moments, discover new communities, and engage in meaningful conversations.',
    url: 'https://vartalaap-sable.vercel.app',
    siteName: 'Vartalaap',
    images: [
      {
        url: 'https://vartalaap-sable.vercel.app/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Vartalaap Social Media App - Connect and Share',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://vartalaap-sable.vercel.app',
  },
  // PWA specific metadata
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vartalaap',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vartalaap" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/favicon.png" />

        {/* Standard Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/favicon.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <CallProvider>
            <AppClientWrapper>
              <CallUIWrapper>
                <ClickSpark sparkColor="#3B82F6" sparkCount={10}>
                  <OfflineOverlay />
                  <NotificationProvider>
                    <ChatProvider>
                      {children}
                    </ChatProvider>
                  </NotificationProvider>
                </ClickSpark>
              </CallUIWrapper>
            </AppClientWrapper>
          </CallProvider>
        </AuthProvider>
      </body>
    </html >
  );
}