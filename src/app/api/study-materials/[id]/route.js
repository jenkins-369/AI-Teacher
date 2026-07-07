import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const materialId = parseInt(id)
    if (isNaN(materialId)) {
      return new Response(JSON.stringify({ error: 'Invalid study material ID' }), { status: 400 })
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
      include: {
        course: true,
        chunks: true,
        summaries: true,
        flashcards: true,
        quizzes: {
          include: { questions: true }
        },
        chatHistory: true
      }
    })

    if (!material) {
      return new Response(JSON.stringify({ error: 'Study material not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(material), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params

    const materialId = parseInt(id)
    if (isNaN(materialId)) {
      return new Response(JSON.stringify({ error: 'Invalid study material ID' }), { status: 400 })
    }

    const body = await request.json()
    const { title, file_url, file_type, pages } = body

    const material = await prisma.studyMaterial.update({
      where: { id: materialId },
      data: {
        title,
        file_url,
        file_type,
        pages: pages ? parseInt(pages) : null
      }
    })

    return new Response(JSON.stringify(material), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const materialId = parseInt(id)
    if (isNaN(materialId)) {
      return new Response(JSON.stringify({ error: 'Invalid study material ID' }), { status: 400 })
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: materialId },
      include: {
        quizzes: true
      }
    })

    if (!material) {
      return new Response(JSON.stringify({ error: 'Study material not found' }), { status: 404 })
    }

    const quizIds = material.quizzes.map(q => q.id)

    await prisma.$transaction([
      prisma.chatHistory.deleteMany({ where: { material_id: materialId } }),
      prisma.quizAttempt.deleteMany({ where: { quiz_id: { in: quizIds } } }),
      prisma.quizQuestion.deleteMany({ where: { quiz_id: { in: quizIds } } }),
      prisma.quiz.deleteMany({ where: { id: { in: quizIds } } }),
      prisma.flashcard.deleteMany({ where: { material_id: materialId } }),
      prisma.documentChunk.deleteMany({ where: { material_id: materialId } }),
      prisma.aiSummary.deleteMany({ where: { material_id: materialId } }),
      prisma.studyMaterial.delete({ where: { id: materialId } }),
    ])

    return new Response(JSON.stringify({ message: 'Study material deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}