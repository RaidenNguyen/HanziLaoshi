"use client"

import { useTransition, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, CheckCircle2 } from "lucide-react"
import { resetPassword } from "./actions"
import { toast } from "sonner"

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Client-side validation for immediate feedback
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp!")
    } else {
      setPasswordError("")
    }
  }, [password, confirmPassword])

  const handleSubmit = (formData: FormData) => {
    // Basic client validation before server action
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    startTransition(async () => {
      await resetPassword(formData)
    })
  }

  return (
    <form className="space-y-5" action={handleSubmit}>
      <div className="space-y-1.5">
        <label
          className="block text-sm font-bold text-gray-700 dark:text-gray-200"
          htmlFor="password"
        >
          Mật khẩu mới
        </label>
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
        <label
          className="block text-sm font-bold text-gray-700 dark:text-gray-200"
          htmlFor="confirmPassword"
        >
          Xác nhận mật khẩu
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={<CheckCircle2 className="w-5 h-5" />}
          required
          className={`py-3 text-base ${passwordError ? 'border-red-500 focus:ring-red-500' : ''}`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-xs text-red-500 font-medium mt-1">{passwordError}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !!passwordError}
        isLoading={isPending}
        className="w-full bg-gradient-to-r from-[#ff6933] to-[#ff8c5a] hover:from-[#e55022] hover:to-[#e56b3e] text-white shadow-lg shadow-[#ff6933]/30 py-3.5 h-auto text-lg mt-2"
      >
        Xác nhận thay đổi
      </Button>
    </form>
  )
}
