"use client";

import { useState, useEffect } from 'react'
import { LoadingSpinner, Card } from '@/components/ui'
import { quizAttemptsApi } from '@/services/api'

export default function QuizAttemptsPage() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await quizAttemptsApi.getAll()
        setAttempts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading quiz attempts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quiz Attempts</h2>
      <div className="space-y-4">
        {attempts.map(attempt => (
          <Card key={attempt.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{attempt.quiz?.title || `Quiz #${attempt.quiz_id}`}</h3>
                <p className="text-sm text-gray-600">{attempt.course?.title || `Course #${attempt.course_id}`}</p>
                <p className="text-xs text-gray-500 mt-1">Score: {attempt.score} / {attempt.total_questions} ({attempt.total_questions ? Math.round(attempt.score / attempt.total_questions * 100) : 0}%)</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(attempt.completed_at).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ))}
        {attempts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No quiz attempts yet. Take a quiz to see your results here.</p>
        )}
      </div>
    </div>
  )
}
