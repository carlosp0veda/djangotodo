import type { Metadata } from "next";
import { Inter, Inria_Serif } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/QueryClientProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const inria = Inria_Serif({
  variable: "--font-inria",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Django Todo",
  description: "A premium todo app built with Django and Next.js",
  icons: {
    icon: "/assets/cactus.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${inter.variable} ${inria.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
