import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        quiz: true,
        course: true
      },
      orderBy: { completed_at: 'desc' }
    })
    return new Response(JSON.stringify(attempts), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { quiz_id, course_id, score, total_questions } = body

    if (!quiz_id || !course_id) {
      return new Response(JSON.stringify({ error: 'Quiz ID and Course ID are required' }), { status: 400 })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quiz_id: parseInt(quiz_id),
        course_id: parseInt(course_id),
        score: score ? parseInt(score) : null,
        total_questions: total_questions ? parseInt(total_questions) : null
      }
    })

    return new Response(JSON.stringify(attempt), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}