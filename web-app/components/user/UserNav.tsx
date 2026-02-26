"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Gamepad2, GraduationCap, BookOpen, Crown, LayoutDashboard, Menu } from "lucide-react";
import { signOut } from "@/app/(auth)/login/actions"

export function UserNav({ user, role }: { user: any, role?: string }) {
  const props = { role }; // Hack to access role in JSX comfortably without destructuring conflict if any
  const pathname = usePathname();

  const navItems = [
    { href: "/learn", label: "Học tập", icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { href: "/review", label: "Ôn tập", icon: <GraduationCap className="w-4 h-4 mr-2" /> },
    { href: "/games", label: "Games", icon: <Gamepad2 className="w-4 h-4 mr-2" /> },
    { href: "/ranking", label: "Xếp hạng", icon: <Crown className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="h-16 bg-white border-b border-gray-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 lg:gap-3 group flex-shrink-0">
        <div className="w-10 h-10 lg:w-14 lg:h-14 relative group-hover:scale-110 transition-transform duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/teacher-cat.png" alt="Dung Laoshi Logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <div className="flex flex-col">
          <span className="text-base lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff6933] to-[#e65100] tracking-tight drop-shadow-sm group-hover:from-[#ff8a50] group-hover:to-[#ff6d00] transition-all whitespace-nowrap">
            Dung Laoshi
          </span>
          <span className="text-[7px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] lg:tracking-[0.2em] -mt-0.5 lg:-mt-1 group-hover:text-orange-400 transition-colors">Chinese Master</span>
        </div>
      </Link>

      {/* Mobile/Tablet Nav Trigger (visible until lg breakpoint) */}
      <div className="lg:hidden flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-2">
              <Menu className="w-6 h-6 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 mt-2">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={`w-full flex items-center cursor-pointer ${pathname.startsWith(item.href) ? "text-[#ff6933] font-bold" : "text-gray-700"
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Nav (only visible from lg breakpoint) */}
      <div className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors
              ${pathname.startsWith(item.href)
                ? "bg-orange-50 text-[#ff6933]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
            `}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Streak Counter (Mock) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
          <span className="text-base">🔥</span>
          <span className="font-bold text-[#ff6933] text-sm">3 Ngày</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-orange-100 transition-all">
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#ff6933] to-[#ff8c5a] flex items-center justify-center text-white font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-bold truncate">{user.user_metadata?.full_name || "Người học"}</span>
                <span className="text-xs text-gray-400 font-normal truncate">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ học tập</span>
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt tài khoản</span>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            {/* Admin Link */}
            {/* @ts-ignore */}
            {user.role === "admin" || (user.user_metadata?.role === "admin") || (props.role === "admin") ? (
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 cursor-pointer w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Trang quản trị (Admin)</span>
                </Link>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
