"use client";

import { useState } from "react";
import type { Category, Entry } from "@/lib/types/database";

interface ExportButtonProps {
  categories: Category[];
  entries: Entry[];
}

function generateMarkdown(categories: Category[], entries: Entry[]): string {
  const lines: string[] = ["# Brag Doc", ""];

  for (const cat of categories) {
    const catEntries = entries
      .filter((e) => e.category_id === cat.id)
      .sort(
        (a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

    if (catEntries.length === 0) continue;

    lines.push(`## ${cat.name}`, "");
    for (const entry of catEntries) {
      lines.push(`- **${entry.entry_date}** — ${entry.content}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export default function ExportButton({ categories, entries }: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const md = generateMarkdown(categories, entries);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const md = generateMarkdown(categories, entries);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brag-doc-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
      >
        {copied ? "Copied!" : "Copy MD"}
      </button>
      <button
        onClick={handleDownload}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
      >
        Download
      </button>
    </div>
  );
}
