"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Camera, Save, User, GraduationCap, Mail, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { getProfile, updateProfile, uploadAvatar } from "./actions"

const HSK_LEVELS = [
  { value: 1, label: "HSK 1", icon: "🌱", desc: "Cơ bản" },
  { value: 2, label: "HSK 2", icon: "🎋", desc: "Sơ cấp" },
  { value: 3, label: "HSK 3", icon: "🔮", desc: "Trung cấp" },
  { value: 4, label: "HSK 4", icon: "⚡", desc: "Trung cao" },
  { value: 5, label: "HSK 5", icon: "🔥", desc: "Cao cấp" },
  { value: 6, label: "HSK 6", icon: "🐲", desc: "Thành thạo" },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [fullName, setFullName] = useState("")
  const [hskLevel, setHskLevel] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const data = await getProfile()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setHskLevel(data.current_hsk_level || 1)
        setAvatarUrl(data.avatar_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const result = await updateProfile({ full_name: fullName, current_hsk_level: hskLevel })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn! Tối đa 5MB.")
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setAvatarUrl(base64) // Preview immediately
      const result = await uploadAvatar(base64, file.name)
      if (result.error) {
        alert("Lỗi upload: " + result.error)
        setAvatarUrl(profile?.avatar_url || null) // Revert preview
      } else if (result.success && result.url) {
        setAvatarUrl(result.url)
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📝</div>
          <p className="text-[#6b5c35] font-bold animate-pulse">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  const hasChanges = fullName !== (profile?.full_name || "") || hskLevel !== (profile?.current_hsk_level || 1)

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1d180c]">Hồ Sơ Học Tập</h1>
        <p className="text-[#6b5c35]">Chỉnh sửa thông tin cá nhân của bạn</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#f0ebe0] shadow-sm overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-[#ffc629] to-[#ffaa00] px-6 pt-8 pb-16 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        </div>
        <div className="px-6 pb-8 -mt-14">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-[#1dc9ac] to-[#15867E] flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">{(fullName || "?")[0].toUpperCase()}</span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-[#1d180c] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e7564a] transition-colors cursor-pointer border-3 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-[#9c9278] mt-2">Nhấn 📷 để thay đổi ảnh đại diện</p>
          </div>

          {/* Form */}
          <div className="mt-8 space-y-6">
            {/* Email (readonly) */}
            <div>
              <label className="text-xs font-bold text-[#9c9278] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <div className="px-4 py-3 rounded-xl bg-[#f9f7f2] border border-[#f0ebe0] text-[#6b5c35] text-sm">
                {profile?.email || "—"}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-[#9c9278] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" /> Tên hiển thị
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên hiển thị..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0ebe0] focus:border-[#ffc629] focus:ring-2 focus:ring-[#ffc629]/20 outline-none text-[#1d180c] font-medium transition-all"
              />
            </div>

            {/* HSK Level */}
            <div>
              <label className="text-xs font-bold text-[#9c9278] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-3.5 h-3.5" /> Cấp độ HSK hiện tại
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {HSK_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setHskLevel(level.value)}
                    className={`p-3 rounded-xl text-center transition-all cursor-pointer border-2 ${hskLevel === level.value
                      ? "bg-[#ffc629]/20 border-[#ffc629] shadow-md scale-105"
                      : "bg-white border-[#f0ebe0] hover:border-[#ffc629]/40"
                      }`}
                  >
                    <span className="text-lg block">{level.icon}</span>
                    <span className="text-xs font-bold text-[#1d180c] block">{level.label}</span>
                    <span className="text-[9px] text-[#9c9278]">{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="flex items-center gap-2 text-xs text-[#9c9278] border-t border-[#f0ebe0] pt-4">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ngày tham gia: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : "—"}</span>
            </div>

            {/* Save Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${saved
                ? "bg-green-500 text-white"
                : hasChanges
                  ? "bg-[#1d180c] text-[#ffc629] hover:bg-[#332c1f] shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Đã lưu thành công!</>
              ) : (
                <><Save className="w-4 h-4" /> Lưu thay đổi</>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
