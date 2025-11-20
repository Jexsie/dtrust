"use client";

import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import SearchBar from "./SearchBar";

interface WelcomeScreenProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  isLightTheme: boolean;
}

export default function WelcomeScreen({
  searchValue,
  setSearchValue,
  handleSearch,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  isDragging,
  isLightTheme,
}: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto space-y-12 px-8"
    >
      {/* Header */}
      <header className="self-end">
        <h1 className="font-['Orbitron'] text-5xl font-bold text-[#e0e0e0] dark:text-[#1e293b] tracking-wide mb-4">
          Dtrust Public Verifier
        </h1>
        <div className="w-32 h-1 bg-primary mx-auto mt-4"></div>
        <p className="text-center text-xs text-[#e0e0e0]/40 dark:text-[#64748b]/60 mt-3 font-medium tracking-wider">
          POWERED BY HEDERA HASHGRAPH
        </p>
      </header>

      {/* Side by Side: Description + Search/Upload */}
      <div className="flex flex-col md:flex-row gap-12 w-full">
        {/* Left: Description */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Catchy Tagline */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2 font-['Orbitron']">
              Trust Less. Verify More.
            </h2>
            <p className="text-lg text-[#e0e0e0]/60 dark:text-[#64748b] font-medium">
              Secure • Private • Instant
            </p>
          </div>

          {/* Main Description */}
          <div className="space-y-4">
            <p className="text-base text-[#e0e0e0]/80 dark:text-[#475569] leading-relaxed">
              Verify document authenticity instantly on the Hedera distributed
              ledger—your files are hashed locally in your browser, ensuring
              complete privacy as no data ever leaves your device.
            </p>

            {/* Instructions */}
            <p className="text-base text-[#e0e0e0]/80 dark:text-[#475569] leading-relaxed">
              Search using the document hash or transaction ID, or simply upload
              the file to check if it&apos;s authentic. If the document is not
              verified, contact your issuer to authenticate it before taking any
              further actions.
            </p>
          </div>
        </div>

        {/* Right: Search and Upload */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Search Bar */}
          <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleSearch={handleSearch}
            showHelper={false}
          />

          {/* OR Divider */}
          <div className="flex items-center w-full">
            <div className="flex-1 border-t border-[#333] dark:border-[#e2e8f0]"></div>
            <span className="px-4 text-[#e0e0e0]/60 dark:text-[#64748b] font-bold text-sm">
              OR
            </span>
            <div className="flex-1 border-t border-[#333] dark:border-[#e2e8f0]"></div>
          </div>

          {/* File Uploader */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl hover:border-primary ${
              isDragging
                ? "drag-over border-primary"
                : "border-[#333] dark:border-[#e2e8f0]"
            }`}
          >
            <input
              type="file"
              id="file-input-welcome"
              className="hidden"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="file-input-welcome"
              className="flex flex-col items-center justify-center w-full cursor-pointer"
            >
              <UploadCloud
                className="text-[#e0e0e0]/40 dark:text-[#cacfd6] mb-4"
                size={64}
                style={!isLightTheme ? { textShadow: "0 0 10px #ff0055" } : {}}
              />
              <p className="text-xl font-bold text-[#e0e0e0] dark:text-[#1e293b] uppercase text-center mb-2">
                Drag and drop a file
              </p>
              <p className="text-sm text-[#e0e0e0]/70 dark:text-[#64748b] mb-4">
                or click to select
              </p>
              <span className="px-6 py-2.5 bg-primary text-[#191919] dark:text-white font-bold rounded-full text-sm uppercase">
                Browse Files
              </span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
