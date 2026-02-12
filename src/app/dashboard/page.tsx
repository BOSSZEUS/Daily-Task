import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import type { Profile, List, Category, Entry } from "@/lib/types/database";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ listId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  // Fetch all lists for the user
  const { data: lists } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order") as { data: List[] | null };

  // Determine active list
  const params = await searchParams;
  const activeListId = params.listId || lists?.[0]?.id || "";

  // Fetch categories for the active list
  const { data: categories } = activeListId
    ? await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("list_id", activeListId)
        .order("sort_order") as { data: Category[] | null }
    : { data: [] as Category[] };

  // Fetch entries for these categories
  const categoryIds = (categories ?? []).map((c) => c.id);
  const { data: entries } = categoryIds.length > 0
    ? await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .in("category_id", categoryIds)
        .order("entry_date", { ascending: false }) as { data: Entry[] | null }
    : { data: [] as Entry[] };

  return (
    <Dashboard
      user={user}
      profile={profile}
      initialLists={lists ?? []}
      activeListId={activeListId}
      initialCategories={categories ?? []}
      initialEntries={entries ?? []}
    />
  );
}
