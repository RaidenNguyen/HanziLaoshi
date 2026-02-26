"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Swords, Zap, Trophy, RotateCcw, Check, Volume2, ArrowRight } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { getAllVocabulary } from "../../actions"

interface WordItem {
  id: string
  hanzi: string
  pinyin: string
  meaning: string
}

type CardState = "neutral" | "selected" | "matched" | "wrong"

const WORDS_PER_ROUND = 5

export default function MatchingGamePage() {
  const params = useParams()
  const level = params.level as string
  const levels = level === "7-9" ? [7, 8, 9] : [parseInt(level)]

  const [allWords, setAllWords] = useState<WordItem[]>([])
  const [loading, setLoading] = useState(true)

  // Round state
  const [round, setRound] = useState(0)
  const [words, setWords] = useState<WordItem[]>([])
  const [shuffledMeanings, setShuffledMeanings] = useState<WordItem[]>([])

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timer, setTimer] = useState(0)
  const [roundComplete, setRoundComplete] = useState(false)
  const [allComplete, setAllComplete] = useState(false)

  const totalRounds = Math.ceil(allWords.length / WORDS_PER_ROUND)

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getAllVocabulary(levels)
      setAllWords(data as WordItem[])
      // Set first round
      const firstRound = (data as WordItem[]).slice(0, WORDS_PER_ROUND)
      setWords(firstRound)
      setShuffledMeanings([...firstRound].sort(() => Math.random() - 0.5))
      setRound(1)
      setLoading(false)
    }
    load()
  }, [level])

  // Timer
  useEffect(() => {
    if (loading || allComplete) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [loading, allComplete])

  // Check match
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        setMatchedPairs(prev => new Set([...prev, selectedLeft]))
        setScore(s => s + 100 + combo * 20)
        setCombo(c => c + 1)
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        setWrongPair({ left: selectedLeft, right: selectedRight })
        setCombo(0)
        setTimeout(() => {
          setWrongPair(null)
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 600)
      }
    }
  }, [selectedLeft, selectedRight])

  // Check round complete
  useEffect(() => {
    if (words.length > 0 && matchedPairs.size === words.length && !roundComplete) {
      setRoundComplete(true)
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } })
    }
  }, [matchedPairs, words])

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "zh-CN"
    window.speechSynthesis.speak(utterance)
  }

  const getLeftState = (id: string): CardState => {
    if (matchedPairs.has(id)) return "matched"
    if (wrongPair?.left === id) return "wrong"
    if (selectedLeft === id) return "selected"
    return "neutral"
  }

  const getRightState = (id: string): CardState => {
    if (matchedPairs.has(id)) return "matched"
    if (wrongPair?.right === id) return "wrong"
    if (selectedRight === id) return "selected"
    return "neutral"
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleNextRound = () => {
    const nextStart = round * WORDS_PER_ROUND
    if (nextStart >= allWords.length) {
      setAllComplete(true)
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } })
      return
    }
    const nextWords = allWords.slice(nextStart, nextStart + WORDS_PER_ROUND)
    setWords(nextWords)
    setShuffledMeanings([...nextWords].sort(() => Math.random() - 0.5))
    setMatchedPairs(new Set())
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrongPair(null)
    setRoundComplete(false)
    setRound(r => r + 1)
  }

  const handleRestart = async () => {
    setLoading(true)
    const data = await getAllVocabulary(levels)
    setAllWords(data as WordItem[])
    const firstRound = (data as WordItem[]).slice(0, WORDS_PER_ROUND)
    setWords(firstRound)
    setShuffledMeanings([...firstRound].sort(() => Math.random() - 0.5))
    setMatchedPairs(new Set())
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrongPair(null)
    setScore(0)
    setCombo(0)
    setTimer(0)
    setRound(1)
    setRoundComplete(false)
    setAllComplete(false)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">⚔️</div>
          <p className="text-[#6b5c35] font-bold animate-pulse">Đang chuẩn bị trận đấu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/games" className="flex items-center gap-2 text-[#1d180c] font-black hover:text-[#e7564a] transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-black text-[#1d180c] flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#ffc629]" />
            Nối Từ - HSK {level}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-[#f4f0e6] px-3 py-1.5 rounded-full font-bold text-[#1d180c]">
            ⏱ {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 shadow-sm border border-[#f0ebe0]">
          <Trophy className="w-3.5 h-3.5 text-[#ffc629]" />
          <span className="text-xs text-[#9c9278] font-bold">Điểm</span>
          <span className="text-sm sm:text-lg font-black text-[#1d180c]">{score}</span>
        </div>
        {combo > 1 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-[#ffc629] rounded-xl px-3 py-2 shadow-lg"
          >
            <Zap className="w-4 h-4 text-[#1d180c] fill-current" />
            <span className="font-black text-[#1d180c]">x{combo}</span>
          </motion.div>
        )}
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 shadow-sm border border-[#f0ebe0]">
          <span className="text-xs text-[#9c9278] font-bold">Màn</span>
          <span className="text-sm sm:text-lg font-black text-[#1d180c]">{round}/{totalRounds}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 shadow-sm border border-[#f0ebe0]">
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-sm sm:text-lg font-black text-[#1d180c]">{matchedPairs.size}/{words.length}</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#9c9278] font-bold shrink-0">Tổng tiến độ</span>
        <div className="h-1.5 flex-1 bg-[#f4f0e6] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#ffc629] rounded-full"
            animate={{ width: `${(((round - 1) * WORDS_PER_ROUND + matchedPairs.size) / allWords.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-[#9c9278] font-bold shrink-0">
          {(round - 1) * WORDS_PER_ROUND + matchedPairs.size}/{allWords.length}
        </span>
      </div>

      {/* Game Board */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 lg:gap-16 items-stretch relative">
        {/* Left Column - Hanzi */}
        <div className="flex-1 flex flex-col gap-2.5 sm:gap-3">
          <p className="text-xs font-bold text-[#9c9278] uppercase tracking-widest text-center mb-1">Hán Tự</p>
          {words.map((word) => {
            const state = getLeftState(word.id)
            return (
              <motion.button
                key={`left-${word.id}`}
                whileHover={state === "neutral" ? { scale: 1.02 } : {}}
                whileTap={state === "neutral" ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (state === "matched") return
                  handleSpeak(word.hanzi)
                  setSelectedLeft(word.id)
                }}
                disabled={state === "matched"}
                className={`
                  relative h-14 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer border-2
                  ${state === "matched" ? "bg-green-50 border-green-400 opacity-60" : ""}
                  ${state === "selected" ? "bg-white border-[#ffc629] shadow-[0_0_20px_rgba(255,198,41,0.4)] scale-105" : ""}
                  ${state === "wrong" ? "bg-red-50 border-red-400 animate-[shake_0.5s_ease-in-out]" : ""}
                  ${state === "neutral" ? "bg-white border-[#f0ebe0] hover:border-[#ffc629]/50 hover:shadow-md shadow-sm" : ""}
                `}
              >
                <span className={`text-2xl sm:text-3xl font-bold ${state === "matched" ? "text-green-600" : "text-[#1d180c]"}`}>
                  {word.hanzi}
                </span>
                {state === "matched" && (
                  <div className="absolute -right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); handleSpeak(word.hanzi) }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-300 hover:text-[#6b5c35] transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Center Divider */}
        <div className="hidden sm:flex flex-col items-center justify-center">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-[#e5e0d0] to-transparent" />
        </div>

        {/* Right Column - Meanings */}
        <div className="flex-1 flex flex-col gap-2.5 sm:gap-3">
          <p className="text-xs font-bold text-[#9c9278] uppercase tracking-widest text-center mb-1">Nghĩa Tiếng Việt</p>
          {shuffledMeanings.map((word) => {
            const state = getRightState(word.id)
            return (
              <motion.button
                key={`right-${word.id}`}
                whileHover={state === "neutral" ? { scale: 1.02 } : {}}
                whileTap={state === "neutral" ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (state === "matched") return
                  setSelectedRight(word.id)
                }}
                disabled={state === "matched"}
                className={`
                  relative h-14 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer border-2 text-center px-4
                  ${state === "matched" ? "bg-green-50 border-green-400 opacity-60" : ""}
                  ${state === "selected" ? "bg-white border-[#ffc629] shadow-[0_0_20px_rgba(255,198,41,0.4)] scale-105" : ""}
                  ${state === "wrong" ? "bg-red-50 border-red-400 animate-[shake_0.5s_ease-in-out]" : ""}
                  ${state === "neutral" ? "bg-white border-[#f0ebe0] hover:border-[#ffc629]/50 hover:shadow-md shadow-sm" : ""}
                `}
              >
                <span className={`text-sm sm:text-lg font-bold ${state === "matched" ? "text-green-600 line-through" : "text-[#1d180c]"}`}>
                  {word.meaning}
                </span>
                {state === "matched" && (
                  <div className="absolute -left-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs sm:text-sm text-[#9c9278]">
        Nhấn vào <span className="font-bold text-[#1d180c]">Hán tự</span> rồi chọn <span className="font-bold text-[#1d180c]">nghĩa tiếng Việt</span> tương ứng
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
              className="bg-[#fcfbf8] p-8 rounded-[32px] max-w-sm w-full text-center border-4 border-[#ffc629] shadow-2xl"
            >
              <div className="text-5xl mb-3">⚡</div>
              <h2 className="text-2xl font-black text-[#1d180c] mb-1">Màn {round} hoàn thành!</h2>
              <p className="text-[#6b5c35] font-medium mb-4">Điểm hiện tại: <span className="font-black text-[#1d180c]">{score}</span></p>

              <button
                onClick={handleNextRound}
                className="w-full py-3.5 rounded-xl bg-[#ffc629] text-[#1d180c] font-black hover:bg-[#ffb700] shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-lg"
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
              className="bg-[#fcfbf8] p-8 rounded-[32px] max-w-sm w-full text-center border-4 border-[#ffc629] shadow-2xl"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-3xl font-black mb-2 text-[#1d180c]">HOÀN THÀNH!</h1>
              <p className="text-[#6b5c35] font-bold mb-2">Nối hết {allWords.length} từ trong {formatTime(timer)}</p>
              <p className="text-sm text-[#9c9278] mb-6">{totalRounds} màn</p>

              <div className="bg-[#f4f0e6] rounded-xl p-4 mb-6">
                <span className="text-xs text-[#9c9278] uppercase font-bold tracking-widest block mb-1">Tổng Điểm</span>
                <span className="text-4xl font-black text-[#1d180c]">{score.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRestart}
                  className="w-full py-3.5 rounded-xl bg-[#1d180c] text-[#ffc629] font-bold hover:bg-[#332c1f] shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
