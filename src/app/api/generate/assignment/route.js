import prisma from "@/lib/prisma";
import { generateJson } from "@/lib/gemini";
import { AssignmentSchema } from "@/lib/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const { material_id, count = 3 } = body;

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
            "No content available to generate assignments. Please add document chunks first.",
        }),
        { status: 400 },
      );
    }

    const safeCount = Math.min(count, 10);

    const prompt = `Generate unique ${safeCount} assignments based on the following educational content. Each assignment should have a clear title, detailed instructions, and a due date (in ISO format like 2025-01-15).\n\nContent:\n${content}`;

    const result = await generateJson(prompt, AssignmentSchema);

    const created = await prisma.$transaction(
      result.assignments.map((a) =>
        prisma.assignment.create({
          data: {
            course_id: material.course_id,
            title: a.title.trim(),
            instructions: a.instructions.trim(),
            due_date: a.due_date ? new Date(a.due_date) : null,
          },
        }),
      ),
    );

    return new Response(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error("Assignment generation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate assignments",
      }),
      { status: 500 },
    );
  }
}
