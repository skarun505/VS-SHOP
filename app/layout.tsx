import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Vercel Shop | Certified Like-New & Open-Box Electronics",
  description:
    "Discover certified pristine, open-box and untouched condition smartphones, laptops, TVs and appliances at incredible prices. Factory tested, untouched feel, with 6-12 month warranty and 7-day return.",
  openGraph: {
    title: "Vercel Shop - Certified Pristine & Open-Box Electronics",
    description: "Every device tested with 42-point diagnostic, battery health score, and real GST invoice.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
