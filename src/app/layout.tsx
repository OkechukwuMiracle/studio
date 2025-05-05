import type { Metadata } from 'next';
// Removed Geist fonts as they are not explicitly requested for the new theme
// import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Onga Village Feast Selection', // Update title for the event
  description: 'Welcome to the Onga Village Feast - Select your food and drinks!', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply base font from globals.css or default browser font */}
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> */}
      <body className={`antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
