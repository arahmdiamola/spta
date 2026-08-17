"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export default function ParentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Reset to page 1 on new search
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3 w-full max-w-md">
      <Search size={20} className="text-slate-400" />
      <input
        type="text"
        placeholder="Search parents by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
      />
      {isPending && <span className="text-xs text-slate-400">Searching...</span>}
    </div>
  );
}
