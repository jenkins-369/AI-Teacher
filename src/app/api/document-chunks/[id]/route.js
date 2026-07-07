import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const chunkId = parseInt(id)
    if (isNaN(chunkId)) {
      return new Response(JSON.stringify({ error: 'Invalid chunk ID' }), { status: 400 })
    }

    const chunk = await prisma.documentChunk.findUnique({
      where: { id: chunkId }
    })

    if (!chunk) {
      return new Response(JSON.stringify({ error: 'Chunk not found' }), { status: 404 })
    }

    return new Response(JSON.stringify(chunk), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params

    const chunkId = parseInt(id)
    if (isNaN(chunkId)) {
      return new Response(JSON.stringify({ error: 'Invalid chunk ID' }), { status: 400 })
    }

    const body = await request.json()
    const { chunk_text, page_number } = body

    const chunk = await prisma.documentChunk.update({
      where: { id: chunkId },
      data: {
        chunk_text,
        page_number: page_number ? parseInt(page_number) : undefined
      }
    })

    return new Response(JSON.stringify(chunk), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const chunkId = parseInt(id)
    if (isNaN(chunkId)) {
      return new Response(JSON.stringify({ error: 'Invalid chunk ID' }), { status: 400 })
    }

    await prisma.documentChunk.delete({
      where: { id: chunkId }
    })

    return new Response(JSON.stringify({ message: 'Chunk deleted' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
