"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/guides");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite dark:bg-offwhite-dark text-xs text-ink-muted">
      Redirecting to guides...
    </div>
  );
}
