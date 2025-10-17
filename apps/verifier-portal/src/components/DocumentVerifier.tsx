/**
 * DocumentVerifier Component for Verifier Portal
 *
 * Public document verification tool that:
 * 1. Calculates SHA-256 hash in the browser using SubtleCrypto
 * 2. Sends the hash to the verification API
 * 3. Displays clear verification result: ✅ Verified or ❌ Not Verified
 */

"use client";

import React, { useState, useCallback } from "react";
import { hashFile, formatFileSize } from "@/lib/fileHasher";
import { Button } from "./Button";

export const DocumentVerifier: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    details?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    []
  );

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setVerificationResult(null);
    setSelectedFile(file);

    try {
      // Calculate SHA-256 hash in the browser
      const hash = await hashFile(file);
      setFileHash(hash);

      // Automatically verify after hashing
      await verifyHash(hash, file.name);
    } catch (err) {
      setError("Failed to calculate file hash. Please try again.");
      setIsProcessing(false);
    }
  };

  const verifyHash = async (hash: string, fileName: string) => {
    try {
      // Send hash to verification API
      const response = await fetch("http://localhost:3001/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash,
          fileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setVerificationResult({
        verified: data.verified,
        details: data.details,
      });
    } catch (err: any) {
      setError(err.message || "Failed to verify document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileHash(null);
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? "border-[#e11d48] bg-[#fef2f2]"
            : "border-[#cbd5e1] hover:border-[#e11d48]"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload-verify"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />

        <label htmlFor="file-upload-verify" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-[#e11d48] bg-opacity-10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#e11d48]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <p className="text-2xl font-semibold text-[#1e293b]">
                {isProcessing
                  ? "Verifying Document..."
                  : "Verify Your Document"}
              </p>
              <p className="text-base text-[#64748b] mt-2">
                Drop your document here or click to browse
              </p>
              <p className="text-sm text-[#94a3b8] mt-1">
                File will be hashed locally and verified against the Hedera
                network
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File Info */}
      {selectedFile && fileHash && (
        <div className="mt-6 p-6 bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-[#1e293b]">
                Document Details
              </h4>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs text-[#64748b]">File Name</p>
                  <p className="text-sm text-[#1e293b] font-medium">
                    {selectedFile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">File Size</p>
                  <p className="text-sm text-[#1e293b]">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">SHA-256 Hash</p>
                  <p className="text-xs font-mono bg-[#f1f5f9] p-2 rounded break-all text-[#475569] mt-1">
                    {fileHash}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="ml-4 text-[#64748b] hover:text-[#e11d48] transition-colors"
              disabled={isProcessing}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-6 bg-[#fef2f2] border-2 border-[#fecaca] rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-[#e11d48] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-[#e11d48]">
                Verification Error
              </h4>
              <p className="text-sm text-[#991b1b] mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {!isProcessing && verificationResult && (
        <div className="mt-6">
          {verificationResult.verified ? (
            <div className="p-8 bg-[#f0fdf4] border-2 border-[#86efac] rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#059669] mt-4">
                  ✅ Verified
                </h3>
                <p className="text-lg text-[#065f46] mt-2">
                  This document has been verified on the Hedera network
                </p>
                {verificationResult.details && (
                  <div className="mt-6 w-full max-w-md bg-white rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-[#1e293b] text-sm mb-2">
                      Verification Details
                    </h4>
                    <div className="space-y-1 text-xs">
                      {verificationResult.details.transactionId && (
                        <div>
                          <span className="text-[#64748b]">
                            Transaction ID:
                          </span>{" "}
                          <span className="font-mono text-[#059669]">
                            {verificationResult.details.transactionId}
                          </span>
                        </div>
                      )}
                      {verificationResult.details.timestamp && (
                        <div>
                          <span className="text-[#64748b]">Anchored:</span>{" "}
                          <span className="text-[#1e293b]">
                            {new Date(
                              verificationResult.details.timestamp
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {verificationResult.details.organization && (
                        <div>
                          <span className="text-[#64748b]">Organization:</span>{" "}
                          <span className="text-[#1e293b]">
                            {verificationResult.details.organization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#fef2f2] border-2 border-[#fecaca] rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#e11d48] rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#e11d48] mt-4">
                  ❌ Not Verified
                </h3>
                <p className="text-lg text-[#991b1b] mt-2">
                  This document could not be verified on the Hedera network
                </p>
                <p className="text-sm text-[#64748b] mt-4">
                  The document hash was not found in our records. This document
                  may not have been anchored, or it may have been modified since
                  anchoring.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="mt-6 p-8 bg-white border border-[#e2e8f0] rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e11d48]"></div>
            <p className="text-[#64748b] mt-4">
              Verifying document on Hedera network...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
