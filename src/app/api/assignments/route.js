import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: true
      }
    })
    return new Response(JSON.stringify(assignments), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { course_id, title, instructions, due_date } = body

    if (!course_id || !title) {
      return new Response(JSON.stringify({ error: 'Course ID and title are required' }), { status: 400 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        course_id: parseInt(course_id),
        title,
        instructions,
        due_date: due_date ? new Date(due_date) : null
      }
    })

    return new Response(JSON.stringify(assignment), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}