'use client'

import { useState, useEffect } from 'react'
import { Card, LoadingSpinner, Alert } from '@/components/ui'
import { progressApi } from '@/services/api'

export default function ProgressTracker({ courseId }) {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProgress = async () => {
    try {
      const data = await progressApi.getAll()
      const courseProgress = data.find(p => p.course_id === parseInt(courseId))
      setProgress(courseProgress)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [courseId])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {error && <Alert message={error} type="error" onClose={() => setError('')} />}

      {progress ? (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${(progress.completion_percent || 0) * 100}%` }}></div>
          </div>
          <p className="text-sm text-gray-600">{(progress.completion_percent * 100).toFixed(0)}% average score</p>
          <p className="text-sm text-gray-600">{progress.quizzes_completed || 0} of {progress.total_quizzes || 0} activities completed</p>
          <p className="text-xs text-gray-500 mt-1">
            {progress.quiz_attempts || 0} quizzes • {progress.assignment_submissions || 0} assignments
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No progress recorded yet. Complete quizzes and assignments to see your progress.</p>
      )}
    </div>
  )
}
