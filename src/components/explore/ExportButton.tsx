"use client";

import Papa from "papaparse";
import { Download } from "lucide-react";
import type { Well } from "@/types/well";

interface ExportButtonProps {
  wells: Well[];
}

export default function ExportButton({ wells }: ExportButtonProps) {
  function handleExport() {
    const rows = wells.map((w) => w.raw);
    const csv = Papa.unparse(rows);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `wells-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={wells.length === 0}
      className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 disabled:opacity-40"
      title="Export the current filtered results as CSV (opens in Excel)"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV ({wells.length})
    </button>
  );
}
