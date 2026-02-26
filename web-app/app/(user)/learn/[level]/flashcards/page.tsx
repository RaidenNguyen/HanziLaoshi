import { getVocabulary, getFilteredVocabulary } from "@/app/(user)/learn/actions"
import { FlashcardClient } from "@/components/learn/FlashcardClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function FlashcardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { level: levelStr } = await params
  const { status, page: pageStr } = await searchParams
  const page = parseInt(pageStr || "1")
  const limit = 25

  // Parse levels from string (supports "7-9" or single number)
  const levelsArray = levelStr === "7-9" ? [7, 8, 9] : [parseInt(levelStr)]
  const displayLevel = levelStr === "7-9" ? "7-9" : parseInt(levelStr)

  let vocabulary = []
  let total = 0

  if (status && ['new', 'learning', 'mastered'].includes(status as string)) {
    // For filtered view, use first level (single level only for now)
    const res = await getFilteredVocabulary(levelsArray[0], status as 'new' | 'learning' | 'mastered', page, limit)
    vocabulary = res.data
    total = res.total
  } else {
    const res = await getVocabulary(levelsArray, page, limit)
    vocabulary = res.data
    total = res.total
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto max-w-4xl py-2 px-4 overflow-hidden">
      <FlashcardClient
        key={`${displayLevel}-${page}-${status}`} // Force reset on page change
        vocabulary={vocabulary}
        hskLevel={displayLevel}
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
      />
    </div>
  )
}
