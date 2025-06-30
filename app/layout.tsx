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



// app/layout.tsx
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import AppClientWrapper from "../components/AppClientWrapper";
import { CallProvider } from "../app/context/CallProvider";
import CallUIWrapper from "../components/CallUIWrapper"; // Import the new client component
import ClickSpark from "@/components/ClickSpark";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CallProvider>
            <AppClientWrapper>
              <CallUIWrapper> {/* Now CallUIWrapper is a Client Component */}
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




// 'use client';

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider, useAuth } from '../components/AuthProvider';
// import { ReactNode } from 'react';
// import SocketProvider from "../components/SocketProvider";
// import { CallProvider } from "../components/CallManager";
// import { BeatLoader } from "react-spinners"; // Import BeatLoader

// const geistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// });

// const AppContent = ({ children }: { children: ReactNode }) => {
//     const { mongoUser } = useAuth();

//     if (!mongoUser) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <BeatLoader color="#3498db" size={15} />
//             </div>
//         );
//     }

//     return (
//         <SocketProvider>
//             <CallProvider currentUserId={mongoUser._id} currentUserName={mongoUser.name}>
//                 {children}
//             </CallProvider>
//         </SocketProvider>
//     );
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//     return (
//         <html lang="en">
//             <body
//                 className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//             >
//                 <AuthProvider>
//                     <AppContent>{children}</AppContent>
//                 </AuthProvider>
//             </body>
//         </html>
//     );
// }