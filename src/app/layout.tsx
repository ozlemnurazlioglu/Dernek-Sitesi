import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Umut Eğitim ve Dayanışma Derneği",
    template: "%s | Umut Eğitim ve Dayanışma Derneği",
  },
  description:
    "Eğitime gönül veren, geleceğe iz bırakan bir dayanışma topluluğu. Burs, etkinlik ve sosyal sorumluluk projeleriyle yanınızdayız.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
