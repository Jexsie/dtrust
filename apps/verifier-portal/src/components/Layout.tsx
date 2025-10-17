/**
 * Layout Component for Verifier Portal
 *
 * Main layout wrapper with enhanced header and content area.
 * Features Montserrat font and rose-600 branding.
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#cbd5e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-2xl font-['Montserrat'] font-bold text-[#334155]">
                  <span className="inline-block border-b-4 border-[#e11d48] pb-1">
                    Dtrust Public Verifier
                  </span>
                </h1>
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              <motion.a
                href="https://github.com/dtrust"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:text-[#334155] hover:bg-[#f1f5f9] transition-colors"
              >
                About
              </motion.a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="text-center">
            <p className="text-sm text-[#64748b] mb-2">
              Verify the authenticity of documents anchored on Hedera Hashgraph
            </p>
            <p className="text-xs text-[#94a3b8]">
              © {new Date().getFullYear()} Dtrust. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
