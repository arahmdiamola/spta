"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

export default function ParentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const [sort, setSort] = useState(searchParams.get("sort") || "asc");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      if (sort && sort !== "asc") {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }
      
      params.set("page", "1"); // Reset to page 1 on new search or sort
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, sort, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-3 flex-1">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search parents by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
        {isPending && <span className="text-xs text-slate-400">Loading...</span>}
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center shrink-0">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-slate-700 font-medium"
        >
          <option value="asc">A to Z</option>
          <option value="desc">Z to A</option>
        </select>
      </div>
    </div>
  );
}
