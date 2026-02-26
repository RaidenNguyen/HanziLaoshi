"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, GraduationCap, TrendingUp, UserPlus, Trophy, Clock, Flame, BarChart3 } from "lucide-react"
import { getDashboardStats, type DashboardStats } from "./actions"

const HSK_COLORS = ["#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#f59e0b", "#eab308"]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-gray-300 animate-pulse mb-3" />
          <p className="text-gray-500 font-medium animate-pulse">Đang tải thống kê...</p>
        </div>
      </div>
    )
  }

  if (!stats) return <p className="text-center text-gray-500 py-12">Không thể tải dữ liệu</p>

  const masteredRate = stats.totalVocabulary > 0
    ? ((stats.totalMastered / (stats.totalUsers * stats.totalVocabulary)) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2E333D]">Tổng quan</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Tổng người dùng"
          value={stats.totalUsers}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<UserPlus className="w-5 h-5 text-green-500" />}
          label="Mới hôm nay"
          value={stats.newUsersToday}
          sub={`${stats.newUsersThisWeek} trong tuần`}
          bg="bg-green-50"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-purple-500" />}
          label="Tổng từ vựng DB"
          value={stats.totalVocabulary.toLocaleString()}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Từ đã thuộc (all users)"
          value={stats.totalMastered.toLocaleString()}
          sub={`${stats.totalLearning.toLocaleString()} đang học`}
          bg="bg-orange-50"
        />
      </div>

      {/* Row: HSK Distribution + Top Learners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HSK Distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#2E333D] flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            Phân bố HSK Level
          </h2>
          <div className="space-y-3">
            {stats.hskDistribution.map((entry, i) => {
              const pct = stats.totalUsers > 0 ? (entry.count / stats.totalUsers) * 100 : 0
              return (
                <div key={entry.level} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-12 shrink-0">HSK {entry.level}</span>
                  <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 flex items-center pl-2"
                      style={{
                        width: `${Math.max(pct, 8)}%`,
                        backgroundColor: HSK_COLORS[entry.level - 1] || "#9ca3af",
                      }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-sm">{entry.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
            {stats.hskDistribution.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Top Learners */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#2E333D] flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Học Viên
          </h2>
          <div className="space-y-2">
            {stats.topLearners.map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${i === 0 ? "bg-amber-400 text-white" :
                    i === 1 ? "bg-gray-300 text-white" :
                      i === 2 ? "bg-orange-400 text-white" :
                        "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 overflow-hidden shrink-0">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (user.full_name || "?")[0].toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name || "Ẩn danh"}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-green-600 font-bold">{user.mastered} <span className="text-gray-400 font-normal">thuộc</span></span>
                  <span className="text-amber-500 font-bold">{user.learning} <span className="text-gray-400 font-normal">học</span></span>
                </div>
              </div>
            ))}
            {stats.topLearners.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-[#2E333D] flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          Người dùng mới nhất
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2 font-medium">Người dùng</th>
                <th className="pb-2 font-medium hidden sm:table-cell">Email</th>
                <th className="pb-2 font-medium text-right">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 overflow-hidden shrink-0">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : (user.full_name || user.email || "?")[0].toUpperCase()
                        }
                      </div>
                      <span className="font-medium text-gray-800">{user.full_name || "Chưa đặt tên"}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-500 hidden sm:table-cell">{user.email}</td>
                  <td className="py-2.5 text-gray-400 text-right">{new Date(user.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, bg }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs text-gray-500 font-medium leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2E333D]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
