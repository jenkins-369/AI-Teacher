import ChatInterface from '@/components/chat/ChatInterface'
import { studyMaterialsApi } from '@/services/api'
import { BookOpen, MessageSquare, Sparkles } from 'lucide-react'

export default async function ChatPage({ searchParams }) {
  const params = await searchParams
  const materialId = params?.material_id

  let initialMaterialId = materialId
  if (!initialMaterialId) {
    try {
      const materials = await studyMaterialsApi.getAll()
      initialMaterialId = materials[0]?.id
    } catch {
      initialMaterialId = null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Chat</h1>
            <p className="text-gray-500 mt-1">Ask questions and get answers from your study materials</p>
          </div>
        </div>
      </div>
      {initialMaterialId ? (
        <ChatInterface materialId={initialMaterialId.toString()} />
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No study materials available</h3>
          <p className="text-gray-500 mb-6">Upload a study material first to start chatting</p>
          <a href="/materials" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Sparkles className="w-4 h-4" />
            Go to Materials
          </a>
        </div>
      )}
    </div>
  )
}