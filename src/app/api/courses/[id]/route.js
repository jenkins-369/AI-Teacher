import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return new Response(JSON.stringify({ error: 'Invalid course ID' }), { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        studyMaterials: {
          include: {
            summaries: true,
            flashcards: true,
            quizzes: {
              include: { questions: true }
            },
            chatHistory: true
          }
        },
        assignments: true,
        studentProgress: true
      }
    })

    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(course), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params

    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return new Response(JSON.stringify({ error: 'Invalid course ID' }), { status: 400 })
    }

    const body = await request.json()
    const { title, description, category, difficulty } = body

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description, category, difficulty }
    })

    return new Response(JSON.stringify(course), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return new Response(JSON.stringify({ error: 'Invalid course ID' }), { status: 400 })
    }

    await prisma.course.delete({
      where: { id: courseId }
    })

    return new Response(JSON.stringify({ message: 'Course deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}