"use client";

import { useState } from "react";
import type { List } from "@/lib/types/database";

interface ListSelectorProps {
  lists: List[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
}

export default function ListSelector({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
}: ListSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    await onCreateList(name);
    setNewName("");
    setIsCreating(false);
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {lists.map((list) => (
          <div key={list.id} className="group relative">
            <button
              onClick={() => onSelectList(list.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                list.id === activeListId
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {list.name}
            </button>
            {lists.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(list.id);
                }}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white group-hover:flex"
                title="Delete list"
              >
                &times;
              </button>
            )}
          </div>
        ))}

        {isCreating ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              placeholder="List name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewName("");
                }
              }}
              className="w-36 rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-full border border-dashed border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600"
          >
            + New List
          </button>
        )}
      </div>
    </div>
  );
}
