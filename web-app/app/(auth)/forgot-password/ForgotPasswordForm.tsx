"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight } from "lucide-react"
import { forgotPassword } from "./actions"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await forgotPassword(formData)
    })
  }

  return (
    <form className="space-y-6" action={handleSubmit}>
      <div className="space-y-1.5">
        <label
          className="block text-sm font-bold text-gray-700 dark:text-gray-200"
          htmlFor="email"
        >
          Email đăng ký
        </label>
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

      <Button
        type="submit"
        disabled={isPending}
        isLoading={isPending}
        className="w-full bg-gradient-to-r from-[#ff6933] to-[#ff8c5a] hover:from-[#e55022] hover:to-[#e56b3e] text-white shadow-lg shadow-[#ff6933]/30 py-3.5 h-auto text-lg"
      >
        Gửi yêu cầu <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </form>
  )
}
