
"use client"

import { useState, useTransition, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { signup } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Mail, Lock, Flag, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      toast.error(error)
    }
  }, [searchParams])

  // Validate passwords match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp!")
    } else {
      setPasswordError("")
    }
  }, [password, confirmPassword])


  const handleSubmit = (formData: FormData) => {
    const formPassword = formData.get("password") as string
    const formConfirmPassword = formData.get("confirmPassword") as string

    if (!termsAccepted) {
      toast.warning("Vui lòng đồng ý với điều khoản sử dụng!")
      return
    }

    if (formPassword !== formConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!")
      return
    }

    if (!formPassword || formPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    startTransition(async () => {
      try {
        await signup(formData)
      } catch (e: unknown) {
        // Log the full error for debugging
        console.error("Registration catch block - Full error:", e)
        console.error("Error type:", typeof e)
        if (e && typeof e === 'object') {
          console.error("Error keys:", Object.keys(e as object))
          console.error("Has digest:", 'digest' in e)
          if ('digest' in e) {
            console.error("Digest value:", (e as { digest?: string }).digest)
          }
        }

        // IMPORTANT: Next.js redirect() throws an error with digest starting with "NEXT_REDIRECT"
        // We must rethrow this error to allow the redirect to work
        if (e && typeof e === 'object' && 'digest' in e) {
          const digest = (e as { digest?: string }).digest
          if (digest?.startsWith('NEXT_REDIRECT')) {
            throw e
          }
        }
        console.error("Error NOT a redirect, showing toast")
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.")
      }
    })
  }


  return (
    <form action={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200" htmlFor="fullName">Họ và tên hiệp khách</label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A"
          icon={<User className="w-5 h-5" />}
          required
          className="py-3 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200" htmlFor="email">Thư tín điện tử (Email)</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="w-5 h-5" />}
          required
          className="py-3 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200" htmlFor="password">Mật khẩu bảo vệ</label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          required
          className="py-3 text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={<ShieldCheck className="w-5 h-5" />}
          required
          className={`py-3 text-base ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-xs text-red-500 font-medium mt-1">{passwordError}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200" htmlFor="hskGoal">Mục tiêu tu luyện</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Flag className="w-5 h-5" />
          </div>
          <select
            name="hskGoal"
            id="hskGoal"
            className="block w-full pl-10 pr-10 py-3 border border-border-color dark:border-gray-700 rounded-xl bg-[#fcfbf8] dark:bg-[#16181d] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6933]/50 focus:border-[#ff6933] transition-all shadow-sm appearance-none cursor-pointer text-base"
            defaultValue=""
          >
            <option value="" disabled>Chọn cấp độ HSK</option>
            <option value="1">HSK 1 - Sơ nhập giang hồ</option>
            <option value="2">HSK 2 - Tiểu thành tựu</option>
            <option value="3">HSK 3 - Trung cấp kỳ tài</option>
            <option value="4">HSK 4 - Đăng đường nhập thất</option>
            <option value="5">HSK 5 - Cao thủ võ lâm</option>
            <option value="6">HSK 6 - Độc cô cầu bại</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-2 pt-2">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-[#ff6933] focus:ring-[#ff6933] cursor-pointer"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
        </div>
        <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
          Tôi đồng ý với <a href="#" className="font-medium text-[#ff6933] hover:underline">Điều khoản sử dụng</a> và <a href="#" className="font-medium text-[#ff6933] hover:underline">Chính sách bảo mật</a> của môn phái.
        </label>
      </div>

      <Button
        type="submit"
        disabled={!termsAccepted || isPending}
        isLoading={isPending}
        className="w-full bg-gradient-to-r from-[#ff6933] to-[#ff8c5a] hover:from-[#e55022] hover:to-[#e56b3e] text-white shadow-lg shadow-[#ff6933]/30 py-3.5 h-auto text-lg mt-2"
      >
        Đăng ký ngay <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Đã là đại hiệp?
          <a href="/login" className="font-bold text-[#ff6933] hover:text-[#e55022] ml-1 transition-colors">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </form>
  )
}
