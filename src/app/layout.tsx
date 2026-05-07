import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./StoreProvider"; // <-- Import Provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ASCON Cooperative",
  description: "ASCON STAFF Multi-Purpose Co-operative Society",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-center" />
        {/* Wrap children with the StoreProvider */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
