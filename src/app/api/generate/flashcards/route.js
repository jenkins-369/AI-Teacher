import prisma from "@/lib/prisma";
import { generateJson } from "@/lib/gemini";
import { FlashcardSchema } from "@/lib/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const { material_id, count = 4 } = body;

    if (!material_id) {
      return new Response(
        JSON.stringify({ error: "Material ID is required" }),
        { status: 400 },
      );
    }

    const material = await prisma.studyMaterial.findUnique({
      where: { id: parseInt(material_id) },
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
            "No content available to generate flashcards. Please add document chunks first.",
        }),
        { status: 400 },
      );
    }

    const safeCount = Math.min(count, 20);

    const prompt = `Generate unique ${safeCount} flashcards based on the following educational content. Each flashcard should have a question, answer, and difficulty level (easy, medium, or hard).\n\nContent:\n${content}`;

    const result = await generateJson(prompt, FlashcardSchema);

    const created = await prisma.$transaction(
      result.flashcards.map((f) =>
        prisma.flashcard.create({
          data: {
            material_id: parseInt(material_id),
            question: f.question.trim(),
            answer: f.answer.trim(),
            difficulty: f.difficulty || "medium",
          },
        }),
      ),
    );

    return new Response(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate flashcards",
      }),
      { status: 500 },
    );
  }
}
