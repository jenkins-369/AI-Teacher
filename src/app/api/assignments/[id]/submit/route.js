import prisma from '@/lib/prisma'
import { generateJson } from '@/lib/gemini'
import { AssignmentFeedbackSchema } from '@/lib/schemas'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    const assignmentId = parseInt(id)
    if (isNaN(assignmentId)) {
      return new Response(JSON.stringify({ error: 'Invalid assignment ID' }), { status: 400 })
    }

    const body = await request.json()
    const { submission_text } = body

    if (!submission_text || submission_text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Submission text is required' }), { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            studyMaterials: {
              include: {
                chunks: true
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return new Response(JSON.stringify({ error: 'Assignment not found' }), { status: 404 })
    }

    const courseContext = assignment.course.studyMaterials
      .map(m => `Material: ${m.title}\n${m.chunks.map(c => c.chunk_text).join('\n\n')}`)
      .join('\n\n---\n\n')

    const prompt = `You are an AI teacher evaluating a student's assignment submission.

Assignment Title: ${assignment.title}
Assignment Instructions: ${assignment.instructions}

Course Context:
${courseContext || 'No additional course materials provided.'}

Student Submission:
${submission_text}

Evaluate this submission and provide detailed feedback. Be constructive and specific.`

    const result = await generateJson(prompt, AssignmentFeedbackSchema)

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignment_id: assignmentId,
        submission_text,
        ai_feedback: JSON.stringify(result),
        score: result.score
      }
    })

    return new Response(JSON.stringify({
      ...submission,
      feedback: result
    }), { status: 201 })
  } catch (error) {
    console.error('Assignment submission error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Failed to submit assignment' }), { status: 500 })
  }
}
