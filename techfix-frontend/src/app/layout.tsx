import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/features/cart/CartProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — TechFix",
    default: "TechFix — Tech Repair & Product Marketplace",
  },
  description:
    "Nepal's trusted platform for device repairs, certified tech products, and repair tracking. Compare providers, book repairs, and shop with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Cart state must outlive route changes, so the provider wraps the
            whole app rather than any single page. */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
