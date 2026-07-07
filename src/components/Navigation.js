'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { GraduationCap, Menu, X } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/courses", label: "Courses" },
    { href: "/materials", label: "Materials" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/assignments", label: "Assignments" },
    { href: "/progress", label: "Progress" },
  ]

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 mr-8">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Teacher</span>
            </a>
            <div className="hidden md:flex md:space-x-1">
              {links.map((link) => {
                const active = isActive(link.href)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => {
              const active = isActive(link.href)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
