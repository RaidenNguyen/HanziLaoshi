"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalVocabulary: number;
  totalMastered: number;
  totalLearning: number;
  hskDistribution: { level: number; count: number }[];
  topLearners: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    mastered: number;
    learning: number;
  }[];
  recentUsers: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Verify admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();

  // All profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, email, current_hsk_level, created_at");
  const allUsers = profiles || [];

  // Total users
  const totalUsers = allUsers.length;

  // New users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newUsersToday = allUsers.filter(
    (u) => new Date(u.created_at) >= today,
  ).length;

  // New users this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const newUsersThisWeek = allUsers.filter(
    (u) => new Date(u.created_at) >= weekAgo,
  ).length;

  // Total vocabulary in DB
  const { count: totalVocabulary } = await admin
    .from("vocabulary")
    .select("*", { count: "exact", head: true });

  // All user_vocabulary records
  const { data: allUv } = await admin
    .from("user_vocabulary")
    .select("user_id, status");

  const uvData = allUv || [];
  const totalMastered = uvData.filter((r) => r.status === "mastered").length;
  const totalLearning = uvData.filter((r) => r.status === "learning").length;

  // HSK level distribution (how many users at each level)
  const hskMap = new Map<number, number>();
  allUsers.forEach((u) => {
    const lvl = u.current_hsk_level || 1;
    hskMap.set(lvl, (hskMap.get(lvl) || 0) + 1);
  });
  const hskDistribution = Array.from(hskMap.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level - b.level);

  // Top learners (by mastered count)
  const userMasteredMap = new Map<
    string,
    { mastered: number; learning: number }
  >();
  uvData.forEach((r) => {
    const existing = userMasteredMap.get(r.user_id) || {
      mastered: 0,
      learning: 0,
    };
    if (r.status === "mastered") existing.mastered++;
    else if (r.status === "learning") existing.learning++;
    userMasteredMap.set(r.user_id, existing);
  });

  const topLearners = allUsers
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      mastered: userMasteredMap.get(u.id)?.mastered || 0,
      learning: userMasteredMap.get(u.id)?.learning || 0,
    }))
    .sort((a, b) => b.mastered - a.mastered)
    .slice(0, 5);

  // Recent users (5 newest)
  const recentUsers = [...allUsers]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      avatar_url: u.avatar_url,
      created_at: u.created_at,
    }));

  return {
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    totalVocabulary: totalVocabulary || 0,
    totalMastered,
    totalLearning,
    hskDistribution,
    topLearners,
    recentUsers,
  };
}
