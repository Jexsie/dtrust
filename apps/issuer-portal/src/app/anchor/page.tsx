/**
 * Anchor Document Page for Issuer Portal
 *
 * Page for anchoring new documents to the Hedera network.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import AnchorModal from "@/components/AnchorModal";

export default function AnchorPage() {
  const router = useRouter();
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState(false);

  // Open modal automatically when page loads
  useEffect(() => {
    setIsAnchorModalOpen(true);
  }, []);

  const handleSuccess = () => {
    // Redirect to dashboard after successful anchor
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleClose = () => {
    // Redirect to dashboard when modal is closed
    router.push("/");
  };

  return (
    <Layout>
      <AnchorModal
        isOpen={isAnchorModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      <div className="py-12 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-4xl px-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center">
            Anchor New Document
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 sm:mt-6 text-center">
            Securely anchor your document&apos;s hash to the Hedera network for
            immutable proof of existence.
          </p>

          {/* Privacy Notice */}
          <div className="mt-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl flex-shrink-0">
                info
              </span>
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Privacy First
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                  Your file is never uploaded. We calculate a SHA-256 hash of
                  your document in your browser and only send the hash to the
                  Hedera network. This ensures your document content remains
                  completely private.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setIsAnchorModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-2xl">
                add_circle
              </span>
              Start Anchoring
            </button>
          </div>

          {/* How it Works */}
          <div className="mt-16 rounded-xl bg-white/50 dark:bg-slate-800/50 p-8 shadow-md">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Upload Document
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Select your document through drag-and-drop or file browser
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Review & Confirm
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Preview your document details and confirm it&apos;s the
                    canonical version
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Client-Side Hashing
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    SHA-256 hash is calculated in your browser using Web Crypto
                    API for complete privacy
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Anchor to Hedera
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Only the hash is sent to Hedera network for immutable
                    timestamping
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Receive Confirmation
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Get transaction ID, timestamp, and hash as proof of
                    anchoring on the distributed ledger
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
