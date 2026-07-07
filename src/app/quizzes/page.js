'use client'

import { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert, Modal } from '@/components/ui'
import { 
  Plus, BookOpen, HelpCircle, Trash2, ArrowLeft, Search,
  Clock, FileQuestion, Trophy, RefreshCw
} from 'lucide-react'
import QuizTaker from '@/components/quiz/QuizTaker'
import { studyMaterialsApi, quizzesApi } from '@/services/api'

export default function QuizPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [error, setError] = useState('')
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMaterials = async () => {
    try {
      const data = await studyMaterialsApi.getAll()
      setMaterials(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleDelete = async () => {
    if (!deletingQuizId) return
    try {
      await quizzesApi.delete(deletingQuizId)
      setDeletingQuizId(null)
      fetchMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.quizzes || []).some(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading quizzes...</p>
      </div>
    )
  }

  if (selectedQuizId) {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="secondary" 
            onClick={() => setSelectedQuizId(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Button>
        </div>
        <QuizTaker quizId={selectedQuizId} />
      </div>
    )
  }

  const totalQuizzes = materials.reduce((acc, m) => acc + (m.quizzes || []).length, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="mt-1 text-gray-500">
              {totalQuizzes > 0 
                ? `${totalQuizzes} quiz${totalQuizzes !== 1 ? 'es' : ''} available across ${materials.length} materials`
                : 'Test your knowledge with quizzes generated from study materials'}
            </p>
          </div>
          {materials.some(m => (m.quizzes || []).length > 0) && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>{totalQuizzes} total quiz{totalQuizzes !== 1 ? 'es' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />
      )}

      {materials.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No study materials available</h3>
          <p className="text-gray-500 mb-6">Create study materials first to generate quizzes</p>
          <Button onClick={() => window.location.href = '/materials'} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Go to Materials
          </Button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No quizzes found</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMaterials.map(material => {
            const materialQuizzes = (material.quizzes || []).filter(q =>
              q.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            const hasVisibleQuizzes = materialQuizzes.length > 0 || !searchQuery

            if (!hasVisibleQuizzes && searchQuery) return null

            return (
              <Card key={material.id} className="overflow-hidden">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg shrink-0">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">{material.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {material.file_type || 'Material'} • {material.pages || 0} pages
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {materialQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {materialQuizzes.map(quiz => (
                        <div
                          key={quiz.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
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
                              onClick={() => setSelectedQuizId(quiz.id)}
                              className="flex items-center gap-1.5"
                            >
                              <HelpCircle className="w-4 h-4" />
                              Take Quiz
                            </Button>
                            <Button 
                              variant="danger" 
                              className="flex items-center gap-1.5"
                              onClick={() => setDeletingQuizId(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileQuestion className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'No quizzes match your search' : 'No quizzes generated yet for this material'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {deletingQuizId && (
        <Modal title="Delete Quiz" onClose={() => setDeletingQuizId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the quiz and all associated attempts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeletingQuizId(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}