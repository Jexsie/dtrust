/**
 * Dtrust Command Center - Public Verifier
 *
 * Cyberpunk-themed command center for document verification
 * Matches the reference design exactly
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UploadCloud,
  RefreshCcw,
  History,
  Receipt,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  ArrowRight,
  Database,
  Sun,
  Moon,
} from "lucide-react";
import { hashFile } from "@/lib/fileHasher";

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
  const [isDragging, setIsDragging] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("verifier-theme");
    if (savedTheme === "light") {
      setIsLightTheme(true);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

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

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const hash = await hashFile(file);

      const response = await fetch("http://localhost:3001/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash,
          fileName: file.name,
        }),
      });

      const data = await response.json();

      const newResult: VerificationResult = {
        verified: data.verified,
        transactionId: data.details?.transactionId,
        timestamp: data.details?.timestamp,
        organization: data.details?.organization,
      };

      setResult(newResult);

      // Add to transaction log
      const newTransaction: Transaction = {
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        transactionId:
          data.details?.transactionId || `0.0.123456-${Date.now()}`,
        status: data.verified ? "Verified" : "Failed",
        fileName: file.name,
      };
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);
    } catch {
      const failedResult: VerificationResult = {
        verified: false,
      };
      setResult(failedResult);

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

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsProcessing(true);
    // Implement search logic here
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#191919] dark:bg-[#f8fafc] font-['Montserrat'] text-[#e0e0e0] dark:text-[#1e293b]">
      {/* Left Sidebar - Command Center */}
      <div className="flex-none w-80 bg-[#1a1a1a] dark:bg-white border-r border-[#333] dark:border-[#e2e8f0] p-6 flex flex-col items-center pt-8 dark:shadow-lg">
        {/* Theme Toggle */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all bg-[#333] dark:bg-[#f1f5f9] hover:bg-[#444] dark:hover:bg-[#e2e8f0] text-[#e0e0e0] dark:text-[#1e293b]"
            title={
              isLightTheme ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-['Orbitron'] text-2xl font-bold text-[#e0e0e0] dark:text-[#1e293b] tracking-wide">
            Dtrust Command Center
          </h1>
          <div className="w-24 h-1 bg-[#ff0055] dark:bg-[#059669] mx-auto mt-2 shadow-neon-glow-red"></div>
        </header>

        {/* Search Input */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="SEARCH TXN / HASH"
            className="w-full pl-12 pr-4 py-3 text-sm bg-[#1a1a1a] dark:bg-white border border-[#333] dark:border-[#e2e8f0] rounded-md focus:ring-2 focus:ring-[#ff0055] dark:focus:ring-[#059669] focus:border-[#ff0055] dark:focus:border-[#059669] placeholder-[#e0e0e0]/50 dark:placeholder-[#64748b]/50 text-[#e0e0e0] dark:text-[#1e293b] shadow-inner"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              className="text-[#e0e0e0]/60 dark:text-[#64748b]"
              size={18}
            />
          </div>
        </div>

        {/* OR Divider */}
        <div className="text-center mb-6">
          <span className="text-[#e0e0e0]/60 dark:text-[#64748b] font-bold">
            OR
          </span>
        </div>

        {/* File Uploader */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`transition-all duration-300 flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md bg-[#1a1a1a] dark:bg-white hover:border-[#ff0055] dark:hover:border-[#059669] hover:shadow-neon-glow-red ${
            isDragging ? "drag-over" : "border-[#333] dark:border-[#e2e8f0]"
          }`}
          id="uploader"
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
              className="text-[#ff0055] dark:text-[#059669] mb-3 drop-shadow-lg"
              size={48}
              style={!isLightTheme ? { textShadow: "0 0 10px #ff0055" } : {}}
            />
            <p className="text-base font-bold text-[#e0e0e0] dark:text-[#1e293b] uppercase text-center">
              Drag and drop a file
            </p>
            <p className="text-xs text-[#e0e0e0]/70 dark:text-[#64748b] mt-1">
              or click to select
            </p>
            <span className="mt-4 px-4 py-2 bg-[#ff0055] dark:bg-[#059669] text-[#191919] dark:text-white font-bold rounded-full text-xs uppercase shadow-neon-glow-red hover:bg-[#ff0055]/80 dark:hover:bg-[#047857] transition-colors">
              Browse Files
            </span>
          </label>
        </div>

        {/* Batch Re-Verify Button */}
        <button className="mt-auto w-full py-3 bg-[#ff0055] dark:bg-[#059669] text-[#191919] dark:text-white font-bold rounded-md uppercase text-sm shadow-neon-glow-red hover:bg-[#ff0055]/80 dark:hover:bg-[#047857] transition-colors flex items-center justify-center">
          <RefreshCcw className="mr-2" size={18} />
          Batch Re-Verify
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Verifications */}
          <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-lg">
            <h2 className="text-lg font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
              <History
                className="mr-2 text-[#ff0055] dark:text-[#059669]"
                size={20}
              />
              Recent Verifications
            </h2>
            <ul className="space-y-3 text-sm">
              {transactions.slice(0, 3).map((item, index) => (
                <li
                  key={index}
                  className={`flex items-center ${
                    item.status === "Verified"
                      ? "text-[#00ffff] dark:text-[#22c55e]"
                      : "text-[#ff0055] dark:text-[#ef4444]"
                  }`}
                >
                  {item.status === "Verified" ? (
                    <CheckCircle className="mr-2" size={16} />
                  ) : (
                    <XCircle className="mr-2" size={16} />
                  )}
                  {item.fileName.substring(0, 15)}... ({item.status})
                </li>
              ))}
              {transactions.length === 0 && (
                <>
                  <li className="flex items-center text-[#00ffff] dark:text-[#22c55e]">
                    <CheckCircle className="mr-2" size={16} />
                    Doc XYZ (Verified)
                  </li>
                  <li className="flex items-center text-[#ff0055] dark:text-[#ef4444]">
                    <XCircle className="mr-2" size={16} />
                    Doc ABC (Failed)
                  </li>
                  <li className="flex items-center text-[#00ffff] dark:text-[#22c55e]">
                    <CheckCircle className="mr-2" size={16} />
                    Doc 123 (Verified)
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Transaction Logs */}
          <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-lg">
            <h2 className="text-lg font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
              <Receipt
                className="mr-2 text-blue-400 dark:text-blue-500"
                size={20}
              />
              Transaction Logs
            </h2>
            <div className="space-y-3 text-xs font-['Share_Tech_Mono'] max-h-32 overflow-y-auto custom-scrollbar">
              {transactions.slice(0, 4).map((item, index) => (
                <p
                  key={index}
                  className="text-[#e0e0e0]/70 dark:text-[#64748b]"
                >
                  [{item.time}] TXN {item.transactionId}{" "}
                  <span
                    className={
                      item.status === "Verified"
                        ? "text-[#00ffff] dark:text-[#22c55e]"
                        : "text-[#ff0055] dark:text-[#ef4444]"
                    }
                  >
                    ({item.status.toUpperCase()})
                  </span>
                </p>
              ))}
              {transactions.length === 0 && (
                <>
                  <p className="text-[#e0e0e0]/70 dark:text-[#64748b]">
                    [10:30:23] TXN 0.0.123456-1234567890{" "}
                    <span className="text-[#00ffff] dark:text-[#22c55e]">
                      (VERIFIED)
                    </span>
                  </p>
                  <p className="text-[#e0e0e0]/70 dark:text-[#64748b]">
                    [10:29:15] TXN 0.0.123455-9876543210{" "}
                    <span className="text-[#ff0055] dark:text-[#ef4444]">
                      (FAILED)
                    </span>
                  </p>
                  <p className="text-[#e0e0e0]/70 dark:text-[#64748b]">
                    [10:28:01] TXN 0.0.123454-5678901234{" "}
                    <span className="text-[#00ffff] dark:text-[#22c55e]">
                      (VERIFIED)
                    </span>
                  </p>
                  <p className="text-[#e0e0e0]/70 dark:text-[#64748b]">
                    [10:27:30] TXN 0.0.123453-1122334455{" "}
                    <span className="text-[#00ffff] dark:text-[#22c55e]">
                      (VERIFIED)
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-lg">
            <h2 className="text-lg font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
              <LinkIcon
                className="mr-2 text-green-400 dark:text-green-500"
                size={20}
              />
              Network Status
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-[#e0e0e0] dark:text-[#1e293b]">
                Hedera Mainnet:{" "}
                <span className="text-green-400 dark:text-green-500 font-semibold">
                  Online
                </span>
              </p>
              <p className="text-[#e0e0e0] dark:text-[#1e293b]">
                Current Block:{" "}
                <span className="font-['Share_Tech_Mono'] text-blue-400 dark:text-blue-500">
                  123,456,789
                </span>
              </p>
              <p className="text-[#e0e0e0] dark:text-[#1e293b]">
                Avg. Latency:{" "}
                <span className="font-['Share_Tech_Mono'] text-orange-400 dark:text-orange-500">
                  85 ms
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Verification Result Section */}
        <div className="mt-8 space-y-6" id="result-container">
          <h2 className="text-xl font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
            <Database
              className="mr-2 text-[#ff0055] dark:text-[#059669]"
              size={24}
            />
            Verification Result
          </h2>

          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#1a1a1a] dark:bg-white rounded-xl p-8 border border-[#333] dark:border-[#e2e8f0] text-center"
              >
                <div className="animate-pulse">
                  <RefreshCcw className="w-12 h-12 mx-auto text-[#ff0055] dark:text-[#059669] animate-spin" />
                  <p className="mt-4 text-[#e0e0e0] dark:text-[#1e293b] font-bold">
                    PROCESSING...
                  </p>
                </div>
              </motion.div>
            )}

            {!isProcessing && result?.verified && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-enter-active bg-[#1a1a1a] dark:bg-white rounded-xl overflow-hidden shadow-neon-glow-blue border-l-8 border-[#00ffff] dark:border-[#22c55e]"
              >
                <div className="p-6 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle
                      className="text-[#00ffff] dark:text-[#22c55e] drop-shadow-lg"
                      size={48}
                      style={
                        !isLightTheme ? { textShadow: "0 0 10px #00ffff" } : {}
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#00ffff] dark:text-[#22c55e] uppercase tracking-wider">
                      VERIFIED!
                    </h3>
                    <p className="mt-2 text-[#e0e0e0] dark:text-[#1e293b]">
                      <strong>Hedera Transaction ID:</strong>{" "}
                      <span className="font-['Share_Tech_Mono'] text-[#00ffff] dark:text-[#22c55e]">
                        {result.transactionId || "0.0.123456-1234567890"}
                      </span>
                    </p>
                    <a
                      className="inline-block mt-4 text-sm font-semibold text-[#00ffff] dark:text-[#059669] hover:underline hover:shadow-neon-glow-blue transition-shadow"
                      href={`https://hashscan.io/mainnet/transaction/${result.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VIEW ON HASHSCAN{" "}
                      <ArrowRight
                        className="inline align-middle ml-1"
                        size={16}
                      />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {!isProcessing && result && !result.verified && (
              <motion.div
                key="failure"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-enter-active bg-[#1a1a1a] dark:bg-white rounded-xl overflow-hidden shadow-neon-glow-red border-l-8 border-[#ff0055] dark:border-[#ef4444]"
              >
                <div className="p-6 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <XCircle
                      className="text-[#ff0055] dark:text-[#ef4444] drop-shadow-lg"
                      size={48}
                      style={
                        !isLightTheme ? { textShadow: "0 0 10px #ff0055" } : {}
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#ff0055] dark:text-[#ef4444] uppercase tracking-wider">
                      NOT VERIFIED!
                    </h3>
                    <p className="mt-2 text-[#e0e0e0] dark:text-[#1e293b]">
                      THIS DOCUMENT COULD NOT BE AUTHENTICATED. THE FILE MAY
                      HAVE BEEN ALTERED OR IS NOT REGISTERED ON THE DTRUST
                      NETWORK.
                    </p>
                    <a
                      className="inline-block mt-4 text-sm font-semibold text-[#ff0055] dark:text-[#ef4444] hover:underline hover:shadow-neon-glow-red transition-shadow"
                      href="#"
                    >
                      VIEW TRANSACTION DETAILS{" "}
                      <ArrowRight
                        className="inline align-middle ml-1"
                        size={16}
                      />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Transaction Log */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
            <Receipt
              className="mr-2 text-blue-400 dark:text-blue-500"
              size={24}
            />
            Detailed Transaction Log
          </h2>
          <div className="bg-[#1a1a1a] dark:bg-white rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-lg p-6">
            <table className="w-full text-left text-sm text-[#e0e0e0]/80 dark:text-[#334155]">
              <thead>
                <tr className="border-b border-[#333] dark:border-[#e2e8f0] text-[#e0e0e0] dark:text-[#1e293b] uppercase">
                  <th className="py-2 px-4">Time</th>
                  <th className="py-2 px-4">Transaction ID</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 3).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#333] dark:border-[#e2e8f0]"
                  >
                    <td className="py-3 px-4 font-['Share_Tech_Mono']">
                      {item.time}
                    </td>
                    <td className="py-3 px-4 font-['Share_Tech_Mono']">
                      {item.transactionId}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        item.status === "Verified"
                          ? "text-[#00ffff] dark:text-[#22c55e]"
                          : "text-[#ff0055] dark:text-[#ef4444]"
                      }`}
                    >
                      {item.status}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        className="text-[#ff0055] dark:text-[#059669] hover:underline"
                        href="#"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <>
                    <tr className="border-b border-[#333] dark:border-[#e2e8f0]">
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        10:30:23
                      </td>
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        0.0.123456-1234567890
                      </td>
                      <td className="py-3 px-4 text-[#00ffff] dark:text-[#22c55e]">
                        Verified
                      </td>
                      <td className="py-3 px-4">
                        <a
                          className="text-[#ff0055] dark:text-[#059669] hover:underline"
                          href="#"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-[#333] dark:border-[#e2e8f0]">
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        10:29:15
                      </td>
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        0.0.123455-9876543210
                      </td>
                      <td className="py-3 px-4 text-[#ff0055] dark:text-[#ef4444]">
                        Failed
                      </td>
                      <td className="py-3 px-4">
                        <a
                          className="text-[#ff0055] dark:text-[#059669] hover:underline"
                          href="#"
                        >
                          Details
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        10:28:01
                      </td>
                      <td className="py-3 px-4 font-['Share_Tech_Mono']">
                        0.0.123454-5678901234
                      </td>
                      <td className="py-3 px-4 text-[#00ffff] dark:text-[#22c55e]">
                        Verified
                      </td>
                      <td className="py-3 px-4">
                        <a
                          className="text-[#ff0055] dark:text-[#059669] hover:underline"
                          href="#"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
