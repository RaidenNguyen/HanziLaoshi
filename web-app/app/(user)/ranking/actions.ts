"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface RankedUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_hsk_level: number;
  mastered: number;
  learning: number;
  total_known: number;
}

export async function getRankings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { rankings: [], currentUserId: null };

  // Use admin client to bypass RLS for cross-user stats
  const admin = createAdminClient();

  // Get all user profiles
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, current_hsk_level");

  if (profilesError || !profiles)
    return { rankings: [], currentUserId: user.id };

  // Get all user_vocabulary counts in bulk
  const { data: allStats, error: statsError } = await admin
    .from("user_vocabulary")
    .select("user_id, status");

  if (statsError) return { rankings: [], currentUserId: user.id };

  // Aggregate stats per user
  const userStatsMap = new Map<
    string,
    { mastered: number; learning: number }
  >();
  (allStats || []).forEach((row: any) => {
    const existing = userStatsMap.get(row.user_id) || {
      mastered: 0,
      learning: 0,
    };
    if (row.status === "mastered") existing.mastered++;
    else if (row.status === "learning") existing.learning++;
    userStatsMap.set(row.user_id, existing);
  });

  // Build rankings
  const rankings: RankedUser[] = profiles.map((profile: any) => {
    const stats = userStatsMap.get(profile.id) || { mastered: 0, learning: 0 };
    return {
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      current_hsk_level: profile.current_hsk_level || 1,
      mastered: stats.mastered,
      learning: stats.learning,
      total_known: stats.mastered + stats.learning,
    };
  });

  // Sort by mastered desc, then total_known desc
  rankings.sort(
    (a, b) => b.mastered - a.mastered || b.total_known - a.total_known,
  );

  return { rankings, currentUserId: user.id };
}

export interface UserLevelStats {
  level: number;
  total: number;
  mastered: number;
  learning: number;
  new_words: number;
}

export async function getUserLevelBreakdown(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Get all vocabulary counts per level
  const vocabCountsPromise = Promise.all(
    levels.map(async (level) => {
      const { count } = await admin
        .from("vocabulary")
        .select("*", { count: "exact", head: true })
        .eq("hsk_level", level);
      return { level, total: count || 0 };
    }),
  );

  // Get all user_vocabulary for this user with vocabulary hsk_level
  const userVocabPromise = admin
    .from("user_vocabulary")
    .select("status, vocabulary!inner(hsk_level)")
    .eq("user_id", userId);

  const [vocabCounts, { data: userVocab }] = await Promise.all([
    vocabCountsPromise,
    userVocabPromise,
  ]);

  // Aggregate
  const levelMap = new Map<number, { mastered: number; learning: number }>();
  levels.forEach((l) => levelMap.set(l, { mastered: 0, learning: 0 }));

  (userVocab || []).forEach((row: any) => {
    const hskLevel = row.vocabulary?.hsk_level;
    if (hskLevel && levelMap.has(hskLevel)) {
      const existing = levelMap.get(hskLevel)!;
      if (row.status === "mastered") existing.mastered++;
      else if (row.status === "learning") existing.learning++;
    }
  });

  const stats: UserLevelStats[] = vocabCounts.map(({ level, total }) => {
    const s = levelMap.get(level)!;
    return {
      level,
      total,
      mastered: s.mastered,
      learning: s.learning,
      new_words: total - s.mastered - s.learning,
    };
  });

  return stats;
}
