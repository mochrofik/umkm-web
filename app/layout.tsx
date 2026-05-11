import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/AuthContext";
import { CartProvider } from "@/CartContext";
import { environment } from "@/constans/environment";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${environment.API_URL}`),
  openGraph: {
    images: {
      url: "/le_melleh.png",
    },
  },
  title: "UMKM",
  description: "Cari tahu UMKM di sekitarmu dengan mudah",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins", // Ini akan jadi variabel CSS
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
