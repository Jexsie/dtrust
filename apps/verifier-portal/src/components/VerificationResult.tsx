"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Database,
} from "lucide-react";

interface VerificationResultProps {
  isProcessing: boolean;
  result: {
    verified: boolean;
    transactionId?: string;
    timestamp?: string;
    organization?: string;
  } | null;
  isLightTheme: boolean;
}

export default function VerificationResult({
  isProcessing,
  result,
  isLightTheme,
}: VerificationResultProps) {
  return (
    <div className="mt-8 space-y-6" id="result-container">
      <h2 className="text-xl font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
        <Database className="mr-2 text-[#ff0055] dark:text-primary" size={24} />
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
              <RefreshCcw className="w-12 h-12 mx-auto text-[#ff0055] dark:text-primary animate-spin" />
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
                  className="inline-block mt-4 text-sm font-semibold text-[#00ffff] dark:text-primary hover:underline hover:shadow-neon-glow-blue transition-shadow"
                  href={`https://hashscan.io/mainnet/transaction/${result.transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VIEW ON HASHSCAN{" "}
                  <ArrowRight className="inline align-middle ml-1" size={16} />
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
                  THIS DOCUMENT COULD NOT BE AUTHENTICATED. THE FILE MAY HAVE
                  BEEN ALTERED OR IS NOT REGISTERED ON THE DTRUST NETWORK.
                </p>
                <a
                  className="inline-block mt-4 text-sm font-semibold text-[#ff0055] dark:text-[#ef4444] hover:underline hover:shadow-neon-glow-red transition-shadow"
                  href="#"
                >
                  VIEW TRANSACTION DETAILS{" "}
                  <ArrowRight className="inline align-middle ml-1" size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
