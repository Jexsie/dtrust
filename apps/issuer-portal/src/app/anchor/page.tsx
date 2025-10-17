/**
 * Anchor Document Page for Issuer Portal
 *
 * Page for anchoring new documents to the Hedera network.
 * No authentication required - direct access for organizations.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { FileUploader } from "@/components/FileUploader";

export default function AnchorPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Optional: redirect to dashboard after successful anchor
    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  const handleError = (error: string) => {
    console.error("Anchor error:", error);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-[#64748b]">
          <Link href="/" className="hover:text-[#059669]">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#1e293b]">Anchor Document</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">
            Anchor New Document
          </h1>
          <p className="text-[#64748b] mt-1">
            Securely anchor your document&apos;s hash to the Hedera network
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-[#f0fdf4] border-[#86efac]">
          <CardContent>
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-[#059669] flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-[#059669]">Privacy First</h3>
                <p className="text-sm text-[#065f46] mt-1">
                  Your file is never uploaded. We calculate a SHA-256 hash of
                  your document in your browser and only send the hash to the
                  Hedera network. This ensures your document content remains
                  completely private.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <p className="text-sm text-[#64748b] mt-2">
              Drop your file below or click to browse. The file will be hashed
              locally.
            </p>
          </CardHeader>

          <CardContent>
            <FileUploader onSuccess={handleSuccess} onError={handleError} />
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-[#1e293b]">
                    Upload Document
                  </h4>
                  <p className="text-sm text-[#64748b] mt-1">
                    Select or drag-and-drop your document
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-[#1e293b]">
                    Review & Confirm
                  </h4>
                  <p className="text-sm text-[#64748b] mt-1">
                    Preview your document and verify it&apos;s correct before
                    anchoring
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-[#1e293b]">
                    Client-Side Hashing
                  </h4>
                  <p className="text-sm text-[#64748b] mt-1">
                    SHA-256 hash is calculated in your browser using Web Crypto
                    API
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-[#1e293b]">
                    Anchor to Hedera
                  </h4>
                  <p className="text-sm text-[#64748b] mt-1">
                    Only the hash is sent to Hedera network for immutable
                    timestamping
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-medium text-[#1e293b]">
                    Receive Confirmation
                  </h4>
                  <p className="text-sm text-[#64748b] mt-1">
                    Get a transaction ID as proof of anchoring on the
                    distributed ledger
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
