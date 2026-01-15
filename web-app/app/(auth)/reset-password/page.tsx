import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="font-display bg-[#fff7e0] dark:bg-background-dark text-charcoal dark:text-gray-100 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#ff6933]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#66B0B0]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] shadow-2xl shadow-[#ff6933]/5 p-8 relative z-10 border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#2E333D] dark:text-white mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {params?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {params.error}
          </div>
        )}

        <ResetPasswordForm />

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
