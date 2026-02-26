"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Medal, Crown, Flame, Star, BookOpen, GraduationCap, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { getRankings, getUserLevelBreakdown, type RankedUser, type UserLevelStats } from "./actions"

const RANK_COLORS = [
  { bg: "from-amber-400 to-yellow-500", text: "text-amber-900", border: "border-amber-400", badge: "bg-amber-400" },
  { bg: "from-gray-300 to-slate-400", text: "text-slate-800", border: "border-gray-400", badge: "bg-gray-400" },
  { bg: "from-orange-400 to-amber-600", text: "text-orange-900", border: "border-orange-500", badge: "bg-orange-500" },
]

const HSK_COLORS = [
  "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#f59e0b", "#eab308"
]

function getAvatar(name: string | null, url: string | null) {
  if (url) return url
  const initial = (name || "?")[0].toUpperCase()
  return null
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-7 h-7 text-amber-400 drop-shadow-lg" />
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
  if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />
  return <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f4f0e6] text-[#9c9278] text-xs font-black">{rank}</span>
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankedUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [levelStats, setLevelStats] = useState<Record<string, UserLevelStats[]>>({})
  const [loadingStats, setLoadingStats] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const data = await getRankings()
      setRankings(data.rankings)
      setCurrentUserId(data.currentUserId)
      setLoading(false)
    }
    load()
  }, [])

  const handleToggleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null)
      return
    }
    setExpandedUser(userId)
    if (!levelStats[userId]) {
      setLoadingStats(userId)
      const stats = await getUserLevelBreakdown(userId)
      setLevelStats(prev => ({ ...prev, [userId]: stats }))
      setLoadingStats(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🏆</div>
          <p className="text-[#6b5c35] font-bold animate-pulse">Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1d180c] flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#ffc629]" />
          Bảng Xếp Hạng
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#e7564a]" />
        </h1>
        <p className="text-[#6b5c35]">Ai là đại hiệp giỏi nhất?</p>
      </div>

      {/* Top 3 Podium on Desktop */}
      {rankings.length >= 3 && (
        <div className="hidden sm:flex items-end justify-center gap-4 pt-4 pb-2">
          {/* 2nd Place */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center text-2xl font-black text-white shadow-lg border-3 border-white mb-2 overflow-hidden">
              {rankings[1].avatar_url
                ? <img src={rankings[1].avatar_url} alt="" className="w-full h-full object-cover" />
                : (rankings[1].full_name || "?")[0]
              }
            </div>
            <Medal className="w-5 h-5 text-gray-400 mb-1" />
            <p className="font-bold text-sm text-[#1d180c] text-center max-w-[100px] truncate">{rankings[1].full_name || "Ẩn danh"}</p>
            <p className="text-xs text-[#9c9278]">🎓 {rankings[1].mastered} từ</p>
            <div className="w-24 h-20 bg-gradient-to-t from-gray-200 to-gray-300 rounded-t-xl mt-2 flex items-center justify-center text-2xl font-black text-gray-500">2</div>
          </motion.div>

          {/* 1st Place */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex flex-col items-center -mt-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-3xl font-black text-white shadow-2xl border-4 border-[#ffc629] mb-2 overflow-hidden">
              {rankings[0].avatar_url
                ? <img src={rankings[0].avatar_url} alt="" className="w-full h-full object-cover" />
                : (rankings[0].full_name || "?")[0]
              }
            </div>
            <Crown className="w-7 h-7 text-amber-400 mb-1" />
            <p className="font-black text-base text-[#1d180c] text-center max-w-[120px] truncate">{rankings[0].full_name || "Ẩn danh"}</p>
            <p className="text-sm text-[#ffc629] font-bold">🎓 {rankings[0].mastered} từ</p>
            <div className="w-28 h-28 bg-gradient-to-t from-amber-300 to-amber-400 rounded-t-xl mt-2 flex items-center justify-center text-3xl font-black text-amber-700">1</div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-2xl font-black text-white shadow-lg border-3 border-white mb-2 overflow-hidden">
              {rankings[2].avatar_url
                ? <img src={rankings[2].avatar_url} alt="" className="w-full h-full object-cover" />
                : (rankings[2].full_name || "?")[0]
              }
            </div>
            <Medal className="w-5 h-5 text-orange-500 mb-1" />
            <p className="font-bold text-sm text-[#1d180c] text-center max-w-[100px] truncate">{rankings[2].full_name || "Ẩn danh"}</p>
            <p className="text-xs text-[#9c9278]">🎓 {rankings[2].mastered} từ</p>
            <div className="w-24 h-16 bg-gradient-to-t from-orange-200 to-orange-300 rounded-t-xl mt-2 flex items-center justify-center text-2xl font-black text-orange-600">3</div>
          </motion.div>
        </div>
      )}

      {/* Ranking List */}
      <div className="flex flex-col gap-2">
        {rankings.map((user, index) => {
          const rank = index + 1
          const isMe = user.id === currentUserId
          const isExpanded = expandedUser === user.id
          const stats = levelStats[user.id]

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleToggleExpand(user.id)}
                className={`w-full rounded-2xl transition-all cursor-pointer border-2 ${isMe
                    ? "bg-[#ffc629]/10 border-[#ffc629] shadow-md"
                    : "bg-white border-[#f0ebe0] hover:border-[#ffc629]/40 hover:shadow-sm"
                  } ${rank <= 3 ? "shadow-sm" : ""}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
                  {/* Rank */}
                  <div className="w-8 shrink-0 flex justify-center">
                    <RankBadge rank={rank} />
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-white overflow-hidden shadow-sm ${rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 ring-2 ring-amber-300" :
                      rank === 2 ? "bg-gradient-to-br from-gray-300 to-slate-400" :
                        rank === 3 ? "bg-gradient-to-br from-orange-400 to-amber-600" :
                          "bg-gradient-to-br from-[#1dc9ac] to-[#15867E]"
                    }`}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (user.full_name || "?")[0].toUpperCase()
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#1d180c] truncate">
                        {user.full_name || "Ẩn danh"}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-[#ffc629] text-[#1d180c] px-1.5 py-0.5 rounded-full font-black shrink-0">BẠN</span>
                      )}
                    </div>
                    <p className="text-xs text-[#9c9278]">HSK {user.current_hsk_level}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-[#9c9278] leading-none mb-0.5 hidden sm:block">Thuộc</p>
                      <p className="text-sm sm:text-lg font-black text-green-600">{user.mastered}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#9c9278] leading-none mb-0.5 hidden sm:block">Đang học</p>
                      <p className="text-sm sm:text-lg font-black text-amber-500">{user.learning}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#9c9278] leading-none mb-0.5 hidden sm:block">Tổng</p>
                      <p className="text-sm sm:text-lg font-black text-[#1d180c]">{user.total_known}</p>
                    </div>
                    <div className="pl-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#9c9278]" /> : <ChevronDown className="w-4 h-4 text-[#9c9278]" />}
                    </div>
                  </div>
                </div>
              </button>

              {/* Level Breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-5 py-3 mb-1 bg-[#f9f7f2] rounded-b-2xl border-2 border-t-0 border-[#f0ebe0] -mt-2">
                      {loadingStats === user.id ? (
                        <p className="text-sm text-[#9c9278] text-center py-2 animate-pulse">Đang tải...</p>
                      ) : stats ? (
                        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                          {stats.map((s, i) => {
                            const pct = s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0
                            return (
                              <div key={s.level} className="text-center bg-white rounded-xl p-2 shadow-sm border border-[#f0ebe0]">
                                <p className="text-[10px] font-bold text-[#9c9278] mb-1">HSK {s.level}</p>
                                <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${pct}%`, backgroundColor: HSK_COLORS[i] }}
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5 text-[9px]">
                                  <span className="text-green-600 font-bold">{s.mastered}</span>
                                  <span className="text-amber-500 font-bold">{s.learning}</span>
                                  <span className="text-gray-400">{s.new_words}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : null}
                      {stats && (
                        <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-[#9c9278]">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Thuộc</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Đang học</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Chưa biết</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {rankings.length === 0 && (
          <div className="text-center py-12 text-[#9c9278]">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">Chưa có dữ liệu xếp hạng</p>
          </div>
        )}
      </div>
    </div>
  )
}
