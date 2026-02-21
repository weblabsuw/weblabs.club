import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const unbounded = localFont({
  src: "./fonts/UnboundedVF.ttf",
  variable: "--font-unbounded",
  weight: "200 900",
});

export const metadata: Metadata = {
  title: "WebLabs @ UW",
  description: "We are a student org @ UW-Madison dedicated to building websites together. We build real projects together and learn from each other along the way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer data-domain="weblabs.club" src="https://net.tsuni.dev/js/script.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} antialiased bg-surface text-onSurface relative`}
      >
        {children}
        <Toaster
          toastOptions={{
            className:
              "bg-surface text-primary font-sans font-bold border-primary/50",
          }}
        />
      </body>
    </html>
  );
}
