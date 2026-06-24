import type { Metadata, Viewport } from "next";
import { Figtree, Montserrat, Lora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CANONICAL_SITE_ORIGIN, CANONICAL_SITE_URL, siteConfig } from "@/lib/seo/site";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

/** Site-wide defaults — each page overrides via definePageSeo() */
export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_ORIGIN),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: siteConfig.logo,
    apple: siteConfig.logo,
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: CANONICAL_SITE_ORIGIN,
  logo: siteConfig.logo,
  description:
    "CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels.",
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AE",
    addressRegion: "Dubai",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
  sameAs: [CANONICAL_SITE_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${montserrat.variable} ${lora.variable} h-full`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://coachacademic.s3.ap-southeast-1.amazonaws.com"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="min-h-full bg-white">
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
