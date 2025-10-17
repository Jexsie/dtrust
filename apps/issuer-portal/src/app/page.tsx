/**
 * Home Page for Issuer Portal
 *
 * Dashboard page (same as /dashboard)
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";

interface AnchoredDocument {
  id: string;
  fileName: string;
  hash: string;
  transactionId: string;
  timestamp: string;
  status: string;
}

export default function HomePage() {
  const [documents, setDocuments] = useState<AnchoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/anchor/history"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load documents");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b]">Dashboard</h1>
            <p className="text-[#64748b] mt-1">
              Manage and view your anchored documents on Hedera
            </p>
          </div>
          <Link href="/anchor">
            <Button>Anchor New Document</Button>
          </Link>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Anchored Documents</CardTitle>
            <p className="text-sm text-[#64748b] mt-2">
              View all documents you've anchored to the Hedera network
            </p>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669] mx-auto"></div>
                <p className="text-[#64748b] mt-4">Loading documents...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-[#e11d48]">{error}</p>
                <Button
                  onClick={fetchDocuments}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-[#cbd5e1] mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-[#1e293b] mt-4">
                  No documents yet
                </h3>
                <p className="text-[#64748b] mt-2">
                  Start by anchoring your first document to the Hedera network
                </p>
                <Link href="/anchor">
                  <Button className="mt-4">Anchor Document</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#64748b]">
                        File Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#64748b]">
                        Hash
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#64748b]">
                        Transaction ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#64748b]">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#64748b]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]"
                      >
                        <td className="py-3 px-4 text-sm text-[#1e293b]">
                          {doc.fileName}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[#64748b]">
                          {doc.hash.substring(0, 16)}...
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[#64748b]">
                          {doc.transactionId}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#64748b]">
                          {formatDate(doc.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === "confirmed"
                                ? "bg-[#f0fdf4] text-[#059669]"
                                : "bg-[#fef3c7] text-[#f59e0b]"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
