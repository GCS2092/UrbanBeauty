import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";
import NotificationProvider from "@/components/admin/NotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Évite les avertissements de préchargement
  preload: true,
});

export const metadata: Metadata = {
  title: "UrbanBeauty - Votre plateforme beauté tout-en-un",
  description: "Découvrez une sélection exclusive de produits cosmétiques, réservez vos services de coiffure et trouvez l'inspiration dans notre lookbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <NotificationProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
