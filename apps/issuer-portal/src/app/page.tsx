/**
 * Home Page for Issuer Portal
 *
 * Document Anchoring Dashboard with batch upload and filters
 */

"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import AnchorModal from "@/components/AnchorModal";

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
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState(false);

  useEffect(() => {
    // Fetch documents on mount
    // For now, using dummy data as per design
    setDocuments([
      {
        id: "1",
        fileName: "Contract_Q3.pdf",
        hash: "a1b2c3d4e5f67890...",
        transactionId: "0.0.123456-1234567890",
        timestamp: "2023-10-26 10:30 AM",
        status: "Anchored",
      },
      {
        id: "2",
        fileName: "Annual_Report_2022.docx",
        hash: "b2c3d4e5f67890a1...",
        transactionId: "0.0.123455-9876543210",
        timestamp: "2023-10-26 11:00 AM",
        status: "Pending",
      },
      {
        id: "3",
        fileName: "Compliance_Doc_01.pdf",
        hash: "c3d4e5f67890a1b2...",
        transactionId: "0.0.123454-5678901234",
        timestamp: "2023-10-25 03:45 PM",
        status: "Anchored",
      },
    ]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      // Handle file upload logic here
    }
  };

  const handleUploadBatch = () => {
    console.log("Upload batch clicked");
    // Handle batch upload logic here
  };

  const handleApplyFilters = () => {
    console.log("Apply filters clicked", { statusFilter, dateFilter });
    // Handle filter logic here
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Handle export logic here
  };

  const handleAnchorSuccess = () => {
    // Refresh documents list after successful anchor
    // In a real app, you would fetch from API
    console.log("Document anchored successfully");
  };

  return (
    <Layout>
      <AnchorModal
        isOpen={isAnchorModalOpen}
        onClose={() => setIsAnchorModalOpen(false)}
        onSuccess={handleAnchorSuccess}
      />

      <div className="py-12 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          {/* Header with Anchor Button */}
          <div className="flex flex-col items-center justify-center mb-10">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl text-center">
              Document Anchoring Dashboard
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 sm:mt-6 text-center">
              Manage and track your document proofs with ease. Upload multiple
              documents, monitor their status, and access audit trails.
            </p>
            <button
              onClick={() => setIsAnchorModalOpen(true)}
              className="mt-6 flex items-center gap-2 px-8 py-3 rounded-lg bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all duration-200"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Anchor New Document
            </button>
          </div>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Batch Upload & Filters */}
            <div className="lg:col-span-1">
              {/* Batch Upload */}
              <div className="rounded-xl bg-white/50 p-6 shadow-md dark:bg-slate-800/50">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Batch Upload
                </h2>
                <div className="group relative rounded-xl border-2 border-dashed border-emerald-600/40 bg-white/50 p-6 text-center transition-all duration-300 ease-in-out hover:border-emerald-600 hover:bg-emerald-600/5 dark:border-emerald-600/30 dark:bg-black/10 dark:hover:bg-emerald-600/10">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="material-symbols-outlined text-emerald-600/70 group-hover:text-emerald-600 text-5xl">
                      cloud_upload
                    </span>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      Drag & drop files here, or
                    </p>
                    <label
                      className="cursor-pointer font-medium text-emerald-600 underline-offset-4 hover:underline"
                      htmlFor="file-upload"
                    >
                      Browse Files
                    </label>
                    <input
                      className="sr-only"
                      id="file-upload"
                      multiple
                      name="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
                <button
                  onClick={handleUploadBatch}
                  className="mt-6 w-full rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-transform duration-200 ease-in-out hover:scale-105"
                >
                  Upload Batch
                </button>
              </div>

              {/* Filters */}
              <div className="rounded-xl bg-white/50 p-6 shadow-md dark:bg-slate-800/50 mt-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Filters
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="status-filter"
                    >
                      Status
                    </label>
                    <select
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white/70 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      id="status-filter"
                      name="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Pending</option>
                      <option>Anchored</option>
                      <option>Failed</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      htmlFor="date-range-filter"
                    >
                      Date Range
                    </label>
                    <input
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white/70 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      id="date-range-filter"
                      name="date-range-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleApplyFilters}
                    className="w-full rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Content - Anchored Documents Table */}
            <div className="lg:col-span-3">
              <div className="rounded-xl bg-white/50 p-6 shadow-md dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Anchored Documents
                  </h2>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-in-out hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-base">
                      download
                    </span>
                    Export
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Anchoring Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          SHA-256 Hash
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                            {doc.fileName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.status === "Anchored"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                                  : "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {doc.timestamp}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs">
                            {doc.hash}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200">
                              View
                            </button>
                            <button className="ml-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200">
                              Audit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
