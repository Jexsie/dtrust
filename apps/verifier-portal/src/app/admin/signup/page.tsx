"use client";

import React, { useState } from "react";
import { PrivateKey } from "@hashgraph/sdk";
import { KeysUtility } from "@hiero-did-sdk/core";
import { motion, AnimatePresence } from "framer-motion";

interface SignupCredentials {
  apiKey: string;
  did: string;
  privateKey: string;
  organization: {
    id: string;
    name: string;
  };
}

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactName: "",
    contactPhone: "",
    website: "",
    address: "",
    city: "",
    country: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<SignupCredentials | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      // Step 1: Generate keypair in browser (client-side)
      const newKey = PrivateKey.generateED25519();
      const privateKeyHex = newKey.toStringRaw();
      const publicKey = newKey.publicKey;

      // Step 2: Convert public key to multibase format
      const keysUtility = KeysUtility.fromPublicKey(publicKey);
      const publicKeyMultibase = keysUtility.toMultibase();

      // Step 3: Request DID creation from server
      const requestResponse = await fetch(
        `${apiUrl}/api/v1/did/request-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKeyMultibase,
          }),
        }
      );

      if (!requestResponse.ok) {
        const errorData = await requestResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `DID request failed: ${requestResponse.statusText}`
        );
      }

      const { serialisedPayload, state } = await requestResponse.json();

      const payloadBytes = new Uint8Array(
        serialisedPayload
          .match(/.{1,2}/g)!
          .map((byte: string) => parseInt(byte, 16))
      );
      const signatureBytes = newKey.sign(payloadBytes);

      const signatureHex = Array.from(signatureBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const submitResponse = await fetch(
        `${apiUrl}/api/v1/did/submit-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state,
            signature: signatureHex,
          }),
        }
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `DID submission failed: ${submitResponse.statusText}`
        );
      }

      const { did } = await submitResponse.json();

      const signupResponse = await fetch(`${apiUrl}/api/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          contactName: formData.contactName.trim(),
          contactPhone: formData.contactPhone.trim() || undefined,
          website: formData.website.trim() || undefined,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          country: formData.country.trim() || undefined,
          description: formData.description.trim() || undefined,
          did,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Signup failed: ${signupResponse.statusText}`
        );
      }

      const signupData = await signupResponse.json();

      setCredentials({
        apiKey: signupData.apiKey,
        did: did,
        privateKey: privateKeyHex,
        organization: signupData.organization,
      });

      setFormData({
        name: "",
        email: "",
        contactName: "",
        contactPhone: "",
        website: "",
        address: "",
        city: "",
        country: "",
        description: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during signup"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCredentials = () => {
    setCredentials(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Register New Organization
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create a new organization account with DID and API key
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter organization name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="contact@organization.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="United States"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="123 Main St"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="New York"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Brief description of the organization"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.contactName.trim()
              }
              className="w-full py-3 px-6 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Registering..." : "Register Organization"}
            </button>
          </form>
        </motion.div>

        {/* Credentials Modal */}
        <AnimatePresence>
          {credentials && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={handleCloseCredentials}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Registration Successful!
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Save these credentials immediately. They will never be
                        shown again.
                      </p>
                    </div>
                    <button
                      onClick={handleCloseCredentials}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Warning */}
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            Important Security Notice
                          </h3>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Copy these credentials now. This is the only time
                            they will be displayed. Store them securely in your
                            organization&apos;s environment variables.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Organization Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Organization
                      </h3>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-900 dark:text-white font-medium">
                          {credentials.organization.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          ID: {credentials.organization.id}
                        </p>
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          API Key
                        </label>
                        <button
                          onClick={() => copyToClipboard(credentials.apiKey)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 font-mono text-sm text-slate-900 dark:text-white break-all">
                        {credentials.apiKey}
                      </div>
                    </div>

                    {/* DID */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          DTRUST_DID
                        </label>
                        <button
                          onClick={() => copyToClipboard(credentials.did)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 font-mono text-sm text-slate-900 dark:text-white break-all">
                        {credentials.did}
                      </div>
                    </div>

                    {/* Private Key */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          DTRUST_DID_PRIVATE_KEY
                        </label>
                        <button
                          onClick={() =>
                            copyToClipboard(credentials.privateKey)
                          }
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 font-mono text-sm text-slate-900 dark:text-white break-all">
                        {credentials.privateKey}
                      </div>
                    </div>

                    {/* Environment Variables Example */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Environment Variables (.env.local)
                      </h3>
                      <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                        <div className="space-y-1">
                          <div>
                            <span className="text-emerald-400">
                              DTRUST_API_KEY
                            </span>
                            <span className="text-slate-400">=</span>
                            <span className="text-amber-300">
                              &quot;{credentials.apiKey}&quot;
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400">DTRUST_DID</span>
                            <span className="text-slate-400">=</span>
                            <span className="text-amber-300">
                              &quot;{credentials.did}&quot;
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400">
                              DTRUST_DID_PRIVATE_KEY
                            </span>
                            <span className="text-slate-400">=</span>
                            <span className="text-amber-300">
                              &quot;{credentials.privateKey}&quot;
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-400">
                              DTRUST_API_URL
                            </span>
                            <span className="text-slate-400">=</span>
                            <span className="text-amber-300">
                              &quot;http://localhost:3001&quot;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={handleCloseCredentials}
                      className="w-full py-3 px-6 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      I&apos;ve Saved My Credentials
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
