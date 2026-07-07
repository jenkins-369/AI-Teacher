import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const flashcards = await prisma.flashcard.findMany({
      include: {
        material: true
      }
    })
    return new Response(JSON.stringify(flashcards), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { material_id, flashcards, question, answer, difficulty } = body

    if (!material_id) {
      return new Response(JSON.stringify({ error: 'Material ID is required' }), { status: 400 })
    }

    const items = Array.isArray(flashcards)
      ? flashcards
      : question
        ? [{ question, answer, difficulty }]
        : []

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'Flashcard data is required' }), { status: 400 })
    }

    const created = await prisma.$transaction(
      items.map(f =>
        prisma.flashcard.create({
          data: {
            material_id: parseInt(material_id),
            question: f.question,
            answer: f.answer,
            difficulty: f.difficulty
          }
        })
      )
    )

    return new Response(JSON.stringify(created), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}