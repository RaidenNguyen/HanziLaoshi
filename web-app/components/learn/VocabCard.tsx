"use client"

import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface VocabCardProps {
  vocab: any
}

export function VocabCard({ vocab }: VocabCardProps) {
  const playAudio = () => {
    if (!vocab.audio_url) {
      toast.error("Không có link audio")
      return
    }

    // Use proxy for external URLs to bypass CORS (especially Google TTS)
    const isExternal = vocab.audio_url.startsWith("http")
    const src = isExternal
      ? `/api/proxy-audio?url=${encodeURIComponent(vocab.audio_url)}`
      : vocab.audio_url

    const audio = new Audio(src)
    audio.play().catch(err => {
      console.error("Audio playback error:", err)
      toast.error("Lỗi phát âm. Vui lòng kiểm tra console (F12).")
    })
  }

  return (
    <div className={cn(
      "relative group bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center h-[200px] sm:h-[260px] cursor-default"
    )}>
      {/* Content */}
      <div className="space-y-2 mt-2">
        <h3 className="text-3xl sm:text-4xl font-black text-gray-800 mb-1">{vocab.hanzi}</h3>
        <p className="text-base sm:text-lg font-medium text-[#ff6933] font-mono">{vocab.pinyin}</p>
        <p className="text-gray-600 line-clamp-2 px-2 text-sm">{vocab.meaning}</p>
      </div>

      {/* Audio Action */}
      <Button
        variant="ghost"
        size="icon"
        className="mt-4 sm:mt-6 rounded-full hover:bg-orange-50 hover:text-[#ff6933] text-gray-400 cursor-pointer active:scale-90 transition-transform"
        onClick={playAudio}
      >
        <Volume2 className="w-5 h-5" />
      </Button>
    </div>
  )
}
