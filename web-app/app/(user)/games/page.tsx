"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Gamepad2, Shuffle, Layers, Swords, Crown } from "lucide-react"
import { useState } from "react"

const LEVELS = [
  { id: "1", name: "HSK 1", color: "from-green-400 to-emerald-600", icon: "🌱" },
  { id: "2", name: "HSK 2", color: "from-teal-400 to-cyan-600", icon: "🎋" },
  { id: "3", name: "HSK 3", color: "from-blue-400 to-indigo-600", icon: "🔮" },
  { id: "4", name: "HSK 4", color: "from-violet-400 to-purple-600", icon: "⚡" },
  { id: "5", name: "HSK 5", color: "from-fuchsia-400 to-pink-600", icon: "🔥" },
  { id: "6", name: "HSK 6", color: "from-orange-400 to-red-600", icon: "🐲" },
  { id: "7-9", name: "HSK 7-9", color: "from-amber-500 to-rose-600", icon: "👑" },
]

const GAMES = [
  {
    id: "matching",
    name: "Thử Thách Nối Từ",
    desc: "Nối Hán tự với nghĩa tiếng Việt tương ứng",
    icon: Shuffle,
    gradient: "from-[#ffd900] to-[#ffaa00]",
    textColor: "text-[#1d180c]",
    shadow: "shadow-yellow-300/30",
  },
  {
    id: "memory",
    name: "Lật Thẻ Ghi Nhớ",
    desc: "Tìm các cặp từ Hán tự và nghĩa tương ứng",
    icon: Layers,
    gradient: "from-[#1dc9ac] to-[#15867E]",
    textColor: "text-white",
    shadow: "shadow-emerald-400/30",
  },
]

export default function GamesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("1")

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-[#1d180c] flex items-center justify-center gap-3">
          <Gamepad2 className="w-10 h-10 text-[#e7564a]" />
          <span>Võ Đài Luyện Công</span>
          <Gamepad2 className="w-10 h-10 text-[#e7564a] scale-x-[-1]" />
        </h1>
        <p className="text-[#6b5c35] text-lg">Chọn cấp độ và thể loại trò chơi để bắt đầu!</p>
      </div>

      {/* Level Selector */}
      <div>
        <h2 className="text-sm font-bold text-[#9c9278] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Swords className="w-4 h-4" /> Chọn Cấp Độ
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`
                px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer
                flex items-center gap-2
                ${selectedLevel === level.id
                  ? `bg-gradient-to-r ${level.color} text-white shadow-lg scale-105`
                  : "bg-white border-2 border-[#f0ebe0] text-[#6b5c35] hover:border-[#ffc629] hover:shadow-md"
                }
              `}
            >
              <span>{level.icon}</span>
              <span>{level.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Game Mode Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#9c9278] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4" /> Chọn Trò Chơi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES.map((game, index) => (
            <Link
              href={`/games/${selectedLevel}/${game.id}`}
              key={game.id}
              className="group"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-3xl bg-white border-2 border-[#f0ebe0] shadow-lg hover:shadow-2xl ${game.shadow} transition-all h-full`}
              >
                {/* Card Header */}
                <div className={`h-40 bg-gradient-to-br ${game.gradient} p-8 flex items-center justify-between relative overflow-hidden`}>
                  <div className={`relative z-10 ${game.textColor}`}>
                    <h2 className="text-2xl font-black">{game.name}</h2>
                    <p className="font-medium opacity-80 text-sm mt-2 max-w-[200px]">{game.desc}</p>
                  </div>
                  <game.icon className={`w-16 h-16 ${game.textColor} opacity-30 relative z-10`} />

                  {/* Decorative */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-[#6b5c35] font-medium mb-4">
                    <span>Cấp độ: {LEVELS.find(l => l.id === selectedLevel)?.name}</span>
                    <span className="text-xs bg-[#f4f0e6] px-2 py-1 rounded-full">
                      {game.id === "matching" ? "5 cặp từ" : "8 cặp thẻ"}
                    </span>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-[#1d180c] text-[#ffc629] font-bold text-sm group-hover:bg-[#e7564a] group-hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Gamepad2 className="w-4 h-4" />
                    Bắt Đầu Chơi
                  </button>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
