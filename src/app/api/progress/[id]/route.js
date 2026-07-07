import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const progressId = parseInt(id)
    if (isNaN(progressId)) {
      return new Response(JSON.stringify({ error: 'Invalid progress ID' }), { status: 400 })
    }

    const progress = await prisma.studentProgress.findUnique({
      where: { id: progressId },
      include: {
        course: true
      }
    })

    if (!progress) {
      return new Response(JSON.stringify({ error: 'Progress not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(progress), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const progressId = parseInt(id)
    if (isNaN(progressId)) {
      return new Response(JSON.stringify({ error: 'Invalid progress ID' }), { status: 400 })
    }

    await prisma.studentProgress.delete({
      where: { id: progressId }
    })

    return new Response(JSON.stringify({ message: 'Progress deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
