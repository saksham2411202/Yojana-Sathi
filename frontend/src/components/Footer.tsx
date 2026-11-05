"use client";

import React from "react";
import { UIStrings } from "@/lib/strings";

interface FooterProps {
  t?: UIStrings;
}

export function Footer({}: FooterProps) {
  return (
    <footer className="w-full py-4 px-4 text-center border-t border-offwhite-border dark:border-offwhite-darkBorder bg-offwhite/50 dark:bg-offwhite-dark/50 text-[11px] text-ink-muted dark:text-slate-400">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          © {new Date().getFullYear()} Yojana Saathi — Independent public directory referencing official .gov.in portals.
        </span>
        <span className="font-semibold text-teal-deep dark:text-amber-warm">
          Zero login required. Zero personal data stored.
        </span>
      </div>
    </footer>
  );
}
