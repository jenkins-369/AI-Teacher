import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const quizId = parseInt(id)
    if (isNaN(quizId)) {
      return new Response(JSON.stringify({ error: 'Invalid quiz ID' }), { status: 400 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        material: true,
        questions: true,
        attempts: true
      }
    })

    if (!quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(quiz), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const quizId = parseInt(id)
    if (isNaN(quizId)) {
      return new Response(JSON.stringify({ error: 'Invalid quiz ID' }), { status: 400 })
    }

    await prisma.quiz.delete({
      where: { id: quizId }
    })

    return new Response(JSON.stringify({ message: 'Quiz deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
