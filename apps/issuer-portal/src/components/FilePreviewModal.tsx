/**
 * FilePreviewModal Component for Issuer Portal
 *
 * Modal that displays file preview and confirmation before anchoring.
 * Includes warnings about data integrity.
 */

"use client";

import React from "react";
import { formatFileSize } from "@/lib/fileHasher";
import { Button } from "./Button";

interface FilePreviewModalProps {
  file: File;
  fileHash: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  fileHash,
  onConfirm,
  onCancel,
  isProcessing,
}) => {
  const [previewContent, setPreviewContent] = React.useState<string | null>(
    null
  );
  const [previewType, setPreviewType] = React.useState<
    "text" | "image" | "unsupported"
  >("unsupported");

  React.useEffect(() => {
    const loadPreview = async () => {
      // Check if it's an image
      if (file.type.startsWith("image/")) {
        setPreviewType("image");
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewContent(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      // Check if it's a text file
      else if (
        file.type.startsWith("text/") ||
        file.type === "application/json" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".md")
      ) {
        setPreviewType("text");
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          // Limit preview to first 1000 characters
          setPreviewContent(text.substring(0, 1000));
        };
        reader.readAsText(file);
      } else {
        setPreviewType("unsupported");
      }
    };

    loadPreview();
  }, [file]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-2xl font-semibold text-[#1e293b]">
            Confirm Document Anchoring
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            Review your document before anchoring to the blockchain
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* File Information */}
          <div className="mb-4">
            <h3 className="font-medium text-[#1e293b] mb-2">File Details</h3>
            <div className="bg-[#f8fafc] rounded-lg p-4 space-y-2">
              <div>
                <span className="text-xs text-[#64748b]">File Name:</span>
                <p className="text-sm text-[#1e293b] font-medium">
                  {file.name}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#64748b]">File Size:</span>
                <p className="text-sm text-[#1e293b]">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#64748b]">File Type:</span>
                <p className="text-sm text-[#1e293b]">
                  {file.type || "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#64748b]">SHA-256 Hash:</span>
                <p className="text-xs font-mono bg-white p-2 rounded break-all text-[#059669] mt-1">
                  {fileHash}
                </p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          <div className="mb-4">
            <h3 className="font-medium text-[#1e293b] mb-2">Preview</h3>
            <div className="bg-[#f8fafc] rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-auto">
              {previewType === "image" && previewContent && (
                <img
                  src={previewContent}
                  alt="Preview"
                  className="max-w-full h-auto mx-auto"
                />
              )}
              {previewType === "text" && previewContent && (
                <pre className="text-xs text-[#1e293b] whitespace-pre-wrap font-mono">
                  {previewContent}
                  {previewContent.length >= 1000 && "\n\n... (truncated)"}
                </pre>
              )}
              {previewType === "unsupported" && (
                <div className="text-center py-8">
                  <svg
                    className="w-16 h-16 text-[#cbd5e1] mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-[#64748b]">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    File will still be hashed and anchored correctly
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Warning */}
          <div className="bg-[#fffbeb] border-2 border-[#fbbf24] rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-[#f59e0b] flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-[#92400e]">
                  Please recheck if this is the file you want to anchor
                </h4>
                <p className="text-sm text-[#78350f] mt-1">
                  Verify that the file name, size, and preview match your
                  expectations. Once anchored, this cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Garbage In Garbage Out Warning */}
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-[#e11d48] flex-shrink-0 mt-0.5"
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
                <p className="text-xs text-[#991b1b] font-medium">
                  <strong>Note:</strong> Once an incorrect file is anchored,
                  incorrect data is permanently recorded on the blockchain.
                </p>
                <p className="text-xs text-[#b91c1c] mt-1">
                  Garbage in, garbage out — ensure accuracy before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            Anchor to Dtrust
          </Button>
        </div>
      </div>
    </div>
  );
};
