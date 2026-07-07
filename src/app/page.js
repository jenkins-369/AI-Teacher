'use client'

import { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert } from '@/components/ui'
import { 
  BookOpen, FileText, Puzzle, Brain, Zap, HelpCircle, 
  ClipboardList, BarChart3, MessageSquare, GraduationCap,
  Activity, ChevronRight
} from 'lucide-react'
import { dashboardApi } from '@/services/api'

const iconMap = {
  courses: BookOpen,
  materials: FileText,
  chunks: Puzzle,
  summaries: Brain,
  flashcards: Zap,
  quizzes: HelpCircle,
  questions: ClipboardList,
  attempts: BarChart3,
  chats: MessageSquare,
  assignments: GraduationCap,
  progress: Activity
}

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Activity className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  const statCards = [
    { label: 'Courses', value: stats?.courses || 0, href: '/courses', icon: 'courses', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Study Materials', value: stats?.materials || 0, href: '/materials', icon: 'materials', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Document Chunks', value: stats?.chunks || 0, href: '/materials', icon: 'chunks', color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'AI Summaries', value: stats?.summaries || 0, href: '/courses', icon: 'summaries', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Flashcards', value: stats?.flashcards || 0, href: '/flashcards', icon: 'flashcards', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Quizzes', value: stats?.quizzes || 0, href: '/quizzes', icon: 'quizzes', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Quiz Questions', value: stats?.questions || 0, href: '/quizzes', icon: 'questions', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Quiz Attempts', value: stats?.attempts || 0, href: '/quizzes', icon: 'attempts', color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Chat Messages', value: stats?.chats || 0, href: '/chat', icon: 'chats', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Assignments', value: stats?.assignments || 0, href: '/assignments', icon: 'assignments', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Progress Records', value: stats?.progress || 0, href: '/progress', icon: 'progress', color: 'text-cyan-600', bg: 'bg-cyan-50' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Overview of your AI Teacher platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map(card => {
          const IconComponent = iconMap[card.icon]
          return (
            <a
              key={card.label}
              href={card.href}
              className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg ${card.bg}`}>
                    <IconComponent className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}