"use client";

import { Receipt } from "lucide-react";

interface Transaction {
  time: string;
  transactionId: string;
  status: "Verified" | "Failed";
  fileName: string;
}

interface TransactionLogTableProps {
  transactions: Transaction[];
}

export default function TransactionLogTable({
  transactions,
}: TransactionLogTableProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#e0e0e0] dark:text-[#1e293b] mb-4 flex items-center">
        <Receipt className="mr-2 text-blue-400 dark:text-blue-500" size={24} />
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
                    className="text-[#ff0055] dark:text-primary hover:underline"
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
                      className="text-[#ff0055] dark:text-primary hover:underline"
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
                      className="text-[#ff0055] dark:text-primary hover:underline"
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
                      className="text-[#ff0055] dark:text-primary hover:underline"
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
  );
}
