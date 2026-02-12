"use client";

import { useState } from "react";

interface AddCategoryFormProps {
  onAdd: (name: string) => Promise<void>;
}

export default function AddCategoryForm({ onAdd }: AddCategoryFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAdd(trimmed);
    setName("");
    setSaving(false);
    setIsAdding(false);
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="mt-4 flex w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600"
      >
        + Add Category
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex gap-2 rounded-lg border border-zinc-200 bg-white p-3"
    >
      <input
        type="text"
        autoFocus
        placeholder="Category name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsAdding(false);
            setName("");
          }
        }}
        disabled={saving}
        className="flex-1 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      />
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
      >
        {saving ? "Adding..." : "Add"}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsAdding(false);
          setName("");
        }}
        className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700"
      >
        Cancel
      </button>
    </form>
  );
}
