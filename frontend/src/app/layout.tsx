import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MockAuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rozgar Sarthi — Adaptive Interview Intelligence Engine",
  description:
    "An AI-powered adaptive interview and coding engine that continuously evaluates candidate competency, builds evidence graphs, and pressure-tests technical claims.",
  keywords: [
    "Adaptive Interview",
    "Technical Assessment",
    "Evidence Graph",
    "Coding Round",
    "System Design",
    "LangGraph",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-800 font-sans antialiased selection:bg-iris/20 selection:text-iris">
        <MockAuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </MockAuthProvider>
      </body>
    </html>
  );
}
