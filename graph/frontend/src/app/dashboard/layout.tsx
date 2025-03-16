import type React from "react"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 transition-all duration-200 ease-in-out ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

