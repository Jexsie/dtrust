import type { Metadata } from "next";
import { Montserrat, Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dtrust Issuer Portal",
  description:
    "Document Anchoring Dashboard - Manage and track your document proofs with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${montserrat.variable} ${inter.variable} ${firaCode.variable} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-body`}
      >
        {children}
      </body>
    </html>
  );
}
