'use client'

import { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert } from '@/components/ui'
import { ChevronLeft, ChevronRight, Check, RotateCcw, Layers } from 'lucide-react'
import { flashcardsApi, studyMaterialsApi } from '@/services/api'

export default function FlashcardViewer({ materialId }) {
  const [flashcards, setFlashcards] = useState([])
  const [material, setMaterial] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    if (!materialId) {
      setLoading(false)
      return
    }
    try {
      const [materialData, cardsData] = await Promise.all([
        studyMaterialsApi.get(materialId),
        flashcardsApi.getAll(materialId)
      ])
      setMaterial(materialData)
      setFlashcards(cardsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [materialId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading flashcards...</p>
      </div>
    )
  }

  if (!materialId) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Layers className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">No study materials available.</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-yellow-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Layers className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No flashcards yet</h3>
        <p className="text-gray-500">Generate flashcards from study materials to start studying</p>
      </div>
    )
  }

  const current = flashcards[currentIndex]

  return (
    <div>
      {error && <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />}
      
      <div className="mb-6">
        {material && (
          <p className="text-sm text-gray-500">Study Material: <span className="font-medium text-gray-700">{material.title}</span></p>
        )}
      </div>

      <Card className="max-w-lg mx-auto mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
            {current.difficulty || 'medium'}
          </span>
        </div>

        <div className="min-h-48 flex items-center justify-center py-6">
          <div className="text-center px-4">
            <p className="text-xl font-medium text-gray-900 mb-2">
              {showAnswer ? 'Answer' : 'Question'}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {showAnswer ? current.answer : current.question}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setShowAnswer(false); }}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-1.5"
          >
            {showAnswer ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Show Question
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Show Answer
              </>
            )}
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => { setCurrentIndex(i => Math.min(flashcards.length - 1, i + 1)); setShowAnswer(false); }}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
