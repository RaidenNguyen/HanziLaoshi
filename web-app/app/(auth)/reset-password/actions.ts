"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Mật khẩu không khớp")}`
    );
  }

  if (password.length < 6) {
    redirect(
      `/reset-password?error=${encodeURIComponent(
        "Mật khẩu phải có ít nhất 6 ký tự"
      )}`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Đặt lại mật khẩu thành công. Vui lòng đăng nhập."
    )}`
  );
}
