"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { UIStrings } from "@/lib/strings";

interface MobileStickyBarProps {
  t: UIStrings;
}

export function MobileStickyBar({ t }: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 sm:hidden shadow-lg">
      <Link
        href="/match"
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
      >
        <Compass className="w-4 h-4 animate-spin-slow" />
        <span>{t.heroCheckEligibility}</span>
      </Link>
    </div>
  );
}

