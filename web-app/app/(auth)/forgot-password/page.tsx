import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="font-display bg-[#fff7e0] dark:bg-background-dark text-charcoal dark:text-gray-100 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements - Reused from Login/Register */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#ff6933]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#66B0B0]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] shadow-2xl shadow-[#ff6933]/5 p-8 relative z-10 border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#2E333D] dark:text-white mb-2">
            Quên mật khẩu?
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục.
          </p>
        </div>

        {params?.message && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
            {params.message}
          </div>
        )}

        {params?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
            {params.error}
          </div>
        )}

        <ForgotPasswordForm />

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Trở về đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
