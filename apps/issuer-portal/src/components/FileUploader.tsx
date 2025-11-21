/**
 * FileUploader Component for Issuer Portal
 *
 * Drag-and-drop file uploader that:
 * 1. Calculates SHA-256 hash in the browser using SubtleCrypto
 * 2. Sends only the hash to the backend (never the file itself)
 * 3. Provides clear feedback on success/error states
 */

"use client";

import React, { useState, useCallback } from "react";
import { hashFile, formatFileSize } from "@/lib/fileHasher";
import { getApiUrl } from "@/lib/api";
import { FilePreviewModal } from "./FilePreviewModal";

interface FileUploaderProps {
  onSuccess?: (data: {
    proof: {
      documentHash: string;
      hederaTransactionId: string;
      consensusTimestamp: string;
    };
  }) => void;
  onError?: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onSuccess,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      setSelectedFile(file);

      try {
        // Calculate SHA-256 hash in the browser
        const hash = await hashFile(file);
        setFileHash(hash);
        setIsProcessing(false);
        // Show modal for confirmation
        setShowModal(true);
      } catch {
        setError("Failed to calculate file hash. Please try again.");
        setIsProcessing(false);
        if (onError) onError("Failed to calculate file hash");
      }
    },
    [onError]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleConfirmAnchor = async () => {
    if (!fileHash || !selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Send only the hash to the backend
      const response = await fetch(getApiUrl("/api/v1/anchor"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash: fileHash,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to anchor document");
      }

      const data = await response.json();
      setShowModal(false);
      setSuccess(
        `Document successfully anchored! Transaction ID: ${data.transactionId}`
      );

      if (onSuccess) onSuccess(data);

      // Reset after success
      setTimeout(() => {
        setSelectedFile(null);
        setFileHash(null);
        setSuccess(null);
      }, 5000);
    } catch (error) {
      setShowModal(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to anchor document. Please try again.";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFileHash(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileHash(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full">
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? "border-[#059669] bg-[#f0fdf4]"
            : "border-[#cbd5e1] hover:border-[#059669]"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-16 h-16 text-[#64748b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-lg font-medium text-[#1e293b]">
                {isProcessing
                  ? "Processing..."
                  : "Drop your document here or click to browse"}
              </p>
              <p className="text-sm text-[#64748b] mt-1">
                File will be hashed locally in your browser
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-[#e2e8f0]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-[#1e293b]">Selected File</h4>
              <p className="text-sm text-[#64748b] mt-1">{selectedFile.name}</p>
              <p className="text-xs text-[#94a3b8] mt-1">
                Size: {formatFileSize(selectedFile.size)}
              </p>

              {fileHash && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#1e293b] mb-1">
                    SHA-256 Hash:
                  </p>
                  <p className="text-xs font-mono bg-[#f1f5f9] p-2 rounded break-all text-[#059669]">
                    {fileHash}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="ml-4 text-[#64748b] hover:text-[#e11d48] transition-colors"
              disabled={isProcessing}
            >
              <svg
                className="w-5 h-5"
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
        <div className="mt-4 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
          <p className="text-sm text-[#e11d48]">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-[#f0fdf4] border border-[#86efac] rounded-lg">
          <p className="text-sm text-[#059669]">{success}</p>
        </div>
      )}

      {/* Preview Modal */}
      {showModal && selectedFile && fileHash && (
        <FilePreviewModal
          file={selectedFile}
          fileHash={fileHash}
          onConfirm={handleConfirmAnchor}
          onCancel={handleCancelModal}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};
