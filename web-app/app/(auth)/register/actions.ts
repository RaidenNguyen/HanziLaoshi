"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  console.log("=== SIGNUP ACTION STARTED ===");

  const supabase = await createClient();
  console.log("Supabase client created");

  // Validating and parsing headers safely
  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";
  console.log("Origin:", origin);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const hskGoalStr = formData.get("hskGoal") as string;

  console.log("Form data received:", {
    email,
    fullName,
    hskGoalStr,
    hasPassword: !!password,
  });

  // Safe parsing: extract number from "hsk1", "hsk2", etc. or use raw number
  let hskLevel = 1;
  if (hskGoalStr) {
    const match = hskGoalStr.match(/\d+/);
    if (match) {
      hskLevel = parseInt(match[0], 10);
    }
  }
  console.log("Parsed HSK level:", hskLevel);

  console.log("Calling supabase.auth.signUp...");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        hsk_level: hskLevel,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  console.log("SignUp response - data:", JSON.stringify(data, null, 2));
  console.log(
    "SignUp response - error:",
    error ? JSON.stringify(error, null, 2) : "null"
  );

  if (error) {
    console.error("Supabase SignUp Error:", error);
    // For debugging: include the actual Supabase error message
    let errorMessage = `Lỗi: ${error.message} (Code: ${
      error.status || "unknown"
    })`;

    if (error.message.includes("User already registered")) {
      errorMessage = "Email này đã được đăng ký. Vui lòng đăng nhập.";
    } else if (error.message.includes("Password should be at least")) {
      errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.";
    } else if (error.status === 429) {
      errorMessage = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
    }

    console.log("Redirecting to register with error:", errorMessage);
    redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
  }

  console.log("=== SIGNUP SUCCESSFUL, REDIRECTING TO LOGIN ===");
  revalidatePath("/", "layout");
  const successMessage =
    "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.";
  redirect(`/login?message=${encodeURIComponent(successMessage)}`);
}
