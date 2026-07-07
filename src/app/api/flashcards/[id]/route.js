import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const flashcardId = parseInt(id)
    if (isNaN(flashcardId)) {
      return new Response(JSON.stringify({ error: 'Invalid flashcard ID' }), { status: 400 })
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        material: true
      }
    })

    if (!flashcard) {
      return new Response(JSON.stringify({ error: 'Flashcard not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(flashcard), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params

    const flashcardId = parseInt(id)
    if (isNaN(flashcardId)) {
      return new Response(JSON.stringify({ error: 'Invalid flashcard ID' }), { status: 400 })
    }

    const body = await request.json()
    const { question, answer, difficulty } = body

    if (!question || !answer) {
      return new Response(JSON.stringify({ error: 'Question and answer are required' }), { status: 400 })
    }

    const flashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        question,
        answer,
        difficulty
      }
    })

    return new Response(JSON.stringify(flashcard), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const flashcardId = parseInt(id)
    if (isNaN(flashcardId)) {
      return new Response(JSON.stringify({ error: 'Invalid flashcard ID' }), { status: 400 })
    }

    await prisma.flashcard.delete({
      where: { id: flashcardId }
    })

    return new Response(JSON.stringify({ message: 'Flashcard deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
