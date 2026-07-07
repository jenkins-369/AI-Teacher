'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, Button, LoadingSpinner, Alert } from '@/components/ui'
import { Send, Loader2, User, Bot, FileText, Sparkles } from 'lucide-react'
import { chatApi } from '@/services/api'

export default function ChatInterface({ materialId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [material, setMaterial] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const [historyData, materialsData] = await Promise.all([
        chatApi.getAll(materialId),
        fetch(`/api/study-materials/${materialId}`).then(r => r.json()).catch(() => null)
      ])
      setMessages(historyData)
      if (materialsData) setMaterial(materialsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [materialId])

  const sendMessage = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')

    const optimisticMsg = { id: Date.now(), user_message: input, ai_response: null }
    setMessages(prev => [...prev, optimisticMsg])
    setInput('')

    try {
      const data = await chatApi.sendMessage({
        material_id: parseInt(materialId),
        user_message: input
      })
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m))
    } catch (err) {
      setError(err.message)
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <Card className="flex-1 overflow-hidden flex flex-col mb-4">
        {material && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Chatting about:</span>
            <span className="text-sm font-medium text-gray-900">{material.title}</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner />
              <p className="mt-4 text-gray-500 text-sm">Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Start a conversation</h3>
              <p className="text-gray-500 max-w-sm">
                Ask questions about your study material and get instant AI-powered answers
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, index) => (
                <div key={m.id || index} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">You</p>
                      <p className="text-gray-900 leading-relaxed">{m.user_message}</p>
                    </div>
                  </div>
                  {m.ai_response && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">AI Teacher</p>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{m.ai_response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-700">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </Card>

      {error && <Alert message={error} type="error" onClose={() => setError('')} className="mb-4" />}

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a question about your study material..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          disabled={loading || loadingHistory}
        />
        <Button 
          onClick={sendMessage} 
          disabled={loading || !input.trim() || loadingHistory}
          className="flex items-center gap-2 px-6"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}