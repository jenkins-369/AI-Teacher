'use client'

import { useState, useEffect } from 'react'
import { Card, LoadingSpinner, Alert, Button } from '@/components/ui'
import { HelpCircle, Trash2, Plus, FileQuestion } from 'lucide-react'
import { quizzesApi } from '@/services/api'

export default function QuizManager({ materialId, refreshKey }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchQuizzes = async () => {
    try {
      const data = await quizzesApi.getAll()
      setQuizzes(data.filter(q => q.material_id === parseInt(materialId)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [materialId, refreshKey])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      {error && <Alert message={error} type="error" onClose={() => setError('')} className="mb-4" />}

      {quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <FileQuestion className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{quiz.title}</p>
                  <p className="text-sm text-gray-500">
                    {quiz.questions?.length || 0} question{(quiz.questions?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = `/quizzes?quiz_id=${quiz.id}`}
                  className="flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Quiz
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileQuestion className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No quizzes yet. Generate a quiz from study materials.
          </p>
        </div>
      )}
    </div>
  )
}
