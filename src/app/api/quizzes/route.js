import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        material: true,
        questions: true,
        attempts: true
      }
    })
    return new Response(JSON.stringify(quizzes), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { material_id, title } = body

    if (!material_id || !title) {
      return new Response(JSON.stringify({ error: 'Material ID and title are required' }), { status: 400 })
    }

    const quiz = await prisma.quiz.create({
      data: {
        material_id: parseInt(material_id),
        title
      }
    })

    return new Response(JSON.stringify(quiz), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}