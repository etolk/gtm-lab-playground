import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import GTMProvider from "@/components/gtm-provider";
import Navigation from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import ConsentBanner from "@/components/consent-banner";
import Footer from "@/components/footer";
import DataLayerViewer from "@/components/datalayer-viewer";

export const metadata: Metadata = {
  title: "Tracking Lab | Home",
  description: "High-performance tracking sandbox",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="consent-defaults" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);}
            window.gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
            // If user already gave consent, immediately update
            try {
              var stored = localStorage.getItem('consent_mode');
              if (stored) { window.gtag('consent', 'update', JSON.parse(stored)); }
            } catch(e) {}
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Suspense fallback={null}>
            <GTMProvider />
          </Suspense>
          <Navigation />
          <main className="main-content">
            {children}
          </main>
          <Footer />
          <ConsentBanner />
          <DataLayerViewer />
        </ThemeProvider>
      </body>
    </html>
  );
}
