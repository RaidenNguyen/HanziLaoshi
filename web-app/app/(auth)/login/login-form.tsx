
"use client"

import { useTransition, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { login } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Lock, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const toastShownRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    // Prevent duplicate toasts in Strict Mode
    if (toastShownRef.current) return

    const error = searchParams.get("error")
    const message = searchParams.get("message")

    if (error) {
      toastShownRef.current = true
      toast.error(decodeURIComponent(error))
      // Delay clearing params to ensure toast displays
      setTimeout(() => {
        router.replace('/login', { scroll: false })
      }, 100)
    } else if (message) {
      toastShownRef.current = true
      toast.success(decodeURIComponent(message))
      // Delay clearing params to ensure toast displays
      setTimeout(() => {
        router.replace('/login', { scroll: false })
      }, 100)
    }
  }, [searchParams, router])

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await login(formData)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-main dark:text-gray-200" htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ví dụ: hocvien@hsk.com"
          icon={<User className="w-5 h-5" />}
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <label className="block text-sm font-medium text-text-main dark:text-gray-200" htmlFor="password">Mật khẩu</label>
        </div>
        <div className="relative group">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5" />}
            required
          />
          <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" name="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span className="text-text-secondary dark:text-gray-400 group-hover:text-text-main transition-colors">Ghi nhớ tôi</span>
        </label>
        <Link href="/forgot-password" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">Quên mật khẩu?</Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        isLoading={isPending}
        disabled={isPending}
      >
        Đăng nhập <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </form>
  )
}
