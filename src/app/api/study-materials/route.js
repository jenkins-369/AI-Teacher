import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const materials = await prisma.studyMaterial.findMany({
      include: {
        course: true,
        summaries: true,
        flashcards: true,
        quizzes: {
          include: { questions: true }
        }
      },
      orderBy: { uploaded_at: 'desc' }
    })
    return new Response(JSON.stringify(materials), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { course_id, title, file_url, file_type, pages } = body

    if (!course_id || !title) {
      return new Response(JSON.stringify({ error: 'Course ID and title are required' }), { status: 400 })
    }

    const material = await prisma.studyMaterial.create({
      data: {
        course_id: parseInt(course_id),
        title,
        file_url,
        file_type,
        pages: pages ? parseInt(pages) : null
      }
    })

    return new Response(JSON.stringify(material), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}