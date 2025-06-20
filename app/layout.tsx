// client/app/layout.tsx
'use client'; // Add 'use client' if AuthProvider or CallProvider are client components

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from '../components/AuthProvider'; // Import useAuth
import { ReactNode } from 'react';
import SocketProvider from "../components/SocketProvider";
import { CallProvider } from "../components/CallManager"; // Ensure CallProvider is imported

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// REMOVE THE METADATA EXPORT FROM HERE
// export const metadata = {
//     title: "Vartalaap",
//     description: "Chat application with Firebase Auth",
// };

// Create a component that uses useAuth to pass props to CallProvider
const AppContent = ({ children }: { children: ReactNode }) => {
    const { mongoUser } = useAuth(); // Get mongoUser from AuthProvider

    // Ensure mongoUser exists before rendering CallProvider
    if (!mongoUser) {
        // You might want to render a loading spinner or some fallback here
        // or ensure AuthProvider handles its loading state properly
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading user data...
            </div>
        );
    }

    return (
        <SocketProvider>
            <CallProvider currentUserId={mongoUser._id} currentUserName={mongoUser.name}>
                {children}
            </CallProvider>
        </SocketProvider>
    );
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <AppContent>{children}</AppContent>
                </AuthProvider>
            </body>
        </html>
    );
}



// // client/app/layout.tsx
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from '../components/AuthProvider';
// import { ReactNode } from 'react';
// // FIX: Change this line to import the named export
// // client/app/layout.tsx
// // ...
// import SocketProvider from "../components/SocketProvider"; // <--- CHANGE THIS LINE (removed curly braces)
// // ...

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Vartalaap",
//   description: "Chat application with Firebase Auth",
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <AuthProvider>
//           <SocketProvider>
//             {children}
//           </SocketProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }