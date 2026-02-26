"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllVocabulary(levels: number[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch all vocabulary for the given levels
  const { data, error } = await supabase
    .from("vocabulary")
    .select("id, hanzi, pinyin, meaning, hsk_level")
    .in("hsk_level", levels)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Shuffle using Fisher-Yates
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
