/**
 * Layout Component for Issuer Portal
 *
 * Main layout wrapper with enhanced header and content area.
 * Features Montserrat font and emerald-600 branding.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-2xl font-['Montserrat'] font-bold text-[#334155]">
                  <span className="inline-block border-b-4 border-[#059669] pb-1">
                    Dtrust Issuer Portal
                  </span>
                </h1>
              </Link>
            </div>

            <nav className="flex items-center space-x-2">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/" || pathname === "/dashboard"
                      ? "bg-[#f0fdf4] text-[#059669] font-semibold"
                      : "text-[#64748b] hover:text-[#334155] hover:bg-[#f1f5f9]"
                  }`}
                >
                  Dashboard
                </motion.div>
              </Link>
              <Link href="/anchor">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/anchor" || pathname === "/dashboard/anchor"
                      ? "bg-[#f0fdf4] text-[#059669] font-semibold"
                      : "text-[#64748b] hover:text-[#334155] hover:bg-[#f1f5f9]"
                  }`}
                >
                  Anchor Document
                </motion.div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#cbd5e1] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-[#64748b]">
            © {new Date().getFullYear()} Dtrust. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
