// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from '../components/AuthProvider';
// import { ReactNode } from 'react';
// import SocketProvider from "../components/SocketProvider"

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


// client/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import { ReactNode } from 'react';
// FIX: Change this line to import the named export
// client/app/layout.tsx
// ...
import SocketProvider from "../components/SocketProvider"; // <--- CHANGE THIS LINE (removed curly braces)
// ...

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vartalaap",
  description: "Chat application with Firebase Auth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}