/**
 * Dtrust Command Center - Public Verifier
 *
 * Main page component that orchestrates the verification UI
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { hashFile } from "@/lib/fileHasher";
import ThemeToggle from "@/components/ThemeToggle";
import WelcomeScreen from "@/components/WelcomeScreen";
import CompactSidebar from "@/components/CompactSidebar";
import VerificationResult from "@/components/VerificationResult";
import StatsGrid from "@/components/StatsGrid";
import TransactionLogTable from "@/components/TransactionLogTable";

interface VerificationResult {
  verified: boolean;
  transactionId?: string;
  timestamp?: string;
  organization?: string;
}

interface Transaction {
  time: string;
  transactionId: string;
  status: "Verified" | "Failed";
  fileName: string;
}

export default function CommandCenterPage() {
  // State management
  const [isDragging, setIsDragging] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = !isLightTheme;
    setIsLightTheme(newTheme);
    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("verifier-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("verifier-theme", "dark");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  // File processing
  const processFile = async (file: File) => {
    setHasStarted(true);
    setIsProcessing(true);
    setResult(null);

    try {
      const hash = await hashFile(file);

      const response = await fetch("http://localhost:3001/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hash }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const data = await response.json();
      setResult({
        verified: data.verified || false,
        transactionId: data.transactionId,
        timestamp: data.timestamp,
        organization: data.organization,
      });

      const newTransaction: Transaction = {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        transactionId: data.transactionId || `0.0.123456-${Date.now()}`,
        status: data.verified ? "Verified" : "Failed",
        fileName: file.name,
      };
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error("Error processing file:", err);
      setResult({
        verified: false,
        transactionId: undefined,
      });

      const newTransaction: Transaction = {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        transactionId: `0.0.123456-${Date.now()}`,
        status: "Failed",
        fileName: file.name,
      };
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        document.getElementById("result-container")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setHasStarted(true);
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      const mockResult: VerificationResult = {
        verified: Math.random() > 0.5,
        transactionId: searchValue.includes("0.0.")
          ? searchValue
          : `0.0.123456-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      setResult(mockResult);

      const newTransaction: Transaction = {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        transactionId: mockResult.transactionId || `0.0.123456-${Date.now()}`,
        status: mockResult.verified ? "Verified" : "Failed",
        fileName: `Search: ${searchValue.substring(0, 20)}${
          searchValue.length > 20 ? "..." : ""
        }`,
      };
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);

      setIsProcessing(false);

      setTimeout(() => {
        document.getElementById("result-container")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 700);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[#191919] dark:bg-[#f8fafc] font-['Montserrat'] text-[#e0e0e0] dark:text-[#1e293b]">
      {/* Left Sidebar / Welcome Screen */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: hasStarted ? "20rem" : "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="flex-none bg-[#1a1a1a] dark:bg-white border-r border-[#333] dark:border-[#e2e8f0] p-6 flex flex-col items-center dark:shadow-lg relative"
        style={{
          justifyContent: hasStarted ? "flex-start" : "center",
          paddingTop: hasStarted ? "2rem" : "0",
        }}
      >
        {/* Theme Toggle */}
        <ThemeToggle
          isLightTheme={isLightTheme}
          toggleTheme={toggleTheme}
          hasStarted={hasStarted}
        />

        {/* Welcome Screen - Full Width (before upload) */}
        {!hasStarted && (
          <WelcomeScreen
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleSearch={handleSearch}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileSelect={handleFileSelect}
            isDragging={isDragging}
            isLightTheme={isLightTheme}
          />
        )}

        {/* Compact Sidebar View (after upload) */}
        {hasStarted && (
          <CompactSidebar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleSearch={handleSearch}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileSelect={handleFileSelect}
            isDragging={isDragging}
            isLightTheme={isLightTheme}
          />
        )}
      </motion.div>

      {/* Main Content Area - Only visible after first upload */}
      {hasStarted && (
        <motion.main
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 p-8 overflow-y-auto"
        >
          {/* Top Stats Grid */}
          <StatsGrid transactions={transactions} />

          {/* Verification Result Section */}
          <VerificationResult
            isProcessing={isProcessing}
            result={result}
            isLightTheme={isLightTheme}
          />

          {/* Detailed Transaction Log */}
          <TransactionLogTable transactions={transactions} />
        </motion.main>
      )}
    </div>
  );
}
