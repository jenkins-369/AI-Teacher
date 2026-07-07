import prisma from "@/lib/prisma";
import { generateJson } from "@/lib/gemini";
import { QuizSchema } from "@/lib/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const { material_id, count = 5 } = body;

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
        {
          status: 404,
        },
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
            "No content available to generate quiz. Please add document chunks first.",
        }),
        { status: 400 },
      );
    }

    const safeCount = Math.min(count, 20);

    const prompt = `Generate unique ${safeCount} multiple choice questions based on the following educational content. Each question should have 4 options (A, B, C, D), indicate the correct option, and provide an explanation:\n\n${content}`;

    const result = await generateJson(prompt, QuizSchema);

    const quiz = await prisma.quiz.create({
      data: {
        material_id: parseInt(material_id),
        title: `Quiz: ${material.title}`,
      },
    });

    const created = await prisma.$transaction(
      result.questions.map((q) =>
        prisma.quizQuestion.create({
          data: {
            quiz_id: quiz.id,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            explanation: q.explanation,
          },
        }),
      ),
    );

    return new Response(JSON.stringify({ quiz, questions: created }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
