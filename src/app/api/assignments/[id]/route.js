import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const assignmentId = parseInt(id)
    if (isNaN(assignmentId)) {
      return new Response(JSON.stringify({ error: 'Invalid assignment ID' }), { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true
      }
    })

    if (!assignment) {
      return new Response(JSON.stringify({ error: 'Assignment not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(assignment), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const assignmentId = parseInt(id)
    if (isNaN(assignmentId)) {
      return new Response(JSON.stringify({ error: 'Invalid assignment ID' }), { status: 400 })
    }

    await prisma.assignment.delete({
      where: { id: assignmentId }
    })

    return new Response(JSON.stringify({ message: 'Assignment deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
