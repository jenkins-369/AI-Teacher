import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [
      courses,
      materials,
      chunks,
      summaries,
      flashcards,
      quizzes,
      questions,
      attempts,
      chats,
      assignments,
      progress,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.studyMaterial.count(),
      prisma.documentChunk.count(),
      prisma.aiSummary.count(),
      prisma.flashcard.count(),
      prisma.quiz.count(),
      prisma.quizQuestion.count(),
      prisma.quizAttempt.count(),
      prisma.chatHistory.count(),
      prisma.assignment.count(),
      prisma.studentProgress.count(),
    ])

    return new Response(JSON.stringify({
      courses,
      materials,
      chunks,
      summaries,
      flashcards,
      quizzes,
      questions,
      attempts,
      chats,
      assignments,
      progress
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
