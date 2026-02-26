"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Trophy, BookOpen } from "lucide-react"

interface LevelStats {
  level: string | number
  total: number
  mastered: number
  learning: number
  new: number
}

interface LevelSidebarProps {
  stats: LevelStats[]
}

export function LevelSidebar({ stats }: LevelSidebarProps) {
  const searchParams = useSearchParams()
  const currentLevel = searchParams.get("level") || "1"

  return (
    <div className="w-full md:w-64 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
          <BookOpen className="w-5 h-5 text-[#ff6933]" />
          Cấp độ HSK
        </h3>
        <div className="space-y-2">
          {stats.map((stat) => {
            const progress = stat.total > 0 ? (stat.mastered / stat.total) * 100 : 0
            const isActive = currentLevel === String(stat.level)

            return (
              <Link
                key={stat.level}
                href={`/learn?level=${stat.level}`}
                className={cn(
                  "block p-3 rounded-xl transition-all duration-200 border-2 active:scale-95",
                  isActive
                    ? "border-[#ff6933] bg-orange-50/50"
                    : "border-transparent hover:bg-gray-50 bg-gray-50/50"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={cn(
                    "font-bold",
                    isActive ? "text-[#ff6933]" : "text-gray-700"
                  )}>
                    HSK {stat.level}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {stat.mastered}/{stat.total}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </Link>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          Thống kê HSK {currentLevel}
        </h3>
        {stats.find(s => String(s.level) === currentLevel) ? (
          <div className="space-y-3">
            {(() => {
              const stat = stats.find(s => String(s.level) === currentLevel)!

              const items = [
                {
                  label: "Chưa biết",
                  count: stat.new,
                  color: "text-gray-500",
                  bg: "bg-gray-100",
                  status: "new"
                },
                {
                  label: "Chưa thuộc",
                  count: stat.learning,
                  color: "text-blue-500",
                  bg: "bg-blue-100",
                  status: "learning"
                },
                {
                  label: "Đã thuộc",
                  count: stat.mastered,
                  color: "text-green-500",
                  bg: "bg-green-100",
                  status: "mastered"
                }
              ]

              return items.map((item) => (
                <Link
                  key={item.label}
                  href={`/learn/${currentLevel}/flashcards?status=${item.status}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", item.color.replace('text', 'bg'))} />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <span className={cn("font-bold text-sm", item.color)}>
                    {item.count}
                  </span>
                </Link>
              ))
            })()}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Đang tải...</p>
        )}
      </div>

      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Tổng từ vựng</p>
            <p className="text-2xl font-black text-gray-900">
              {stats.reduce((acc, curr) => acc + curr.mastered, 0)}
            </p>
          </div>
        </div>
        <p className="text-xs text-amber-700 font-medium ml-1">
          Trên tổng số {stats.reduce((acc, curr) => acc + curr.total, 0)} từ
        </p>
      </div>
    </div>
  )
}
