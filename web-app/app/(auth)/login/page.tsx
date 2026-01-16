"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { LoginForm } from "./login-form";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(false);
      console.error("Google Login Error:", error);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(false);
      console.error("Facebook Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row overflow-hidden relative font-display text-text-main bg-background-light dark:bg-background-dark ink-texture">
      {/* Left Side: Illustration Zone */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-1/2 relative bg-[#fdfaf0] dark:bg-[#1a1c23] flex-col justify-between overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#a19345] blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#d4c575] blur-[100px]"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-12 justify-center items-center text-center">
          <div className="relative w-full max-w-[500px] aspect-[4/5] mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC55-ZXRAg2VdNMgdN-wBv7IlegNROv-6tY4njfuBSlVNStLpw8EGG5tyPdgE2tBD4yayJ0K-QRo0T1JERiKyrArBlt7OxyaiZh7EcIrtYIE3MLdRb8GaheF8I2odfLFUg_0pwkczPooWln9d_bh4vQbbn1DO85wHh8y7A06Ia5ZCYeDZ3Fl7NohHOhShF115GkX7j-mI7yNTHKm4REWRseq6Eg9kmtnVdTdMODYnoYZrLAX_bziupZyIy_ljb9CzjZBxkpCfB99KI')" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-0 right-0 text-white px-6">
              <h2 className="text-3xl font-bold mb-2 tracking-tight">学无止境</h2>
              <p className="text-white/90 text-lg font-light">"Học tập không có điểm dừng"</p>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-3xl font-bold text-[#1d1a0c] dark:text-white">Chào mừng Đại hiệp trở lại!</h1>
            <p className="text-[#636054] dark:text-gray-400 text-lg">Tiếp tục hành trình tu luyện HSK mỗi ngày để đạt cảnh giới cao nhất.</p>
          </div>
        </div>

        {/* Decorative pattern bottom */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">

        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden">
          <div className="flex items-center gap-2 text-[#1d1a0c] dark:text-white">
            <span className="text-3xl text-primary font-bold">HSK</span>
            <span className="font-bold text-xl">Smart Test</span>
          </div>
        </div>

        <div className="w-full max-w-[420px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card p-8 lg:p-10 border border-white/50 dark:border-white/5 backdrop-blur-sm">
          {/* Form Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-xl mb-4 text-primary dark:text-yellow-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">Đăng nhập</h2>
            <p className="text-text-secondary dark:text-gray-400 text-sm">Điền thông tin để truy cập kho báu kiến thức</p>
          </div>

          {/* Login Form Client Component */}
          <Suspense fallback={<div className="text-center py-4">Đang tải...</div>}>
            <LoginForm />
          </Suspense>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-light dark:bg-surface-dark text-gray-500 dark:text-gray-400">Hoặc đăng nhập với</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="social" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Google
            </Button>
            <Button variant="social" onClick={handleFacebookLogin} disabled={loading}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Chưa có tài khoản?
              <Link href="/register" className="font-bold text-primary dark:text-yellow-400 hover:text-primary/80 ml-1 underline decoration-primary/50 decoration-2 underline-offset-2 transition-colors">Đăng ký ngay</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400 dark:text-gray-600 text-center">
          © 2024 HSK Smart Test. Bản quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}
