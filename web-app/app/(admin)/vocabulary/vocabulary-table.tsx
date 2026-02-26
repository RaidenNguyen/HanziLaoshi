"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, Filter, ChevronLeft, ChevronRight, Save, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteVocabulary, updateVocabulary, createVocabulary } from "./actions"
import { toast } from "sonner"

interface Vocabulary {
  id: string
  hsk_level: number
  hanzi: string
  pinyin: string
  meaning: string
  audio_url?: string
  example: string | null
  example_pinyin: string | null
  example_meaning: string | null
}

const emptyVocabulary: Omit<Vocabulary, "id"> = {
  hsk_level: 1,
  hanzi: "",
  pinyin: "",
  meaning: "",
  audio_url: "",
  example: "",
  example_pinyin: "",
  example_meaning: ""
}

export function VocabularyTable({ initialData }: { initialData: Vocabulary[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Edit/Add State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<Vocabulary>>(emptyVocabulary)
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Client-side filtering
  const filteredData = initialData.filter((vocab) => {
    const matchesSearch =
      vocab.hanzi.includes(searchTerm) ||
      vocab.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesLevel = false
    if (selectedLevel === "all") {
      matchesLevel = true
    } else if (selectedLevel === "7-9") {
      matchesLevel = vocab.hsk_level >= 7 && vocab.hsk_level <= 9
    } else {
      matchesLevel = vocab.hsk_level.toString() === selectedLevel
    }

    return matchesSearch && matchesLevel
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const confirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteVocabulary(deleteId)
    setIsDeleting(false)
    setDeleteId(null)

    if (result.success) {
      toast.success("Đã xóa từ vựng thành công")
    } else {
      toast.error("Lỗi khi xóa: " + result.error)
    }
  }

  const handleSave = async () => {
    if (!editingItem.hanzi || !editingItem.meaning) {
      toast.error("Vui lòng nhập Hán tự và Nghĩa")
      return
    }

    setIsUpdating(true)

    try {
      if (editingItem.id) {
        // Update
        const updateData = {
          ...editingItem,
          example: editingItem.example || undefined,
          example_pinyin: editingItem.example_pinyin || undefined,
          example_meaning: editingItem.example_meaning || undefined
        }
        // @ts-ignore
        const result = await updateVocabulary(editingItem.id, updateData)
        if (result.success) {
          toast.success("Cập nhật thành công")
          setIsDialogOpen(false)
        } else {
          toast.error("Lỗi cập nhật: " + result.error)
        }
      } else {
        // Create
        // @ts-ignore
        const result = await createVocabulary(editingItem)
        if (result.success) {
          toast.success("Thêm mới thành công")
          setIsDialogOpen(false)
        } else {
          toast.error("Lỗi thêm mới: " + result.error)
        }
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra")
    } finally {
      setIsUpdating(false)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push(-1) // Ellipsis
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push(-1)
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push(-1)
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push(-1)
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Filters */}
      <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Hiển thị</span>
          <Select value={itemsPerPage.toString()} onValueChange={(val) => {
            setItemsPerPage(parseInt(val))
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            Tổng: <span className="text-[#ff6933] font-bold text-lg">{filteredData.length}</span> từ
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 w-full sm:w-[250px] transition-all focus-within:ring-2 focus-within:ring-[#ff6933]/20 rounded-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm từ vựng..."
              className="pl-9 bg-gray-50 border-gray-200 h-9 focus-visible:ring-0 focus-visible:border-[#ff6933]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <Select value={selectedLevel} onValueChange={(val) => {
            setSelectedLevel(val)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 bg-white border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <SelectValue placeholder="Cấp độ" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả HSK</SelectItem>
              <SelectItem value="1">HSK 1</SelectItem>
              <SelectItem value="2">HSK 2</SelectItem>
              <SelectItem value="3">HSK 3</SelectItem>
              <SelectItem value="4">HSK 4</SelectItem>
              <SelectItem value="5">HSK 5</SelectItem>
              <SelectItem value="6">HSK 6</SelectItem>
              <SelectItem value="7-9">HSK 7-9</SelectItem>
              <SelectItem value="7">HSK 7</SelectItem>
              <SelectItem value="8">HSK 8</SelectItem>
              <SelectItem value="9">HSK 9</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full sm:w-auto gap-2 bg-[#ff6933] hover:bg-[#e55022] text-white"
            onClick={() => {
              setEditingItem(emptyVocabulary);
              setIsDialogOpen(true);
            }}
          >
            Thêm từ mới
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100/80">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-[50px] font-bold text-gray-800">#</TableHead>
              <TableHead className="w-[90px] font-bold text-gray-800">HSK</TableHead>
              <TableHead className="w-[120px] font-bold text-gray-800">Hán tự</TableHead>
              <TableHead className="w-[140px] font-bold text-gray-800">Pinyin</TableHead>
              <TableHead className="font-bold text-gray-800">Nghĩa</TableHead>
              <TableHead className="w-[70px] font-bold text-gray-800 text-center">Audio</TableHead>
              <TableHead className="hidden md:table-cell w-[350px] font-bold text-gray-800">Ví dụ</TableHead>
              <TableHead className="text-right font-bold text-gray-800 pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p className="font-medium text-gray-600">Không tìm thấy từ vựng nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((vocab, index) => (
                <TableRow key={vocab.id} className="hover:bg-orange-50/30 transition-colors border-b border-gray-100">
                  <TableCell className="text-gray-500 font-bold text-sm whitespace-nowrap pl-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <span className={`
                      inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black whitespace-nowrap min-w-[50px] justify-center shadow-sm border
                      ${vocab.hsk_level === 1 ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                      ${vocab.hsk_level === 2 ? "bg-cyan-50 text-cyan-700 border-cyan-200" : ""}
                      ${vocab.hsk_level === 3 ? "bg-green-50 text-green-700 border-green-200" : ""}
                      ${vocab.hsk_level === 4 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
                      ${vocab.hsk_level === 5 ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
                      ${vocab.hsk_level === 6 ? "bg-red-50 text-red-700 border-red-200" : ""}
                      ${vocab.hsk_level === 7 ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                      ${vocab.hsk_level === 8 ? "bg-pink-50 text-pink-700 border-pink-200" : ""}
                      ${vocab.hsk_level === 9 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}
                    `}>
                      HSK {vocab.hsk_level}
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-xl text-gray-900 font-serif">{vocab.hanzi}</TableCell>
                  <TableCell className="text-gray-700 font-bold font-mono text-base">{vocab.pinyin}</TableCell>
                  <TableCell className="text-gray-900 font-semibold">{vocab.meaning}</TableCell>
                  <TableCell className="text-center">
                    {/* Audio Indicator */}
                    {/* @ts-ignore */}
                    {vocab.audio_url ? (
                      <div className="flex justify-center">
                        <Volume2 className="w-9 h-9 text-blue-600 cursor-pointer hover:bg-blue-100 hover:scale-110 rounded-full p-2 transition-all shadow-sm border border-blue-200 bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Use proxy to bypass CORS for Google Translate links
                            const proxyUrl = `/api/audio?url=${encodeURIComponent(vocab.audio_url!)}`;
                            const audio = new Audio(proxyUrl);
                            audio.play().catch(err => toast.error("Không thể phát audio: " + err.message));
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs font-bold">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm py-3">
                    {vocab.example ? (
                      <div className="space-y-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                        <div className="font-bold text-gray-800 text-base">{vocab.example}</div>
                        {(vocab.example_pinyin || vocab.example_meaning) && (
                          <div className="flex flex-col gap-0.5 border-l-2 border-orange-300 pl-3">
                            {vocab.example_pinyin && <div className="text-gray-600 text-sm font-mono font-medium">{vocab.example_pinyin}</div>}
                            {vocab.example_meaning && <div className="text-gray-500 italic text-sm font-medium">{vocab.example_meaning}</div>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                        onClick={() => {
                          setEditingItem(vocab);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 rounded-lg" onClick={() => setDeleteId(vocab.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Advanced Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <span className="text-sm text-gray-500">
            Hiển thị trang <span className="font-medium text-gray-900">{currentPage}</span> trên tổng số {totalPages} trang
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((page, idx) => (
              page === -1 ? (
                <span key={`ellipsis-${idx}`} className="w-9 text-center text-gray-400">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  className={`h-9 w-9 p-0 ${currentPage === page ? "bg-[#ff6933] hover:bg-[#e55022]" : ""}`}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline" size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-xl text-[#2E333D]">
              {editingItem.id ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6 font-sans">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-4 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Hán tự</label>
                <Input
                  value={editingItem.hanzi || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, hanzi: e.target.value })}
                  className="text-2xl font-bold h-12"
                  placeholder="Ví dụ: 你好"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Level</label>
                <Select
                  value={editingItem.hsk_level?.toString() || "1"}
                  onValueChange={(val) => setEditingItem({ ...editingItem, hsk_level: parseInt(val) })}
                >
                  <SelectTrigger className="h-12 bg-gray-50">
                    <SelectValue placeholder="Chọn Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <SelectItem key={level} value={level.toString()}>HSK {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Pinyin</label>
                <Input
                  value={editingItem.pinyin || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, pinyin: e.target.value })}
                  className="font-mono bg-gray-50"
                  placeholder="nǐ hǎo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nghĩa tiếng Việt</label>
                <Input
                  value={editingItem.meaning || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, meaning: e.target.value })}
                  className="bg-gray-50"
                  placeholder="Xin chào"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Link Audio (MP3)</label>
              <Input
                value={editingItem.audio_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, audio_url: e.target.value })}
                className="bg-gray-50"
                placeholder="https://..."
              />
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-4">
              <p className="text-sm font-bold text-[#ff6933] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6933]"></span>
                Ví dụ minh họa
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Câu ví dụ (Hán tự)</label>
                  <Input
                    value={editingItem.example || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, example: e.target.value })}
                    className="bg-white border-orange-200 focus-visible:ring-orange-200"
                    placeholder="你好！"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Phiên âm ví dụ</label>
                    <Input
                      value={editingItem.example_pinyin || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, example_pinyin: e.target.value })}
                      className="bg-white border-orange-200 focus-visible:ring-orange-200 font-mono text-sm"
                      placeholder="Nǐ hǎo!"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Dịch nghĩa ví dụ</label>
                    <Input
                      value={editingItem.example_meaning || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, example_meaning: e.target.value })}
                      className="bg-white border-orange-200 focus-visible:ring-orange-200 text-sm"
                      placeholder="Xin chào!"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
            <Button className="bg-[#ff6933] text-white hover:bg-[#e55022] pl-6 pr-6" onClick={handleSave} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Đang lưu..." : (editingItem.id ? "Lưu thay đổi" : "Thêm mới")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Từ vựng này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Prevent auto-close to handle async
                confirmDelete()
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}
