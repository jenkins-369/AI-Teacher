import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { quiz_id, questions } = body

    if (!quiz_id || !questions || !Array.isArray(questions)) {
      return new Response(JSON.stringify({ error: 'Quiz ID and questions array are required' }), { status: 400 })
    }

    const createdQuestions = await prisma.$transaction(
      questions.map(q =>
        prisma.quizQuestion.create({
          data: {
            quiz_id: parseInt(quiz_id),
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            explanation: q.explanation
          }
        })
      )
    )

    return new Response(JSON.stringify(createdQuestions), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}