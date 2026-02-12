import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import { useUIStore } from '../../store/authStore'

export default function Layout() {
  const { sidebarOpen, closeSidebar } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}
