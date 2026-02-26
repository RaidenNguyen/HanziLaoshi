"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Shield, ShieldAlert, User, MoreHorizontal, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { UserProfile } from "./actions"
import { updateUserRole, deleteUser } from "./actions"

export function UsersTable({ initialData }: { initialData: UserProfile[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Update Role State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<"user" | "admin">("user")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredData = initialData.filter((user) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setIsUpdating(true)
    const result = await updateUserRole(selectedUser.id, newRole)
    setIsUpdating(false)

    if (result.success) {
      toast.success(`Đã cập nhật quyền cho ${selectedUser.full_name || selectedUser.email}`)
      setIsDialogOpen(false)
      // Optimistically update or just wait for revalidatePath
      // RevalidatePath in action handles refresh
    } else {
      toast.error("Lỗi cập nhật: " + result.error)
    }
  }

  const openRoleDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteUser(deleteTarget.id)
    setIsDeleting(false)
    if (result.success) {
      toast.success(`Đã xóa ${deleteTarget.full_name || deleteTarget.email}`)
      setIsDeleteDialogOpen(false)
    } else {
      toast.error(result.error || "Xóa thất bại")
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-[300px] transition-all focus-within:ring-2 focus-within:ring-[#ff6933]/20 rounded-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            className="pl-9 bg-gray-50 border-gray-200 h-9 focus-visible:ring-0 focus-visible:border-[#ff6933]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9 bg-white border-gray-200">
            <SelectValue placeholder="Lọc theo quyền" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả quyền</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-[280px] font-bold text-gray-800">Người dùng</TableHead>
              <TableHead className="w-[150px] font-bold text-gray-800 hidden sm:table-cell">Email</TableHead>
              <TableHead className="w-[80px] font-bold text-gray-800">HSK</TableHead>
              <TableHead className="w-[100px] font-bold text-gray-800">Quyền hạn</TableHead>
              <TableHead className="w-[120px] font-bold text-gray-800 hidden md:table-cell">Ngày tham gia</TableHead>
              <TableHead className="text-right font-bold text-gray-800 pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-gray-300" />
                    <p className="font-medium text-gray-600">Không tìm thấy người dùng nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-[#ff6933] font-bold text-sm overflow-hidden shrink-0">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : (user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "?"))
                        }
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-gray-900 truncate">{user.full_name || "Chưa đặt tên"}</span>
                        <span className="text-xs text-gray-500 font-mono sm:hidden truncate">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 hidden sm:table-cell">{user.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      HSK {user.current_hsk_level || 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                      {user.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'admin' ? "Admin" : "User"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                          Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Đổi quyền hạn
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => { setDeleteTarget(user); setIsDeleteDialogOpen(true) }}
                          className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thay đổi quyền hạn</DialogTitle>
            <DialogDescription>
              Cập nhật quyền cho người dùng <strong>{selectedUser?.full_name || selectedUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div onClick={() => setNewRole("user")} className={`
                cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between
                ${newRole === "user" ? "border-[#ff6933] bg-orange-50 ring-1 ring-[#ff6933]" : "border-gray-200 hover:border-gray-300"}
              `}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md border border-gray-100"><User className="w-4 h-4 text-gray-600" /></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">User (Học viên)</p>
                    <p className="text-xs text-gray-500">Chỉ xem nội dung và học tập</p>
                  </div>
                </div>
                {newRole === "user" && <Check className="w-4 h-4 text-[#ff6933]" />}
              </div>

              <div onClick={() => setNewRole("admin")} className={`
                cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between
                ${newRole === "admin" ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500" : "border-gray-200 hover:border-gray-300"}
              `}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md border border-gray-100"><ShieldAlert className="w-4 h-4 text-purple-600" /></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Admin (Quản trị)</p>
                    <p className="text-xs text-gray-500">Toàn quyền hệ thống</p>
                  </div>
                </div>
                {newRole === "admin" && <Check className="w-4 h-4 text-purple-600" />}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isUpdating}
              className={newRole === "admin" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-[#ff6933] hover:bg-[#e55022] text-white"}
            >
              {isUpdating ? "Đang lưu..." : "Xác nhận thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>?
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu học tập của người dùng sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Hủy bỏ</Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
