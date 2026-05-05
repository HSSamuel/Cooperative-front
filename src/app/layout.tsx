import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
              fontWeight: "500",
              borderRadius: "10px",
            },
            success: {
              style: { background: "#059669", color: "#fff" },
            },
            error: {
              style: { background: "#E11D48", color: "#fff" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
