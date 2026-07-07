import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        studyMaterials: true,
        assignments: true
      },
      orderBy: { created_at: 'desc' }
    })
    return new Response(JSON.stringify(courses), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, category, difficulty } = body

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        difficulty
      }
    })

    return new Response(JSON.stringify(course), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}