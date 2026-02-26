"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  level: string | number
}

export function Pagination({ currentPage, totalPages, level }: PaginationProps) {
  const router = useRouter()
  const [inputPage, setInputPage] = useState(currentPage.toString())

  // Sync input when page changes (e.g., level change resets to page 1)
  useEffect(() => {
    setInputPage(currentPage.toString())
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(`/learn?level=${level}&page=${page}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputPage)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        goToPage(page)
      } else {
        setInputPage(currentPage.toString())
      }
    }
  }

  const handleInputBlur = () => {
    const page = parseInt(inputPage)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page)
    } else {
      setInputPage(currentPage.toString())
    }
  }

  return (
    <div className="flex justify-center items-center mt-10 gap-2">
      {/* First Page */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => goToPage(1)}
        className="h-11 w-11 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-lg"
      >
        <ChevronsLeft className="w-5 h-5" />
      </Button>

      {/* Previous Page */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="h-11 w-11 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Current Page Input */}
      <div className="flex items-center gap-3 px-3">
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-14 h-11 text-center border border-gray-300 rounded-lg text-base font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6933] focus:border-transparent"
        />
        <span className="text-base text-gray-500">trên</span>
        <span className="text-base font-bold text-gray-700">{totalPages}</span>
      </div>

      {/* Next Page */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="h-11 w-11 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Last Page */}
      <Button
        variant="ghost"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(totalPages)}
        className="h-11 w-11 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-lg"
      >
        <ChevronsRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
