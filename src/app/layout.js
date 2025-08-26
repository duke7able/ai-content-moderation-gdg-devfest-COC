import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GDG DevFest Content Moderator",
  description: "AI-powered content moderation for GDG DevFest events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* You can switch to geist fonts by uncommenting */}
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
