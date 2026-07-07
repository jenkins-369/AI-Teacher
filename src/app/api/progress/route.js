import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const progress = await prisma.studentProgress.findMany({
      include: {
        course: true
      }
    })

    const enriched = await Promise.all(
      progress.map(async (p) => {
        const [quizAttempts, assignmentSubmissions, totalQuizzes, totalAssignments] = await Promise.all([
          prisma.quizAttempt.findMany({
            where: { course_id: p.course_id },
            include: {
              quiz: {
                select: {
                  questions: {
                    select: {
                      id: true
                    }
                  }
                }
              }
            }
          }),
          prisma.assignmentSubmission.findMany({
            where: {
              assignment: {
                course_id: p.course_id
              }
            }
          }),
          prisma.quiz.count({
            where: {
              material: {
                course_id: p.course_id
              }
            }
          }),
          prisma.assignment.count({
            where: { course_id: p.course_id }
          })
        ])

        const totalActivities = totalQuizzes + totalAssignments
        const completedActivities = quizAttempts.length + assignmentSubmissions.length

        let completionPercent = 0
        const scores = []

        if (quizAttempts.length > 0) {
          quizAttempts.forEach(attempt => {
            const totalQuestions = attempt.quiz?.questions?.length || attempt.total_questions || 1
            scores.push(attempt.score / totalQuestions)
          })
        }

        if (assignmentSubmissions.length > 0) {
          assignmentSubmissions.forEach(sub => {
            if (sub.score !== null && sub.score !== undefined) {
              scores.push(sub.score / 100)
            }
          })
        }

        if (scores.length > 0) {
          const totalScore = scores.reduce((sum, s) => sum + s, 0)
          completionPercent = totalScore / scores.length
        }

        return {
          ...p,
          completion_percent: completionPercent,
          quizzes_completed: completedActivities,
          total_quizzes: totalActivities,
          avg_score: scores.length > 0 ? (completionPercent * 100).toFixed(1) : 0,
          quiz_attempts: quizAttempts.length,
          assignment_submissions: assignmentSubmissions.length
        }
      })
    )

    return new Response(JSON.stringify(enriched), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { course_id } = body

    if (!course_id) {
      return new Response(JSON.stringify({ error: 'Course ID is required' }), { status: 400 })
    }

    const [quizAttempts, assignmentSubmissions, totalQuizzes, totalAssignments] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { course_id: parseInt(course_id) },
        include: {
          quiz: {
            select: {
              questions: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }),
      prisma.assignmentSubmission.findMany({
        where: {
          assignment: {
            course_id: parseInt(course_id)
          }
        }
      }),
      prisma.quiz.count({
        where: {
          material: {
            course_id: parseInt(course_id)
          }
        }
      }),
          prisma.assignment.count({
            where: { course_id: parseInt(course_id) }
          })
    ])

    const totalActivities = totalQuizzes + totalAssignments
    const completedActivities = quizAttempts.length + assignmentSubmissions.length

    const scores = []
    if (quizAttempts.length > 0) {
      quizAttempts.forEach(attempt => {
        const totalQuestions = attempt.quiz?.questions?.length || attempt.total_questions || 1
        scores.push(attempt.score / totalQuestions)
      })
    }
    if (assignmentSubmissions.length > 0) {
      assignmentSubmissions.forEach(sub => {
        if (sub.score !== null && sub.score !== undefined) {
          scores.push(sub.score / 100)
        }
      })
    }

    const completionPercent = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0

    const progress = await prisma.studentProgress.upsert({
      where: { course_id: parseInt(course_id) },
      update: {
        completion_percent: completionPercent,
        quizzes_completed: completedActivities,
        last_activity: new Date()
      },
      create: {
        course_id: parseInt(course_id),
        completion_percent: completionPercent,
        quizzes_completed: completedActivities
      }
    })

    return new Response(JSON.stringify(progress), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}