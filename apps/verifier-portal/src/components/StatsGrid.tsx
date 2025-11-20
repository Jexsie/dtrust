"use client";

import {
  History,
  Receipt,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Transaction {
  time: string;
  transactionId: string;
  status: "Verified" | "Failed";
  fileName: string;
}

interface StatsGridProps {
  transactions: Transaction[];
}

export default function StatsGrid({ transactions }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Recent Verifications */}
      <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-sm">
        <h2 className="text-lg font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
          <History
            className="mr-2 text-[#ff0055] dark:text-primary"
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
      <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-sm">
        <h2 className="text-lg font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
          <Receipt
            className="mr-2 text-blue-400 dark:text-blue-500"
            size={20}
          />
          Transaction Logs
        </h2>
        <div className="space-y-3 text-xs font-['Share_Tech_Mono'] max-h-32 overflow-y-auto custom-scrollbar">
          {transactions.slice(0, 4).map((item, index) => (
            <p key={index} className="text-[#e0e0e0]/70 dark:text-[#64748b]">
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
      <div className="bg-[#1a1a1a] dark:bg-white p-6 rounded-xl border border-[#333] dark:border-[#e2e8f0] shadow-sm">
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
  );
}
