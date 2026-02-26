"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Swords, Star, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserStats } from "@/app/(user)/learn/actions"

const levels = [
  { id: "1", name: "HSK 1", title: "Luyện Khí Tầng 1", desc: "Khởi đầu hành trình", color: "from-green-400 to-emerald-600", icon: "🌱" },
  { id: "2", name: "HSK 2", title: "Trúc Cơ Nhập Môn", desc: "Xây dựng nền tảng", color: "from-teal-400 to-cyan-600", icon: "🎋" },
  { id: "3", name: "HSK 3", title: "Kim Đan Sơ Kỳ", desc: "Thành thạo cơ bản", color: "from-blue-400 to-indigo-600", icon: "🔮" },
  { id: "4", name: "HSK 4", title: "Nguyên Anh Xuất Thế", desc: "Đột phá giới hạn", color: "from-violet-400 to-purple-600", icon: "⚡" },
  { id: "5", name: "HSK 5", title: "Hóa Thần Chi Cảnh", desc: "Tinh thông ngôn ngữ", color: "from-fuchsia-400 to-pink-600", icon: "🔥" },
  { id: "6", name: "HSK 6", title: "Độ Kiếp Phi Thăng", desc: "Đỉnh cao hán ngữ", color: "from-orange-400 to-red-600", icon: "🐲" },
  { id: "7-9", name: "HSK 7-9", title: "Tiên Giới Tối Thượng", desc: "Cảnh giới tối cao", color: "from-amber-500 to-rose-600", icon: "👑" },
]

export default function ReviewSelectionPage() {
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    getUserStats().then(setStats)
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-[#1d180c] flex items-center justify-center gap-3">
          <Swords className="w-10 h-10 text-[#e7564a]" />
          <span>Tháp Thí Luyện</span>
          <Swords className="w-10 h-10 text-[#e7564a] scale-x-[-1]" />
        </h1>
        <p className="text-[#6b5c35] text-lg">Chọn cấp độ để khiêu chiến và rèn luyện bản lĩnh!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level, index) => {
          const levelStat = level.id === "7-9"
            ? { total: stats.filter(s => s.level >= 7 && s.level <= 9).reduce((acc: number, s: any) => acc + (s.total || 0), 0) }
            : stats.find(s => s.level === parseInt(level.id))
          const totalWords = levelStat ? levelStat.total : 0
          const difficultyLevel = level.id === "7-9" ? 4 : parseInt(level.id)

          return (
            <Link href={`/review/${level.id}`} key={level.id} className="group">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-3xl bg-white border-2 border-[#f0ebe0] shadow-lg hover:shadow-2xl transition-all h-full"
              >
                {/* Card Header Content */}
                <div className={`h-32 bg-gradient-to-br ${level.color} p-6 flex items-center justify-between relative overflow-hidden`}>
                  <div className="relative z-10 text-white">
                    <h2 className="text-3xl font-black">{level.name}</h2>
                    <p className="font-bold opacity-90 text-sm mt-1">{level.title}</p>
                  </div>
                  <div className="text-6xl relative z-10 drop-shadow-md">
                    {level.icon}
                  </div>

                  {/* Decorative Overlay */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm text-[#6b5c35] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      Độ khó: {Array(difficultyLevel).fill(0).map((_, i) => "★").join('')}
                    </span>
                    <span>{stats.length > 0 ? `${totalWords} Từ vựng` : "Đang tải..."}</span>
                  </div>

                  <div className="w-full h-px bg-[#f0ebe0]"></div>

                  <p className="text-gray-500 text-sm line-clamp-2">
                    {level.desc}. Chuẩn bị kỹ càng trước khi bước vào chế độ chiến đấu.
                  </p>

                  <button className="w-full mt-2 py-3 rounded-xl bg-[#1d180c] text-[#ffc629] font-bold text-sm group-hover:bg-[#e7564a] group-hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Zap className="w-4 h-4 fill-current" />
                    Bắt Đầu Khiêu Chiến
                  </button>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
