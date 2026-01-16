"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { ChevronRight, ChevronLeft, RotateCcw, Check, X, Volume2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { updateVocabStatus } from "@/app/(user)/learn/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface FlashcardClientProps {
  vocabulary: any[]
  hskLevel: number
  currentPage: number
  totalPages: number
  totalItems: number
}

interface FlashcardItemProps {
  card: any
  direction: number
  onNext: () => void
  onPrev: () => void
  playAudio: (e: React.MouseEvent, url: string) => void
}

function FlashcardItem({ card, direction, onNext, onPrev, playAudio }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x < -swipeThreshold) {
      onNext()
    } else if (info.offset.x > swipeThreshold) {
      onPrev()
    }
  }

  return (
    <motion.div
      custom={direction}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
      initial={{ x: direction === 1 ? 300 : -300, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: direction === 1 ? -300 : 300, opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      className="w-full h-full cursor-pointer active:cursor-grabbing group absolute top-0 left-0"
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-full h-full relative"
        onClick={() => {
          if (Math.abs(x.get()) < 10) setIsFlipped(!isFlipped)
        }}
      >
        {/* Front - only visible when NOT flipped */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#ff9966] to-[#ff5e62] rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-4 border-white/20 flex flex-col items-center justify-center p-4 md:p-8 hover:shadow-2xl transition-shadow overflow-hidden"
          initial={false}
          animate={{
            opacity: isFlipped ? 0 : 1,
            scale: isFlipped ? 0.95 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            pointerEvents: isFlipped ? 'none' : 'auto',
            zIndex: isFlipped ? 1 : 2,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

          <span className="text-xs md:text-base font-black text-white/80 uppercase tracking-[0.2em] mb-4 md:mb-12 z-10">Mặt trước</span>
          <h2 className="text-7xl md:text-[9rem] font-black text-white mb-6 md:mb-10 leading-none drop-shadow-md z-10">{card.hanzi}</h2>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 text-white hover:bg-white/30 hover:scale-110 active:scale-90 transition-all duration-200 w-12 h-12 md:w-16 md:h-16 z-20 backdrop-blur-sm cursor-pointer"
            onClick={(e) => playAudio(e, card.audio_url)}
          >
            <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          <p className="absolute bottom-4 md:bottom-8 text-xs md:text-base font-black text-white/90 animate-pulse z-10">Chạm để lật</p>

          {/* Teacher Cat Image */}
          <img
            src="/teacher-cat.png"
            alt="Teacher Cat"
            className="absolute -bottom-6 -right-6 w-24 h-24 md:-bottom-10 md:-right-10 md:w-48 md:h-48 object-contain mix-blend-multiply opacity-90 z-0 pointer-events-none transform -rotate-12"
          />
        </motion.div>

        {/* Back - only visible when flipped */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#fffbf5] to-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-2 border-orange-200 flex flex-col items-center justify-center p-3 md:p-8 overflow-y-auto"
          initial={false}
          animate={{
            opacity: isFlipped ? 1 : 0,
            scale: isFlipped ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
          style={{
            pointerEvents: isFlipped ? 'auto' : 'none',
            zIndex: isFlipped ? 2 : 1,
          }}
        >
          <div className="w-full flex flex-col items-center pt-0 md:pt-2">
            <div className="flex items-center gap-3 md:gap-6 mb-2 md:mb-4">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900">{card.hanzi}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-orange-100 text-[#ff6933] hover:bg-orange-200 active:scale-90 transition-transform w-8 h-8 md:w-12 md:h-12 cursor-pointer"
                onClick={(e) => playAudio(e, card.audio_url)}
              >
                <Volume2 className="w-4 h-4 md:w-6 md:h-6" />
              </Button>
            </div>

            <p className="text-2xl md:text-4xl font-black text-[#ff6933] font-mono mb-2 md:mb-6 tracking-wide">{card.pinyin}</p>

            <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl border-2 border-orange-100 w-full mb-3 md:mb-6 shadow-sm">
              <p className="text-lg md:text-2xl text-gray-800 text-center font-bold leading-snug">
                {card.meaning}
              </p>
            </div>

            {card.example && (
              <div className="w-full bg-orange-50/80 p-3 md:p-5 rounded-xl md:rounded-2xl border border-orange-200 text-left space-y-1 md:space-y-3">
                <p className="text-[10px] md:text-xs font-black text-orange-600 uppercase tracking-wider">Ví dụ:</p>
                <p className="text-sm md:text-xl text-gray-900 font-bold leading-relaxed">{card.example}</p>
                <p className="text-xs md:text-lg text-gray-600 font-semibold italic">{card.example_pinyin}</p>
                <p className="text-xs md:text-lg text-gray-700 font-semibold">{card.example_meaning}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function FlashcardClient({ vocabulary, hskLevel, currentPage, totalPages, totalItems }: FlashcardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({ known: 0, unsure: 0, unknown: 0 })
  const [isCompleted, setIsCompleted] = useState(false)
  const [direction, setDirection] = useState(0)
  const [isLevelGraduated, setIsLevelGraduated] = useState(false)

  const currentCard = vocabulary[currentIndex]
  const progress = ((currentIndex) / vocabulary.length) * 100

  // Prevent scroll on mount (for mobile)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleNext = async (status: 'new' | 'learning' | 'mastered') => {
    // Determine stat key
    const statKey = status === 'mastered' ? 'known' : (status === 'learning' ? 'unsure' : 'unknown')

    setSessionStats(prev => ({
      ...prev,
      [statKey]: prev[statKey] + 1
    }))

    // Background update
    if (currentCard) {
      updateVocabStatus(currentCard.id, status)
    }

    goToNextCard()
  }

  const goToNextCard = () => {
    if (currentIndex < vocabulary.length - 1) {
      setDirection(1)
      setCurrentIndex(prev => prev + 1)
    } else {
      if (currentPage === totalPages) {
        setIsLevelGraduated(true)
      }
      setIsCompleted(true)
    }
  }

  // ... (Prev/Restart/PageChange/PlayAudio functions remain same)

  const handleRestart = () => {
    setCurrentIndex(0)
    setSessionStats({ known: 0, unsure: 0, unknown: 0 })
    setIsCompleted(false)
    setDirection(0)
    setIsLevelGraduated(false)
  }

  const handlePageChange = (page: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page)
    router.push(`?${params.toString()}`)
  }

  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(prev => prev - 1)
    }
  }

  // RENDER GRADUATION OR PAGE COMPLETION
  if (isCompleted) {
    const isGraduation = isLevelGraduated
    const title = isGraduation ? `Chúc Mừng Tốt Nghiệp HSK ${hskLevel}!` : "Hảo Hán!"
    const subtitle = isGraduation ? "Bạn đã chinh phục toàn bộ từ vựng cấp độ này!" : `Đã hoàn thành trang ${currentPage}!`
    const heroImage = isGraduation ? "/graduation-cat.png" : "/hero-cat.png"

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[70vh] text-center w-full rounded-3xl p-4 md:p-8 relative overflow-hidden"
      >
        {/* Background Gradient & Decor */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isGraduation ? 'from-[#4facfe] via-[#00f2fe] to-[#43e97b]' : 'from-[#ffb347] via-[#ffcc33] to-[#ff6b6b]'} z-0`}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-30 z-0 pointer-events-none mix-blend-overlay"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="relative mb-3 md:mb-6">
            <div className={`absolute -inset-4 ${isGraduation ? 'bg-blue-400/30' : 'bg-yellow-400/30'} rounded-full blur-2xl animate-pulse`}></div>
            <img
              src={heroImage}
              alt="Hero Cat"
              className="w-28 h-28 md:w-64 md:h-64 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h2 className="text-2xl md:text-5xl font-black text-white drop-shadow-xl mb-1 md:mb-2 tracking-wide font-serif leading-tight">
            {title}
          </h2>
          <p className="text-sm md:text-xl font-bold text-white/90 mb-4 md:mb-8 border-b-2 border-white/40 pb-2 px-4 md:px-8 shadow-sm">
            {subtitle}
          </p>

          <div className="grid grid-cols-3 gap-2 md:gap-6 w-full max-w-xl mb-4 md:mb-8">
            <div className={`bg-black/20 backdrop-blur-md border border-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center group hover:bg-black/30 transition-colors`}>
              <div className="bg-red-500/20 p-1 md:p-2 rounded-full mb-1 md:mb-2 border border-red-500/30">
                <X className="w-4 h-4 md:w-6 md:h-6 text-red-100" />
              </div>
              <p className="text-[10px] md:text-xs text-white/90 font-bold uppercase mb-0 md:mb-1 tracking-wider drop-shadow-sm">Chưa thuộc</p>
              <p className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{sessionStats.unknown}</p>
            </div>

            <div className={`bg-black/20 backdrop-blur-md border border-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center group hover:bg-black/30 transition-colors`}>
              <div className="bg-orange-500/20 p-1 md:p-2 rounded-full mb-1 md:mb-2 border border-orange-500/30">
                <HelpCircle className="w-4 h-4 md:w-6 md:h-6 text-orange-100" />
              </div>
              <p className="text-[10px] md:text-xs text-white/90 font-bold uppercase mb-0 md:mb-1 tracking-wider drop-shadow-sm">Chưa chắc</p>
              <p className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{sessionStats.unsure}</p>
            </div>
            <div className={`bg-black/20 backdrop-blur-md border border-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center group hover:bg-black/30 transition-colors`}>
              <div className="bg-green-500/20 p-1 md:p-2 rounded-full mb-1 md:mb-2 border border-green-500/30">
                <Check className="w-4 h-4 md:w-6 md:h-6 text-green-100" />
              </div>
              <p className="text-[10px] md:text-xs text-white/90 font-bold uppercase mb-0 md:mb-1 tracking-wider drop-shadow-sm">Đã thuộc</p>
              <p className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{sessionStats.known}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <Button
              onClick={handleRestart}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm h-10 md:h-12 px-4 md:px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Học lại
            </Button>

            <Button
              onClick={() => router.push(`/learn?level=${hskLevel}`)}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm h-10 md:h-12 px-4 md:px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm md:text-base"
            >
              Về danh sách
            </Button>

            {(currentPage < totalPages) && !isGraduation && (
              <Button
                onClick={() => handlePageChange((currentPage + 1).toString())}
                className="bg-white text-[#ff6b6b] hover:bg-yellow-50 h-10 md:h-12 px-6 md:px-8 rounded-xl font-black text-sm md:text-base shadow-xl active:scale-95 transition-all hover:shadow-2xl border-b-4 border-yellow-100"
              >
                Trang tiếp theo <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              </Button>
            )}
            {isGraduation && (
              <Button
                onClick={() => router.push(`/learn`)}
                className="bg-white text-[#43e97b] hover:bg-green-50 h-10 md:h-12 px-6 md:px-8 rounded-xl font-black text-sm md:text-base shadow-xl active:scale-95 transition-all hover:shadow-2xl border-b-4 border-green-100"
              >
                Hoàn tất khóa học <Check className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }



  const playAudio = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()

    if (!url) {
      toast.error("Không có link audio")
      return
    }

    const isExternal = url.startsWith("http")
    const src = isExternal
      ? `/api/proxy-audio?url=${encodeURIComponent(url)}`
      : url

    const audio = new Audio(src)
    audio.play().catch(err => {
      console.error("Flashcard audio error:", err)
      toast.error("Lỗi phát âm.")
    })
  }

  if (!currentCard && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-gray-500 mb-4">Danh sách trống.</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }



  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center pt-0 pb-4 px-2 min-h-[60vh]">
      {/* Header controls (Back + Pagination + Count) */}
      <div className="w-full flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="pl-0 hover:bg-transparent hover:text-[#ff6933] text-gray-800 font-bold text-sm md:text-base -ml-2 cursor-pointer"
          onClick={() => router.push(`/learn?level=${hskLevel}`)}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 mr-1" /> Quay lại
        </Button>

        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-[10px] md:text-sm font-bold text-gray-500 bg-gray-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
            Tổng: {totalItems}
          </span>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-base font-black text-gray-800 hidden md:inline-block">Trang:</span>
            <Select value={currentPage.toString()} onValueChange={handlePageChange}>
              <SelectTrigger className="w-auto min-w-[60px] md:min-w-[90px] h-8 md:h-10 !bg-white border-2 border-gray-200 font-black !text-gray-900 text-xs md:text-base shadow-sm cursor-pointer data-[placeholder]:text-gray-900">
                <SelectValue placeholder="Trang" />
              </SelectTrigger>
              <SelectContent className="!bg-white border-2 border-gray-200 !text-gray-900 z-[9999]">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-base !text-gray-900 hover:!bg-gray-100 cursor-pointer focus:!bg-gray-100 focus:!text-gray-900 data-[state=checked]:!bg-gray-100 mb-1">
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs md:text-base font-black text-gray-800 bg-gray-100 px-2 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-200">
            {currentIndex + 1} / {vocabulary.length}
          </span>
        </div>
      </div>

      <div className="w-full mb-4">
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiến độ</span>
          <span className="text-sm font-black text-[#ff6933]">
            {currentIndex + 1} <span className="text-gray-400 text-xs">/ {vocabulary.length}</span>
          </span>
        </div>
        <Progress value={progress} className="h-2 w-full bg-gray-200 rounded-full" />
      </div>

      {/* Flashcard Area */}
      <div className="w-full relative h-[320px] md:h-[500px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <FlashcardItem
            key={currentIndex}
            card={currentCard}
            direction={direction}
            onNext={goToNextCard}
            onPrev={goToPrevCard}
            playAudio={playAudio}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-6 w-full mt-6 max-w-lg">
        <Button
          className="h-20 flex flex-col gap-2 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-200 shadow-sm active:scale-95 transition-transform rounded-2xl cursor-pointer"
          onClick={() => handleNext('new')}
        >
          <X className="w-6 h-6" />
          <span className="text-sm font-black uppercase">Chưa thuộc</span>
        </Button>

        <Button
          className="h-20 flex flex-col gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 border-2 border-orange-200 shadow-sm active:scale-95 transition-transform rounded-2xl cursor-pointer"
          onClick={() => handleNext('learning')}
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-sm font-black uppercase">Chưa chắc</span>
        </Button>

        <Button
          className="h-20 flex flex-col gap-2 bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-200 shadow-sm active:scale-95 transition-transform rounded-2xl cursor-pointer"
          onClick={() => handleNext('mastered')}
        >
          <Check className="w-6 h-6" />
          <span className="text-sm font-black uppercase">Đã thuộc</span>
        </Button>
      </div>
    </div>
  )
}
// End of component
