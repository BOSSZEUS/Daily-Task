"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, List, Category, Entry } from "@/lib/types/database";
import CategorySection from "./CategorySection";
import ListSelector from "./ListSelector";
import AddCategoryForm from "./AddCategoryForm";
import ExportButton from "./ExportButton";
import ShareModal from "./ShareModal";
import InstallButton from "./InstallButton";
import Logo from "./Logo";

interface DashboardProps {
  user: User;
  profile: Profile | null;
  initialLists: List[];
  activeListId: string;
  initialCategories: Category[];
  initialEntries: Entry[];
}

const DEFAULT_CATEGORIES = [
  "Bugs Fixed",
  "Projects Shipped",
  "Process Improvements",
  "Skills Learned",
  "Other Wins",
];

export default function Dashboard({
  user,
  profile,
  initialLists,
  activeListId,
  initialCategories,
  initialEntries,
}: DashboardProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(
    null,
  );
  const supabase = createClient();
  const router = useRouter();

  // ── List handlers ──────────────────────────────────────────

  function handleSelectList(listId: string) {
    router.push(`/dashboard?listId=${listId}`);
  }

  async function handleCreateList(name: string) {
    const maxOrder = lists.reduce(
      (max, l) => Math.max(max, l.sort_order),
      -1,
    );

    // Insert the list
    const { data: newList, error: listError } = (await supabase
      .from("lists")
      .insert({
        user_id: user.id,
        name,
        sort_order: maxOrder + 1,
      })
      .select()
      .single()) as { data: List | null; error: unknown };

    if (listError || !newList) return;

    // Seed default categories into the new list
    const categoryInserts = DEFAULT_CATEGORIES.map((catName, i) => ({
      user_id: user.id,
      list_id: newList.id,
      name: catName,
      sort_order: i,
    }));

    const { data: newCategories } = (await supabase
      .from("categories")
      .insert(categoryInserts)
      .select()) as { data: Category[] | null };

    setLists((prev) => [...prev, newList]);
    if (newCategories) {
      setCategories(newCategories);
    }

    // Navigate to the new list
    router.push(`/dashboard?listId=${newList.id}`);
  }

  async function handleDeleteList(listId: string) {
    if (lists.length <= 1) return; // prevent deleting last list

    const { error } = await supabase.from("lists").delete().eq("id", listId);
    if (error) return;

    const remaining = lists.filter((l) => l.id !== listId);
    setLists(remaining);

    // If we deleted the active list, navigate to the first remaining list
    if (listId === activeListId) {
      router.push(`/dashboard?listId=${remaining[0].id}`);
    }
  }

  // ── Category handlers ──────────────────────────────────────

  async function handleAddCategory(name: string) {
    const maxOrder = categories.reduce(
      (max, c) => Math.max(max, c.sort_order),
      -1,
    );

    const { data, error } = (await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        list_id: activeListId,
        name,
        sort_order: maxOrder + 1,
      })
      .select()
      .single()) as { data: Category | null; error: unknown };

    if (!error && data) {
      setCategories((prev) => [...prev, data]);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setEntries((prev) => prev.filter((e) => e.category_id !== categoryId));
    }
  }

  // ── Entry handlers ─────────────────────────────────────────

  async function handleAddEntry(categoryId: string, content: string) {
    const { data, error } = (await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        category_id: categoryId,
        content,
      })
      .select()
      .single()) as { data: Entry | null; error: unknown };

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

  async function handleMoveEntry(entryId: string, newCategoryId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry || entry.category_id === newCategoryId) return;

    // Optimistic update
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, category_id: newCategoryId } : e,
      ),
    );

    const { error } = await supabase
      .from("entries")
      .update({ category_id: newCategoryId })
      .eq("id", entryId);

    if (error) {
      // Revert on failure
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, category_id: entry.category_id } : e,
        ),
      );
    }
  }

  // ── Auth ───────────────────────────────────────────────────

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Task Tracker</h1>
              <p className="text-sm text-zinc-500">Hey, {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InstallButton />
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
        {/* List selector */}
        <ListSelector
          lists={lists}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
        />

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              entries={entries.filter((e) => e.category_id === category.id)}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
              onDeleteCategory={handleDeleteCategory}
              onMoveEntry={handleMoveEntry}
              isDragOver={dragOverCategoryId === category.id}
              onDragOverChange={(isOver) =>
                setDragOverCategoryId(isOver ? category.id : null)
              }
            />
          ))}
        </div>

        {/* Add category */}
        {activeListId && <AddCategoryForm onAdd={handleAddCategory} />}

        {categories.length === 0 && (
          <div className="py-20 text-center text-zinc-400">
            <p>No categories yet. Add one below!</p>
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
