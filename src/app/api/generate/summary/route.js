import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/gemini";
import { SummarySchema } from "@/lib/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const { material_id } = body;

    if (!material_id) {
      return new Response(
        JSON.stringify({ error: "Material ID is required" }),
        { status: 400 },
      );
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: parseInt(material_id) },
      include: {
        summaries: true,
      },
    });

    if (!material) {
      return new Response(
        JSON.stringify({ error: "Study material not found" }),
        { status: 404 },
      );
    }

    const chunks = await prisma.documentChunk.findMany({
      where: { material_id: parseInt(material_id) },
    });

    const content = chunks.map((c) => c.chunk_text).join("\n\n");

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No content available to generate summary. Please add document chunks first.",
        }),
        { status: 400 },
      );
    }

    const prompt = `Generate fully plain text summary of the following educational content.\n\nContent:\n${content}`;

    const validated = await generateContent(prompt, { maxOutputTokens: 200 });

    const aiSummary = await prisma.aiSummary.create({
      data: {
        material_id: parseInt(material_id),
        summary: validated,
      },
    });

    return new Response(JSON.stringify(aiSummary), { status: 201 });
  } catch (error) {
    console.error("Summary generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate summary" }),
      { status: 500 },
    );
  }
}
