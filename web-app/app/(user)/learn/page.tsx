import { Suspense } from "react"
import { getVocabulary, getUserStats } from "./actions"
import { LevelSidebar } from "@/components/learn/LevelSidebar"
import { VocabCard } from "@/components/learn/VocabCard"
import { Pagination } from "@/components/learn/Pagination"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Rocket } from "lucide-react"

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>
}) {
  const { level: levelStr, page: pageStr } = await searchParams
  const level = parseInt(levelStr || "1")
  const page = parseInt(pageStr || "1")
  const limit = 12 // Cards per page

  const [vocabData, stats] = await Promise.all([
    getVocabulary(level, page, limit),
    getUserStats()
  ])

  const { data: vocabulary, total } = vocabData
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Visible on Desktop */}
      <div className="hidden md:block flex-shrink-0">
        <LevelSidebar stats={stats} />
      </div>

      {/* Mobile Layout Container */}
      <div className="md:hidden w-full flex flex-col gap-4 mb-2">
        {/* 1. Mobile Stats (Top) */}
        {(() => {
          const stat = stats.find(s => s.level === level) || { new: 0, learning: 0, mastered: 0, total: 0, level }

          return (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                <span>Thống kê HSK {level}</span>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Tổng: {stat.total} từ</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <Link href={`/learn/${level}/flashcards?status=new`} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 bg-gray-50/50 border border-transparent hover:border-gray-200 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-[10px] uppercase font-bold text-gray-400">Chưa biết</span>
                  <span className="text-lg font-black text-gray-600 leading-none">{stat.new}</span>
                </Link>

                <Link href={`/learn/${level}/flashcards?status=learning`} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 bg-blue-50/50 border border-transparent hover:border-blue-200 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[10px] uppercase font-bold text-blue-400">Chưa thuộc</span>
                  <span className="text-lg font-black text-blue-600 leading-none">{stat.learning}</span>
                </Link>

                <Link href={`/learn/${level}/flashcards?status=mastered`} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 bg-green-50/50 border border-transparent hover:border-green-200 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] uppercase font-bold text-green-400">Đã thuộc</span>
                  <span className="text-lg font-black text-green-600 leading-none">{stat.mastered}</span>
                </Link>
              </div>
            </div>
          )
        })()}

        {/* 2. Level Selector (Below - Vertical, Compact) */}
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => {
            const stat = stats.find(s => s.level === l) || { level: l, total: 0, mastered: 0, new: 0, learning: 0 }
            const progress = stat.total > 0 ? (stat.mastered / stat.total) * 100 : 0
            const isActive = level === l

            return (
              <div
                key={l}
                className={cn(
                  "flex items-center gap-2 p-2 sm:p-3 rounded-xl transition-all duration-200 border bg-white shadow-sm",
                  isActive
                    ? "border-[#ff6933] ring-1 ring-[#ff6933] ring-offset-1"
                    : "border-transparent border-gray-100"
                )}
              >
                {/* Left: Select Level Support */}
                <Link href={`/learn?level=${l}`} className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-base sm:text-lg shrink-0",
                        isActive ? "bg-[#ff6933] text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {l}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "font-bold text-base sm:text-lg leading-none truncate",
                          isActive ? "text-[#ff6933]" : "text-gray-700"
                        )}>
                          HSK {l}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
                          {stat.mastered} / {stat.total}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-1 sm:h-1.5 bg-gray-100" indicatorClassName={isActive ? "bg-[#ff6933]" : "bg-gray-400"} />
                </Link>

                {/* Right: Start Learning Button (Icon Only on Mobile) */}
                <Button asChild size="icon" className="bg-[#ff6933] hover:bg-[#ff8c5a] text-white rounded-lg shadow-sm w-9 h-9 shrink-0">
                  <Link href={`/learn/${l}/flashcards`}>
                    <Rocket className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Từ vựng HSK {level}
            </h1>
            <span className="text-gray-500 text-sm">
              Trang {page}/{totalPages || 1}
            </span>
          </div>

          <Button asChild className="w-full sm:w-auto bg-[#ff6933] hover:bg-[#ff8c5a] shadow-md shadow-orange-200">
            <Link href={`/learn/${level}/flashcards`}>
              Vào học ngay 🚀
            </Link>
          </Button>
        </div>

        {vocabulary.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Chưa có từ vựng nào ở cấp độ này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {vocabulary.map((vocab: any) => (
              <VocabCard key={vocab.id} vocab={vocab} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} level={level} />
        )}
      </div>
    </div>
  )
}
