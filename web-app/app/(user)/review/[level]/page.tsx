"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Swords, Volume2, FastForward, Sparkles } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { createClient } from "@/utils/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ITEMS_PER_PAGE = 25

export default function BattleModePage() {
  const params = useParams()
  const router = useRouter()
  const level = params.level as string



  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState<any[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalWords, setTotalWords] = useState(0)

  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "victory">("playing")
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null)

  const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, type: 'good' | 'bad', x: number, y: number }[]>([])
  const floatIdCounter = useRef(0)
  const isProcessing = useRef(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when word changes
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [currentWordIndex])

  // Fetch Total Count on Mount
  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient()
      let query = supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })

      if (level === '7-9') {
        query = query.in('hsk_level', [7, 8, 9])
      } else {
        query = query.eq('hsk_level', parseInt(level))
      }

      const { count } = await query

      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
        setTotalWords(count)
      }
    }
    fetchCount()
  }, [level])

  // Fetch Words when Page or Level changes
  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true)
      const supabase = createClient()
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('vocabulary')
        .select('*')

      if (level === '7-9') {
        query = query.in('hsk_level', [7, 8, 9])
      } else {
        query = query.eq('hsk_level', parseInt(level))
      }

      const { data, error } = await query
        .order('id', { ascending: true })
        .range(from, to)

      if (error) {
        console.error("Error fetching words:", error)
      }

      if (data && data.length > 0) {
        setWords(data)
      } else {
        setWords([])
      }
      setLoading(false)
      setCurrentWordIndex(0) // Reset index on new page
      setGameState("playing") // Reset game state
      inputRef.current?.focus()
    }
    fetchWords()
  }, [level, page])

  const spawnFloatText = (text: string, type: 'good' | 'bad') => {
    const id = floatIdCounter.current++
    setFloatingTexts(prev => [...prev, { id, text, type, x: Math.random() * 40 - 20, y: Math.random() * 20 - 10 }])
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id))
    }, 1000)
  }

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
  }

  const handleSkip = () => {
    if (isProcessing.current) return
    if (currentWordIndex >= words.length) return

    isProcessing.current = true
    setFeedback("miss")
    setStreak(0)
    spawnFloatText("BỎ QUA", 'bad')

    setTimeout(() => {
      setFeedback(null)
      setInput("")
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1)
        isProcessing.current = false
      } else {
        setGameState("victory")
        // Keep locked
      }
    }, 400)
  }

  const handleAttack = () => {
    if (isProcessing.current) return
    if (!input.trim()) return
    if (currentWordIndex >= words.length) return

    const currentWord = words[currentWordIndex]

    // Check answer case-insensitive
    if (input.trim().toLowerCase() === currentWord.hanzi.toLowerCase()) {
      isProcessing.current = true
      setFeedback("hit")
      const points = 100 + (streak * 10)
      setScore(prev => prev + points)
      setStreak(prev => prev + 1)
      spawnFloatText("CHÍNH XÁC!", 'good')

      handleSpeak(currentWord.hanzi)

      setTimeout(() => {
        setFeedback(null)
        setInput("")
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1)
          isProcessing.current = false
        } else {
          setGameState("victory")
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        }
      }, 600)
    } else {
      isProcessing.current = true
      setFeedback("miss")
      setStreak(0)
      spawnFloatText("CỐ GẮNG LÊN!", 'bad')
      setTimeout(() => {
        setFeedback(null)
        isProcessing.current = false
      }, 600)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAttack()
    } else if (e.code === "Space" && e.ctrlKey) {
      e.preventDefault()
      const currentWord = words[currentWordIndex]
      if (currentWord?.hanzi) {
        handleSpeak(currentWord.hanzi)
      }
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center text-[#ffc629] font-bold animate-pulse">Đang tải dữ liệu...</div>

  const currentWord = words[currentWordIndex] || {}

  return (
    <div className="min-h-screen bg-[#fcfbf8] font-display flex flex-col">

      {/* Navigation Header */}
      <div className="w-full bg-white border-b border-[#f0ebe0] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/review" className="flex items-center gap-2 text-[#1d180c] font-black hover:text-[#e7564a] transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#f4f0e6] rounded-full text-[#6b5c35] text-xs font-bold uppercase tracking-wider">
            <span>Tổng Hán Tự:</span>
            <span className="text-[#1d180c] text-sm">{totalWords}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1d180c]">Trang:</span>
            <Select
              value={page.toString()}
              onValueChange={(val) => setPage(parseInt(val))}
            >
              <SelectTrigger className="w-[80px] h-9 bg-[#1d180c] text-white border-none font-bold rounded-lg focus:ring-0">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#f0ebe0]">
                {[...Array(totalPages)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-medium cursor-pointer focus:bg-[#f4f0e6]">
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-[#f4f4f5] px-3 py-1.5 rounded-lg text-sm font-black text-[#1d180c]">
            <span>{currentWordIndex + 1}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span>{words.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-6 relative">

        {/* Floating Combat Text Container */}
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <AnimatePresence>
            {floatingTexts.map(ft => (
              <motion.div
                key={ft.id}
                initial={{ opacity: 0, y: 20, scale: 0.5, x: ft.x }}
                animate={{ opacity: 1, y: -100, scale: 1.2 }}
                exit={{ opacity: 0, y: -120 }}
                className={`absolute font-black text-2xl whitespace-nowrap px-4 py-2 rounded-xl backdrop-blur-sm shadow-xl border-2
                            ${ft.type === 'good'
                    ? 'bg-[#fffcf0] border-[#ffc629] text-[#1d180c]'
                    : 'bg-[#fff5f5] border-[#e7564a] text-[#c02e2e]'}`}
              >
                {ft.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Battle Header */}
        <div className="w-full max-w-5xl mb-2 sm:mb-8 px-1">
          {/* Mobile: Compact Single Row */}
          <div className="flex md:hidden items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded-lg text-green-700">
                <Swords className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-[#1d180c]">HSK {level}</span>
            </div>

            <div className="flex-1 max-w-[50%] flex flex-col items-end gap-1">
              <div className="h-2 w-full bg-[#f4f0e6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#ffc629]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#9c9278]">{Math.min(currentWordIndex + 1, words.length)}/{words.length}</span>
            </div>
          </div>

          {/* Desktop: Full Header */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 text-[#047857] font-bold text-sm tracking-widest uppercase mb-1">
              <Swords className="w-4 h-4" />
              <span>Chế độ chiến đấu</span>
            </div>

            <h1 className="text-4xl font-black text-[#1d180c] mb-6">
              Cấp độ: HSK {level}
            </h1>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#9c9278] uppercase tracking-wide">
                <span>Tiến độ trận đấu</span>
                <span className="text-[#ffc629]">{Math.min(currentWordIndex + 1, words.length)}/{words.length} kẻ địch</span>
              </div>
              <div className="h-3 w-full bg-[#f4f0e6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#ffc629]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-[#f0ebe0] overflow-hidden flex flex-col md:flex-row md:min-h-[500px]">

          {/* Left Side: Interaction */}
          <div className="flex-1 p-4 sm:p-12 flex flex-col items-center justify-center relative bg-white">

            {/* Audio Button - Absolute Top Left */}
            <button
              onClick={() => handleSpeak(currentWord.hanzi)}
              className="absolute top-3 left-3 sm:top-6 sm:left-6 p-2 sm:p-3 rounded-full bg-[#f4f0e6] text-[#6b5c35] hover:bg-[#ffc629] hover:text-[#1d180c] transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="w-full max-w-md flex flex-col items-center gap-2 sm:gap-8">

              <div className="text-center space-y-2 sm:space-y-4 pt-2 sm:pt-4">
                <span className="text-[10px] sm:text-xs font-bold text-[#9c9278] tracking-widest uppercase">Dịch sang Hán tự</span>
                <h2 className="text-3xl sm:text-5xl font-black text-[#1d180c] leading-tight mb-1 sm:mb-2">
                  {currentWord.meaning}
                </h2>
                <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-[#ecfdf5] text-[#047857] font-mono font-bold text-lg sm:text-xl border border-[#d1fae5]">
                  {currentWord.pinyin}
                </div>
              </div>

              <div className="w-full relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập Hán tự..."
                  className={`w-full bg-[#fcfbf8] border-2 outline-none text-xl sm:text-3xl font-bold text-center text-[#1d180c] placeholder:text-gray-300 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-serif transition-colors shadow-inner
                                ${feedback === 'miss' ? 'border-red-400 bg-red-50' : 'border-[#e5e0d0] focus:border-[#ffc629]'}`}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <span className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌨</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="px-6 py-4 rounded-xl border border-[#f0ebe0] bg-white text-[#6b5c35] hover:bg-[#f4f0e6] font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Bỏ qua</span>
                </button>

                {/* Attack Button */}
                <button
                  onClick={handleAttack}
                  className="flex-1 py-4 rounded-xl bg-[#ffc629] hover:bg-[#ffcf4d] text-[#1d180c] font-black text-base shadow-lg shadow-orange-200 transition-transform active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>TẤN CÔNG</span>
                  <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="text-xs text-[#9c9278] flex gap-4 mt-2">
                <span>[Enter] Kiểm tra</span>
                <span>[Ctrl + Space] Nghe lại</span>
              </div>

            </div>
          </div>

          {/* Right Side: Visual */}
          <div className="hidden md:flex flex-1 bg-[#fffcf0] relative overflow-hidden items-center justify-center border-l border-[#f0ebe0] min-h-[300px]">
            {/* Decoration Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-12 right-12 bg-white px-4 py-3 rounded-2xl rounded-tr-none shadow-lg border border-[#f0ebe0] z-10 max-w-[150px]"
            >
              <p className="text-xs font-bold text-[#6b5c35] italic leading-relaxed text-center">
                "Chuẩn bị nghênh chiến!"
              </p>
            </motion.div>

            {/* Character */}
            <div className="w-[80%] h-[80%] relative z-0">
              <motion.img
                key={currentWordIndex} // Re-animate on new word
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                src="/hero-cat.png"
                className="w-full h-full object-contain drop-shadow-2xl"
                alt="Opponent"
              />
            </div>
          </div>

        </div>

      </main>

      {/* Game Over / Victory Overlay */}
      <AnimatePresence>
        {gameState === "victory" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-[#1d180c]/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#fcfbf8] p-8 rounded-[32px] max-w-sm w-full text-center border-4 border-[#ffc629] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-[#ffc629]"></div>

              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-[#ffc629] rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-[#1d180c] fill-current" />
                </div>
              </div>

              <h1 className="text-4xl font-black mb-2 text-[#1d180c]">
                ĐẠI THẮNG!
              </h1>

              <p className="text-[#6b5c35] font-bold mb-6">
                Bạn đã hoàn thành trang {page} / {totalPages}!
              </p>

              <div className="bg-[#f4f0e6] rounded-xl p-4 mb-8">
                <span className="text-xs text-[#9c9278] uppercase font-bold tracking-widest block mb-1">Tổng Điểm</span>
                <span className="text-4xl font-black text-[#1d180c]">{score.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                {page < totalPages ? (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-3.5 rounded-xl bg-[#1d180c] text-[#ffc629] font-bold hover:bg-[#332c1f] shadow-lg transition-transform active:scale-95"
                  >
                    Trang Kế Tiếp <span className="ml-2">→</span>
                  </button>
                ) : (
                  <Link href="/review" className="block w-full py-3.5 rounded-xl bg-[#1d180c] text-[#ffc629] font-bold hover:bg-[#332c1f] shadow-lg transition-transform active:scale-95">
                    Hoàn Thành Khóa Luyện
                  </Link>
                )}

                <button onClick={() => window.location.reload()} className="w-full py-3.5 rounded-xl border-2 border-[#e5e0d0] text-[#6b5c35] font-bold hover:bg-[#f4f0e6] transition-colors">
                  Luyện Tập Lại
                </button>

                <button
                  onClick={() => setGameState("playing")}
                  className="w-full py-3.5 rounded-xl border-2 border-[#e5e0d0] text-[#6b5c35] font-bold hover:bg-[#f4f0e6] transition-colors"
                >
                  Đóng popup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Stats - Sticky Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-transparent pointer-events-none flex justify-center pb-8">
        <div className="flex gap-8 bg-white/80 backdrop-blur-md px-8 py-3 rounded-2xl border border-[#f0ebe0] shadow-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
              <span className="font-bold">🔥</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9c9278] font-bold uppercase">Chuỗi thắng</span>
              <span className="text-lg font-black text-[#1d180c] leading-none">{streak}</span>
            </div>
          </div>
          <div className="w-px h-full bg-[#f0ebe0]"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
              <span className="font-bold">⭐</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9c9278] font-bold uppercase">Điểm số</span>
              <span className="text-lg font-black text-[#1d180c] leading-none">{score}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
