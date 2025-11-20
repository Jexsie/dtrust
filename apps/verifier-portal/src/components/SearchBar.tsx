"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
  showHelper?: boolean;
}

export default function SearchBar({
  searchValue,
  setSearchValue,
  handleSearch,
  showHelper = false,
}: SearchBarProps) {
  return (
    <div className="w-full">
      <div className="relative w-full">
        <input
          type="text"
          name="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="SEARCH TXN / HASH"
          className="w-full pl-12 pr-4 py-3 text-sm bg-[#1a1a1a] dark:bg-white border border-[#333] dark:border-[#e2e8f0] rounded-md focus:ring-2 focus:ring-[#059669]  focus:border-primary dark:focus:border-[#059669] placeholder-[#e0e0e0]/50 dark:placeholder-[#64748b]/50 text-[#e0e0e0] dark:text-[#1e293b] shadow-inner"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-[#e0e0e0]/60 dark:text-[#64748b]" size={18} />
        </div>
      </div>
      {showHelper && (
        <p className="text-center text-sm text-[#e0e0e0]/60 dark:text-[#64748b] mt-3">
          Search by transaction ID or document hash
        </p>
      )}
    </div>
  );
}
