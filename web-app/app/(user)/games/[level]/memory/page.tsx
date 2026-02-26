"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Layers, Trophy, RotateCcw, Check, Pause, Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { getAllVocabulary } from "../../actions"

interface Card {
  uid: string
  id: string
  type: "hanzi" | "meaning"
  content: string
  sub?: string
}

type CardStatus = "facedown" | "faceup" | "matched"

const PAIRS_PER_ROUND = 8

export default function MemoryGamePage() {
  const params = useParams()
  const level = params.level as string
  const levels = level === "7-9" ? [7, 8, 9] : [parseInt(level)]

  const [allWords, setAllWords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Round state
  const [round, setRound] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [cardStatuses, setCardStatuses] = useState<Map<string, CardStatus>>(new Map())

  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedCount, setMatchedCount] = useState(0)
  const [roundPairs, setRoundPairs] = useState(0)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [paused, setPaused] = useState(false)
  const [roundComplete, setRoundComplete] = useState(false)
  const [allComplete, setAllComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const totalRounds = Math.ceil(allWords.length / PAIRS_PER_ROUND)

  const setupRound = (words: any[], roundIndex: number) => {
    const start = roundIndex * PAIRS_PER_ROUND
    const roundWords = words.slice(start, start + PAIRS_PER_ROUND)
    setRoundPairs(roundWords.length)

    const allCards: Card[] = []
    roundWords.forEach((word: any) => {
      allCards.push({ uid: `hanzi-${word.id}`, id: word.id, type: "hanzi", content: word.hanzi, sub: word.pinyin })
      allCards.push({ uid: `meaning-${word.id}`, id: word.id, type: "meaning", content: word.meaning })
    })

    // Shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]]
    }

    setCards(allCards)
    const statuses = new Map<string, CardStatus>()
    allCards.forEach(c => statuses.set(c.uid, "facedown"))
    setCardStatuses(statuses)
    setMatchedCount(0)
    setFlippedCards([])
    setIsChecking(false)
    setRoundComplete(false)
  }

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getAllVocabulary(levels)
      setAllWords(data)
      setupRound(data, 0)
      setRound(1)
      setLoading(false)
    }
    load()
  }, [level])

  // Timer
  useEffect(() => {
    if (loading || allComplete || paused) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [loading, allComplete, paused])

  // Check round complete
  useEffect(() => {
    if (roundPairs > 0 && matchedCount === roundPairs && !roundComplete) {
      setRoundComplete(true)
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } })
    }
  }, [matchedCount, roundPairs])

  const handleCardClick = useCallback((card: Card) => {
    if (isChecking || paused || roundComplete) return
    const status = cardStatuses.get(card.uid)
    if (status !== "facedown") return
    if (flippedCards.length >= 2) return

    const newStatuses = new Map(cardStatuses)
    newStatuses.set(card.uid, "faceup")
    setCardStatuses(newStatuses)

    const newFlipped = [...flippedCards, card.uid]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      const first = cards.find(c => c.uid === newFlipped[0])!
      const second = cards.find(c => c.uid === newFlipped[1])!

      if (first.id === second.id && first.type !== second.type) {
        setTimeout(() => {
          const matchStatuses = new Map(newStatuses)
          matchStatuses.set(first.uid, "matched")
          matchStatuses.set(second.uid, "matched")
          setCardStatuses(matchStatuses)
          setMatchedCount(m => m + 1)
          setScore(s => s + 150)
          setFlippedCards([])
          setIsChecking(false)
        }, 600)
      } else {
        setTimeout(() => {
          const resetStatuses = new Map(newStatuses)
          resetStatuses.set(first.uid, "facedown")
          resetStatuses.set(second.uid, "facedown")
          setCardStatuses(resetStatuses)
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [cards, cardStatuses, flippedCards, isChecking, paused, roundComplete])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleNextRound = () => {
    const nextRoundIndex = round
    if (nextRoundIndex * PAIRS_PER_ROUND >= allWords.length) {
      setAllComplete(true)
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } })
      return
    }
    setupRound(allWords, nextRoundIndex)
    setRound(r => r + 1)
  }

  const handleRestart = async () => {
    setLoading(true)
    const data = await getAllVocabulary(levels)
    setAllWords(data)
    setupRound(data, 0)
    setScore(0)
    setTimer(0)
    setRound(1)
    setPaused(false)
    setAllComplete(false)
    setLoading(false)
  }

  // Calculate completed words across rounds
  const completedWordsTotal = (round - 1) * PAIRS_PER_ROUND + matchedCount

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🃏</div>
          <p className="text-[#6b5c35] font-bold animate-pulse">Đang xáo bài...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/games" className="flex items-center gap-2 text-[#1d180c] font-black hover:text-[#e7564a] transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>
        <h1 className="text-lg sm:text-2xl font-black text-[#1d180c] flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          Lật Thẻ - HSK {level}
        </h1>
        <button
          onClick={() => setPaused(!paused)}
          className="p-2 rounded-xl bg-white border border-[#f0ebe0] hover:bg-[#f4f0e6] transition-colors cursor-pointer"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[#f0ebe0]">
          <span className="text-xs">⏱</span>
          <span className="text-sm font-black text-[#1d180c] tabular-nums">{formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[#f0ebe0]">
          <Trophy className="w-3.5 h-3.5 text-[#ffc629]" />
          <span className="text-sm font-black text-[#1d180c]">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[#f0ebe0]">
          <span className="text-xs text-[#9c9278] font-bold">Màn</span>
          <span className="text-sm font-black text-[#1d180c]">{round}/{totalRounds}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[#f0ebe0]">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-sm font-black text-emerald-600">{matchedCount}</span>
          <span className="text-xs text-[#9c9278]">/ {roundPairs}</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#9c9278] font-bold shrink-0">Tổng</span>
        <div className="h-1.5 flex-1 bg-[#f4f0e6] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${allWords.length > 0 ? (completedWordsTotal / allWords.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-[#9c9278] font-bold shrink-0">{completedWordsTotal}/{allWords.length}</span>
      </div>

      {/* Pause Overlay */}
      {paused && !allComplete && (
        <div className="fixed inset-0 z-50 bg-[#1d180c]/70 backdrop-blur-sm flex items-center justify-center" onClick={() => setPaused(false)}>
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl">
            <Play className="w-12 h-12 mx-auto text-[#1d180c] mb-3" />
            <p className="font-black text-xl text-[#1d180c]">Tạm dừng</p>
            <p className="text-[#6b5c35] text-sm mt-1">Nhấn để tiếp tục</p>
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-[700px] mx-auto" style={{ perspective: "1000px" }}>
        {cards.map((card) => {
          const status = cardStatuses.get(card.uid) || "facedown"
          const isFlipped = status === "faceup" || status === "matched"

          return (
            <div
              key={card.uid}
              className="aspect-[3/4] cursor-pointer"
              onClick={() => handleCardClick(card)}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front (Face Down) */}
                <div
                  className={`absolute w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-all
                    ${status === "facedown"
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 border-white/20 shadow-md hover:shadow-lg hover:-translate-y-1"
                      : "bg-emerald-400 border-white/20"
                    }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-white/20">
                    <Layers className="w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                </div>

                {/* Back (Face Up) */}
                <div
                  className={`absolute w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2
                    ${status === "matched"
                      ? "bg-emerald-50 border-4 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-white border-4 border-amber-400 shadow-xl"
                    }`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {card.type === "hanzi" ? (
                    <>
                      <span className={`text-xl sm:text-3xl md:text-4xl font-black ${status === "matched" ? "text-emerald-700" : "text-[#1d180c]"}`}>
                        {card.content}
                      </span>
                      {card.sub && <span className="text-[10px] sm:text-xs text-gray-400 font-mono mt-1">{card.sub}</span>}
                    </>
                  ) : (
                    <span className={`text-xs sm:text-sm md:text-base font-bold text-center px-1 ${status === "matched" ? "text-emerald-700" : "text-[#1d180c]"}`}>
                      {card.content}
                    </span>
                  )}

                  {status === "matched" && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-center text-xs sm:text-sm text-[#9c9278]">
        Lật hai thẻ để tìm cặp <span className="font-bold text-[#1d180c]">Hán tự</span> và <span className="font-bold text-[#1d180c]">nghĩa tiếng Việt</span> tương ứng
      </p>

      {/* Round Complete Overlay */}
      <AnimatePresence>
        {roundComplete && !allComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1d180c]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#fcfbf8] p-8 rounded-[32px] max-w-sm w-full text-center border-4 border-emerald-400 shadow-2xl"
            >
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl font-black text-[#1d180c] mb-1">Màn {round} hoàn thành!</h2>
              <p className="text-[#6b5c35] font-medium mb-4">Điểm: <span className="font-black text-[#1d180c]">{score}</span></p>

              <button
                onClick={handleNextRound}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-lg"
              >
                Màn tiếp theo <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Complete Overlay */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#1d180c]/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#fcfbf8] p-8 rounded-[32px] max-w-sm w-full text-center border-4 border-emerald-400 shadow-2xl"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-black mb-2 text-[#1d180c]">XUẤT SẮC!</h1>
              <p className="text-[#6b5c35] font-bold mb-2">Lật hết {allWords.length} cặp thẻ trong {formatTime(timer)}</p>
              <p className="text-sm text-[#9c9278] mb-6">{totalRounds} màn</p>

              <div className="bg-[#f4f0e6] rounded-xl p-4 mb-6">
                <span className="text-xs text-[#9c9278] uppercase font-bold tracking-widest block mb-1">Tổng Điểm</span>
                <span className="text-4xl font-black text-[#1d180c]">{score.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRestart}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Chơi Lại
                </button>
                <Link
                  href="/games"
                  className="block w-full py-3.5 rounded-xl border-2 border-[#e5e0d0] text-[#6b5c35] font-bold hover:bg-[#f4f0e6] transition-colors text-center"
                >
                  Quay lại chọn game
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
