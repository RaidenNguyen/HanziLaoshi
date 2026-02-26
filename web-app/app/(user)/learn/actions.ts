"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getVocabulary(
  level: number = 1,
  page: number = 1,
  limit: number = 20,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], total: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch vocabulary for the specific level with pagination
  const {
    data: vocab,
    error,
    count,
  } = await supabase
    .from("vocabulary")
    .select(
      `
      *,
      user_vocabulary (
        status,
        mastery_score
      )
    `,
      { count: "exact" },
    )
    .eq("hsk_level", level)
    .range(from, to)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching vocabulary:", error);
    return { data: [], total: 0 };
  }

  // Transform data to simplify user_vocabulary array to single object or null
  const transformedVocab = vocab.map((item) => ({
    ...item,
    user_progress: item.user_vocabulary?.[0] || null,
  }));

  return { data: transformedVocab, total: count || 0 };
}

export async function getUserStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const stats = await Promise.all(
    levels.map(async (level) => {
      const { count: total } = await supabase
        .from("vocabulary")
        .select("*", { count: "exact", head: true })
        .eq("hsk_level", level);

      const { count: mastered } = await supabase
        .from("user_vocabulary")
        .select("*, vocabulary!inner(hsk_level)", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("vocabulary.hsk_level", level)
        .eq("status", "mastered");

      const { count: learning } = await supabase
        .from("user_vocabulary")
        .select("*, vocabulary!inner(hsk_level)", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("vocabulary.hsk_level", level)
        .eq("status", "learning");

      return {
        level,
        total: total || 0,
        mastered: mastered || 0,
        learning: learning || 0,
        new: (total || 0) - ((mastered || 0) + (learning || 0)),
      };
    }),
  );

  return stats;
}

export async function getFilteredVocabulary(
  level: number,
  status: "new" | "learning" | "mastered",
  page: number = 1,
  limit: number = 25,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], total: 0 };

  if (status === "new") {
    // Fetch all vocab IDs for this level
    const { data: allVocab } = await supabase
      .from("vocabulary")
      .select("id")
      .eq("hsk_level", level);

    if (!allVocab) return { data: [], total: 0 };

    // Fetch user's learning/mastered vocab IDs
    const { data: userVocab } = await supabase
      .from("user_vocabulary")
      .select("vocab_id")
      .eq("user_id", user.id)
      .in("status", ["learning", "mastered"]);

    const startedIds = new Set(userVocab?.map((uv) => uv.vocab_id) || []);

    // Filter for IDs that are NOT in startedIds
    const newVocabIds = allVocab
      .filter((v) => !startedIds.has(v.id))
      .map((v) => v.id);

    const total = newVocabIds.length;

    // Pagination slice
    const from = (page - 1) * limit;
    const to = from + limit;
    const pagedIds = newVocabIds.slice(from, to);

    if (pagedIds.length === 0) return { data: [], total };

    const { data: details } = await supabase
      .from("vocabulary")
      .select(
        `
        *,
        user_vocabulary (
          status,
          mastery_score
        )
       `,
      )
      .in("id", pagedIds);

    const transformed =
      details?.map((item) => ({
        ...item,
        user_progress: item.user_vocabulary?.[0] || null,
      })) || [];

    return { data: transformed, total };
  } else {
    // learning or mastered
    // First get total count
    const { count } = await supabase
      .from("vocabulary")
      .select("*, user_vocabulary!inner(*)", { count: "exact", head: true })
      .eq("hsk_level", level)
      .eq("user_vocabulary.user_id", user.id)
      .eq("user_vocabulary.status", status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data } = await supabase
      .from("vocabulary")
      .select(
        `
        *,
        user_vocabulary!inner (
          status,
          mastery_score
        )
       `,
      )
      .eq("hsk_level", level)
      .eq("user_vocabulary.user_id", user.id)
      .eq("user_vocabulary.status", status)
      .range(from, to);

    const transformed =
      data?.map((item) => ({
        ...item,
        user_progress: item.user_vocabulary?.[0] || null,
      })) || [];

    return { data: transformed, total: count || 0 };
  }
}

export async function updateVocabStatus(
  vocabId: string,
  status: "new" | "learning" | "mastered",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("user_vocabulary").upsert(
    {
      user_id: user.id,
      vocab_id: vocabId,
      status: status,
      last_reviewed: new Date().toISOString(),
    },
    {
      onConflict: "user_id,vocab_id",
    },
  );

  if (error) throw error;

  revalidatePath("/learn");
  return { status };
}
