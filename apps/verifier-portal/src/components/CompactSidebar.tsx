"use client";

import { motion } from "framer-motion";
import { UploadCloud, RefreshCcw } from "lucide-react";
import SearchBar from "./SearchBar";

interface CompactSidebarProps {
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

export default function CompactSidebar({
  searchValue,
  setSearchValue,
  handleSearch,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  isDragging,
  isLightTheme,
}: CompactSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full flex flex-col h-full"
    >
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#e0e0e0] dark:text-[#1e293b] tracking-wide">
          Dtrust Public Verifier
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
      </header>

      {/* Search Input */}
      <div className="mb-6">
        <SearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleSearch={handleSearch}
          showHelper={false}
        />
      </div>

      {/* OR Divider */}
      <div className="text-center mb-6">
        <span className="text-[#e0e0e0]/60 dark:text-[#64748b] font-bold">
          OR
        </span>
      </div>

      {/* File Uploader - Compact */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={` flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md hover:border-primary ${
          isDragging
            ? "drag-over border-primary"
            : "border-[#333] dark:border-[#e2e8f0]"
        }`}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileSelect}
        />
        <label
          htmlFor="file-input"
          className="flex flex-col items-center justify-center w-full cursor-pointer"
        >
          <UploadCloud
            className="text-gray-500 dark:text-[#059669] mb-3"
            size={48}
            style={!isLightTheme ? { textShadow: "0 0 10px #ff0055" } : {}}
          />
          <p className="text-base font-bold text-[#e0e0e0] dark:text-[#1e293b] uppercase text-center">
            Drag and drop a file
          </p>
          <p className="text-xs text-[#e0e0e0]/70 dark:text-[#64748b] mt-1">
            or click to select
          </p>
          <span className="mt-4 px-4 py-2 bg-primary text-[#191919] dark:text-white font-bold rounded-full text-xs uppercase">
            Browse Files
          </span>
        </label>
      </div>

      {/* Batch Re-Verify Button */}
      {/* <button className="mt-auto w-full py-3 bg-[#ff0055] dark:bg-[#059669] text-[#191919] dark:text-white font-bold rounded-md uppercase text-sm hover:bg-[#ff0055]/80 dark:hover:bg-[#047857] transition-colors flex items-center justify-center"> */}
      <button className="w-full mt-auto py-3 bg-primary text-[#191919] dark:text-white font-bold rounded-md uppercase text-sm  cursor-pointer flex items-center justify-center">
        <RefreshCcw className="mr-2" size={18} />
        Batch Re-Verify
      </button>

      {/* Powered by Badge */}
    </motion.div>
  );
}
