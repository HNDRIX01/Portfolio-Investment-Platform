"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📈" },
  { label: "Projects", href: "/dashboard/projects", icon: "📁" },
  { label: "Transactions", href: "/dashboard/transactions", icon: "💳" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen bg-white text-black transition-all duration-200 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <div className={cn("text-xl font-bold", isCollapsed ? "hidden" : "block")}>
            Logo
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-black"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center py-3 px-4 transition-colors",
                  isActive
                    ? "bg-gray-300 border-l-4 border-[#8B0000]"
                    : "hover:bg-gray-100",
                )}
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className={cn("whitespace-nowrap", isCollapsed ? "hidden" : "block")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
