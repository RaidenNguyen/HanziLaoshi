"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, email, current_hsk_level, role, created_at",
    )
    .eq("id", user.id)
    .single();

  return profile;
}

export async function updateProfile(formData: {
  full_name: string;
  current_hsk_level: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.full_name,
      current_hsk_level: formData.current_hsk_level,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Also update auth metadata so UserNav reflects changes immediately
  await supabase.auth.updateUser({
    data: { full_name: formData.full_name },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}

export async function uploadAvatar(base64: string, fileName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Use admin client to bypass Storage RLS
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();

  // Detect content type from base64 data URI
  const mimeMatch = base64.match(/^data:(image\/[\w+]+);base64,/);
  const contentType = mimeMatch ? mimeMatch[1] : "image/png";
  const ext = contentType.split("/")[1];

  // Convert base64 to buffer
  const base64Data = base64.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  const filePath = `${user.id}/${Date.now()}.${ext}`;

  // Upload via admin client (bypasses RLS)
  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError);
    return { error: uploadError.message };
  }

  const { data: urlData } = admin.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Update profile with new avatar URL (via admin to bypass profiles RLS)
  const { error: updateError } = await admin
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return { error: updateError.message };
  }

  // Update auth metadata
  await supabase.auth.updateUser({
    data: { avatar_url: urlData.publicUrl },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true, url: urlData.publicUrl };
}
