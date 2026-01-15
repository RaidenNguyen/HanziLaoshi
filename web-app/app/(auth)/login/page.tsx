
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function LoginPage() {
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
            <Button variant="social">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuvFZOSnLCsWOHWQJLxAF5Q9royChx8o-9do6pItccMkc13D_O2gJLhUG0XmCtes51Dk9xaQSwu-c91GXkS-S_1S1m7L5deACbY9ElTTiDVy1QQuWAorpTEmYfh9y-kBD3CT1Vqb-P5tdm0o2ZcomoATwjfm3_3TJmVJwYif56AkbT4xxP1EKG5kHdlC_fZB2W9uXYe_57pZoPLtlzGPngcwYPSvjpUYtBVRCpyCN-4QSAhhTIEAGasJ5acgSMJPxOwuB5QvuuGlg" alt="Google" className="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button variant="social">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyjDuUkJdgE3hFriTjBCMUhQN1-Jq9B09yDdfv43pC45cUOhM1c6BPu7nqgf4UDbYA_FNI-C_TkLQqhQnnoBwvQ_cN-V8wCRjK9VB2CNNvI_Nvr-vEvwqSd1x28EzW9aFtfOkaW8-AYuGrqhRD-JMDIIIXIGlf1cXekn2FfedX-Ptxvq161WBQQXlAD_Gb7O8cxddcb-pqGHWolzNg1hE1w6Bz0YSAbAJUGB4xBbPiriuVmL32XtSD_uzvo1iSkTTAsL4DNjiEbOQ" alt="Facebook" className="h-5 w-5 mr-2" />
              Facebook
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Chưa có tài khoản?
              <Link href="/register" className="font-bold text-text-main hover:text-primary ml-1 underline decoration-primary/50 decoration-2 underline-offset-2 transition-colors">Đăng ký ngay</Link>
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
