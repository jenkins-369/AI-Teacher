'use client'

import { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert, Modal } from '@/components/ui'
import { 
  Plus, BookOpen, HelpCircle, Trash2, ArrowLeft, Search,
  Zap, Layers, ChevronRight, RefreshCw
} from 'lucide-react'
import FlashcardViewer from '@/components/flashcard/FlashcardViewer'
import { studyMaterialsApi, flashcardsApi } from '@/services/api'

export default function FlashcardsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMaterialId, setSelectedMaterialId] = useState(null)
  const [error, setError] = useState('')
  const [deletingCardId, setDeletingCardId] = useState(null)
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
    if (!deletingCardId) return
    try {
      await flashcardsApi.delete(deletingCardId)
      setDeletingCardId(null)
      fetchMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading flashcards...</p>
      </div>
    )
  }

  if (selectedMaterialId) {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="secondary" 
            onClick={() => setSelectedMaterialId(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Materials
          </Button>
        </div>
        <FlashcardViewer materialId={selectedMaterialId} />
      </div>
    )
  }

  const totalFlashcards = materials.reduce((acc, m) => acc + (m.flashcards || []).length, 0)

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.flashcards || []).some(card => 
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesSearch
  })

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
            <p className="mt-1 text-gray-500">
              {totalFlashcards > 0 
                ? `${totalFlashcards} flashcard${totalFlashcards !== 1 ? 's' : ''} across ${materials.length} material${materials.length !== 1 ? 's' : ''}`
                : 'Reinforce learning with flashcards generated from your study materials'}
            </p>
          </div>
          {totalFlashcards > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span>{totalFlashcards} total flashcard{totalFlashcards !== 1 ? 's' : ''}</span>
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
              placeholder="Search flashcards..."
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
          <p className="text-gray-500 mb-6">Create study materials first to generate flashcards</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-1">No flashcards found</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMaterials.map(material => {
            const materialFlashcards = (material.flashcards || []).filter(card =>
              card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
            const hasVisibleCards = materialFlashcards.length > 0 || !searchQuery

            if (!hasVisibleCards && searchQuery) return null

            return (
              <Card key={material.id} className="overflow-hidden">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-yellow-50 rounded-lg shrink-0">
                    <Layers className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">{material.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {material.file_type || 'Material'} • {material.pages || 0} pages
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {(material.flashcards || []).length} flashcard{(material.flashcards || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedMaterialId(material.id)}
                    className="flex items-center gap-2 shrink-0"
                    disabled={(material.flashcards || []).length === 0}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Study
                  </Button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {materialFlashcards.length > 0 ? (
                    <div className="space-y-3">
                      {materialFlashcards.map(card => (
                        <div
                          key={card.id}
                          className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 bg-white rounded-md shadow-sm shrink-0 mt-0.5">
                                <HelpCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">Q: {card.question}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">A: {card.answer}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 sm:shrink-0">
                            <Button 
                              variant="danger" 
                              size="sm"
                              className="flex items-center gap-1.5"
                              onClick={() => setDeletingCardId(card.id)}
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
                      <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'No flashcards match your search' : 'No flashcards generated yet for this material'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {deletingCardId && (
        <Modal title="Delete Flashcard" onClose={() => setDeletingCardId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the flashcard.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeletingCardId(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
