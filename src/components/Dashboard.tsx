"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, Category, Entry } from "@/lib/types/database";
import CategorySection from "./CategorySection";
import ExportButton from "./ExportButton";
import ShareModal from "./ShareModal";

interface DashboardProps {
  user: User;
  profile: Profile | null;
  initialCategories: Category[];
  initialEntries: Entry[];
}

export default function Dashboard({
  user,
  profile,
  initialCategories,
  initialEntries,
}: DashboardProps) {
  const [categories] = useState<Category[]>(initialCategories);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [showShareModal, setShowShareModal] = useState(false);
  const supabase = createClient();

  async function handleAddEntry(categoryId: string, content: string) {
    const { data, error } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        category_id: categoryId,
        content,
      })
      .select()
      .single() as { data: Entry | null; error: unknown };

    if (!error && data) {
      setEntries((prev) => [data, ...prev]);
    }
  }

  async function handleDeleteEntry(entryId: string) {
    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", entryId);

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Task Tracker</h1>
            <p className="text-sm text-zinc-500">Hey, {displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton categories={categories} entries={entries} />
            <button
              onClick={() => setShowShareModal(true)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Share
            </button>
            <a
              href="/settings"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Reminders
            </a>
            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              entries={entries.filter((e) => e.category_id === category.id)}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="py-20 text-center text-zinc-400">
            <p>No categories yet. They should appear after signup.</p>
          </div>
        )}
      </main>

      {showShareModal && (
        <ShareModal
          categories={categories}
          entries={entries}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
