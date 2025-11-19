/**
 * AnchorModal Component
 *
 * 3-step modal for document anchoring:
 * Step 1: Upload - File selection
 * Step 2: Confirm - Preview and confirmation
 * Step 3: Status - Anchoring result
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnchorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AnchorResult {
  hash: string;
  transactionId: string;
  timestamp: string;
  status: "success" | "error";
  error?: string;
}

export default function AnchorModal({
  isOpen,
  onClose,
  onSuccess,
}: AnchorModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorResult, setAnchorResult] = useState<AnchorResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setFilePreview("");
    setIsConfirmed(false);
    setIsAnchoring(false);
    setAnchorResult(null);
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);

    // Generate preview for text/PDF files
    if (file.type.startsWith("text/") || file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFilePreview(content.substring(0, 500)); // First 500 chars
      };
      reader.readAsText(file);
    } else {
      setFilePreview("Binary file - preview not available");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedFile) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isConfirmed) {
      setCurrentStep(3);
      handleAnchor();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) {
        setAnchorResult(null);
        setIsAnchoring(false);
      }
    }
  };

  const handleAnchor = async () => {
    if (!selectedFile) return;

    setIsAnchoring(true);

    try {
      // Send file to server-side proxy endpoint
      // The server will handle hashing, signing, and API calls
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/anchor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to anchor document: ${response.statusText}`
        );
      }

      const data = await response.json();

      setAnchorResult({
        hash: data.proof.documentHash,
        transactionId: data.proof.hederaTransactionId,
        timestamp: data.proof.consensusTimestamp,
        status: "success",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setAnchorResult({
        hash: "",
        transactionId: "",
        timestamp: "",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsAnchoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Anchor New Document
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentStep >= step
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {step === 1 ? "Upload" : step === 2 ? "Confirm" : "Status"}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`w-20 h-1 mx-4 rounded-full ${
                    currentStep > step
                      ? "bg-emerald-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Select Document
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose a file to anchor on the Hedera network. Your file will
                  be hashed locally for privacy.
                </p>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-emerald-600 bg-emerald-600/10"
                    : selectedFile
                    ? "border-emerald-600/60 bg-emerald-600/5"
                    : "border-slate-300 dark:border-slate-600 hover:border-emerald-600/40 hover:bg-emerald-600/5"
                }`}
              >
                <input
                  type="file"
                  id="modal-file-upload"
                  className="sr-only"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="modal-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-6xl mb-4">
                    {selectedFile ? "check_circle" : "cloud_upload"}
                  </span>
                  {selectedFile ? (
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Drag & drop your file here
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        or click to browse
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {currentStep === 2 && selectedFile && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Confirm Document
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Verify that this is the correct document before anchoring.
                </p>
              </div>

              {/* File Info */}
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    File Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedFile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    File Size
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    File Type
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {selectedFile.type || "Unknown"}
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {filePreview && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Content Preview
                  </p>
                  <div className="rounded-lg bg-slate-900 dark:bg-slate-950 p-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                      {filePreview}
                      {filePreview.length >= 500 && "..."}
                    </pre>
                  </div>
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <input
                  type="checkbox"
                  id="confirm-checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="confirm-checkbox"
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  I confirm that this is the canonical version of the document
                  and I want to anchor it to the Hedera network. This action
                  cannot be undone.
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 3: Status */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Anchoring Status
                </h3>
              </div>

              {isAnchoring && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Anchoring document...
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Please wait while we anchor your document to Hedera
                  </p>
                </div>
              )}

              {!isAnchoring && anchorResult?.status === "success" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-emerald-600 text-6xl">
                      check_circle
                    </span>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      Successfully Anchored!
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Your document has been anchored to the Hedera network
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Document Hash (SHA-256)
                      </p>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                        {anchorResult.hash}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Transaction ID
                      </p>
                      <p className="text-sm font-mono text-slate-900 dark:text-white">
                        {anchorResult.transactionId}
                      </p>
                      <a
                        href={`https://hashscan.io/mainnet/transaction/${anchorResult.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        View on HashScan
                        <span className="material-symbols-outlined text-sm ml-1">
                          open_in_new
                        </span>
                      </a>
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Timestamp
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {new Date(anchorResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isAnchoring && anchorResult?.status === "error" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center p-6 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <span className="material-symbols-outlined text-rose-600 text-6xl">
                      error
                    </span>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400">
                      Anchoring Failed
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {anchorResult.error ||
                        "An error occurred while anchoring"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={currentStep === 1 ? handleClose : handleBack}
            disabled={isAnchoring}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-3">
            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedFile) ||
                  (currentStep === 2 && !isConfirmed)
                }
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === 2 ? "Anchor Document" : "Next"}
              </button>
            )}
            {currentStep === 3 && anchorResult && (
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
