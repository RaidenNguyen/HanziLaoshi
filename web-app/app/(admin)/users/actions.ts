"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  current_hsk_level: number;
}

export async function getUsers() {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Check if the current user is an admin
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !currentUserProfile ||
    currentUserProfile.role !== "admin"
  ) {
    return { error: "Permission denied" };
  }

  // Use admin client to fetch all profiles (bypass RLS)
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }

  return { success: true, data: profiles as UserProfile[] };
}

export async function updateUserRole(
  userId: string,
  newRole: "user" | "admin",
) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return { error: "Permission denied" };
  }

  // Use admin client to bypass RLS
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Error updating role:", error);
    return { error: "Failed to update role" };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return { error: "Permission denied" };
  }

  // Cannot delete yourself
  if (userId === user.id) {
    return { error: "Không thể xóa chính mình" };
  }

  // Use admin client to delete auth user (cascades to profiles)
  const { createAdminClient } = await import("@/utils/supabase/admin");
  const admin = createAdminClient();

  // Delete user_vocabulary first
  await admin.from("user_vocabulary").delete().eq("user_id", userId);

  // Delete profile
  await admin.from("profiles").delete().eq("id", userId);

  // Delete from auth.users
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { error: "Xóa thất bại: " + error.message };
  }

  revalidatePath("/users");
  return { success: true };
}
