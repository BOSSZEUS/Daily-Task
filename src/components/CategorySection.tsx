"use client";

import { useState } from "react";
import type { Category, Entry } from "@/lib/types/database";

interface CategorySectionProps {
  category: Category;
  entries: Entry[];
  onAddEntry: (categoryId: string, content: string) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onMoveEntry: (entryId: string, newCategoryId: string) => Promise<void>;
  isDragOver: boolean;
  onDragOverChange: (isOver: boolean) => void;
}

export default function CategorySection({
  category,
  entries,
  onAddEntry,
  onDeleteEntry,
  onDeleteCategory,
  onMoveEntry,
  isDragOver,
  onDragOverChange,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = newContent.trim();
    if (!content) return;

    setIsAdding(true);
    await onAddEntry(category.id, content);
    setNewContent("");
    setIsAdding(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // ── Drag & Drop handlers ────────────────────────────────────

  function handleDragStart(e: React.DragEvent, entryId: string) {
    e.dataTransfer.setData("text/plain", entryId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOverChange(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only fire when leaving the category container itself
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragOverChange(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onDragOverChange(false);
    const entryId = e.dataTransfer.getData("text/plain");
    if (entryId) {
      onMoveEntry(entryId, category.id);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white transition-colors ${
        isDragOver
          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
          : "border-zinc-200"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Category header */}
      <div className="group flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left"
        >
          <svg
            className={`h-4 w-4 text-zinc-400 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <h2 className="font-semibold text-zinc-900">{category.name}</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
            {entries.length}
          </span>
        </button>

        {/* Delete category button (hover-reveal) */}
        <button
          onClick={() => onDeleteCategory(category.id)}
          className="rounded p-1 text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="Delete category"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-100 px-4 pb-4">
          {/* Quick-add form */}
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder={`Add to ${category.name}...`}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={isAdding}
              className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <button
              type="submit"
              disabled={isAdding || !newContent.trim()}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
            >
              Add
            </button>
          </form>

          {/* Entries list */}
          {entries.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entry.id)}
                  className="group/entry flex cursor-grab items-start justify-between rounded-md px-2 py-1.5 hover:bg-zinc-50 active:cursor-grabbing"
                >
                  <div className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 shrink-0 text-xs text-zinc-400">
                      {formatDate(entry.entry_date)}
                    </span>
                    <span className="text-zinc-700">{entry.content}</span>
                  </div>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="ml-2 shrink-0 text-zinc-300 opacity-0 transition-opacity hover:text-red-500 group-hover/entry:opacity-100"
                    title="Delete entry"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-center text-sm text-zinc-400">
              No entries yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
