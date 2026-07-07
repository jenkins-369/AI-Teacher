import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/gemini";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const material_id = searchParams.get("material_id");

    const where = material_id ? { material_id: parseInt(material_id) } : {};

    const chats = await prisma.chatHistory.findMany({
      where,
      orderBy: { created_at: "asc" },
    });
    return new Response(JSON.stringify(chats), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { material_id, user_message } = body;

    if (!material_id || !user_message) {
      return new Response(
        JSON.stringify({ error: "Material ID and user message are required" }),
        { status: 400 },
      );
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: parseInt(material_id) },
    });

    if (!material) {
      return new Response(
        JSON.stringify({ error: "Study material not found" }),
        { status: 400 },
      );
    }

    const chunks = await prisma.documentChunk.findMany({
      where: { material_id: parseInt(material_id) },
      select: { chunk_text: true },
    });

    const context = chunks.map((c) => c.chunk_text).join("\n\n");
    const prompt = `You are an AI Teacher. Use the following context to answer the user's question. If the context is not relevant, provide fully plain text educational response.\n\nContext:\n${context}\n\nUser Question: ${user_message}`;

    const ai_response = await generateContent(prompt, {
      maxOutputTokens: 1000,
    });

    const chat = await prisma.chatHistory.create({
      data: {
        material_id: parseInt(material_id),
        user_message,
        ai_response,
      },
    });

    return new Response(JSON.stringify(chat), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
