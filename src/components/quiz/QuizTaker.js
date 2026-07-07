'use client'

import { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert } from '@/components/ui'
import { quizzesApi, quizAttemptsApi, progressApi } from '@/services/api'

export default function QuizTaker({ quizId }) {
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const fetchQuiz = async () => {
    try {
      const data = await quizzesApi.get(quizId)
      setQuiz(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const score = Object.entries(answers).reduce((acc, [qid, ans]) => {
        const question = quiz.questions.find(q => q.id === parseInt(qid))
        return acc + (question?.correct_option === ans ? 1 : 0)
      }, 0)

      await quizAttemptsApi.create({
        quiz_id: parseInt(quizId),
        course_id: quiz.material?.course_id,
        score,
        total_questions: quiz.questions.length
      })

      await progressApi.upsert({
        course_id: quiz.material?.course_id
      })

      setResult({ score, total: quiz.questions.length })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (result) {
    return (
      <Card>
        <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
        <p className="text-2xl mb-2">{result.score} / {result.total}</p>
        <p className="text-gray-600">({Math.round(result.score / result.total * 100)}%)</p>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {error && <Alert message={error} type="error" />}
      <h2 className="text-2xl font-bold mb-4">{quiz?.title}</h2>
      {quiz?.questions.map((q, idx) => (
        <Card key={q.id}>
          <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
          <div className="space-y-2">
            {['A', 'B', 'C', 'D'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleAnswer(q.id, opt)}
                  className="w-4 h-4"
                />
                <span>{q[`option_${opt.toLowerCase()}`]}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}
      <Button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length !== quiz?.questions.length}>
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </Button>
    </div>
  )
}