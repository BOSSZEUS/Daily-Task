import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import type { Profile, Category, Entry } from "@/lib/types/database";

export default async function DashboardPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order") as { data: Category[] | null };

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false }) as { data: Entry[] | null };

  return (
    <Dashboard
      user={user}
      profile={profile}
      initialCategories={categories ?? []}
      initialEntries={entries ?? []}
    />
  );
}
