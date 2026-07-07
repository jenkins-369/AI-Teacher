import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const material_id = searchParams.get('material_id')

    if (!material_id) {
      return new Response(JSON.stringify({ error: 'Material ID is required' }), { status: 400 })
    }

    const chunks = await prisma.documentChunk.findMany({
      where: { material_id: parseInt(material_id) },
      orderBy: { page_number: 'asc' }
    })

    return new Response(JSON.stringify(chunks), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { material_id, chunks } = body

    if (!material_id || !chunks || !Array.isArray(chunks)) {
      return new Response(JSON.stringify({ error: 'Material ID and chunks array are required' }), { status: 400 })
    }

    const existingChunks = await prisma.documentChunk.findMany({
      where: { material_id: parseInt(material_id) },
      orderBy: { page_number: 'desc' },
      take: 1
    })

    const lastPageNumber = existingChunks.length > 0 ? existingChunks[0].page_number || 0 : 0

    const created = await prisma.$transaction(
      chunks.map((c, index) =>
        prisma.documentChunk.create({
          data: {
            material_id: parseInt(material_id),
            chunk_text: c.text,
            page_number: c.page_number || (lastPageNumber + index + 1),
            embedding_id: c.embedding_id
          }
        })
      )
    )

    return new Response(JSON.stringify(created), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}