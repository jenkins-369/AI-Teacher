"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Button, LoadingSpinner, Alert } from "@/components/ui";
import { ArrowLeft, BookOpen, FileText, HelpCircle, Sparkles, RefreshCw } from 'lucide-react'
import { coursesApi } from "@/services/api";
import StudyMaterialManager from "@/components/study-material/StudyMaterialManager";
import QuizManager from "@/components/quiz/QuizManager";
import AssignmentManager from "@/components/assignment/AssignmentManager";

export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCourse = async () => {
    try {
      const data = await coursesApi.get(id);
      setCourse(data);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCourse()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading course details...</p>
      </div>
    )
  }
  if (error) return <Alert message={error} type="error" />;
  if (!course) return <Alert message="Course not found" type="error" />;

  const totalQuizzes = (course.studyMaterials || []).reduce((acc, m) => acc + (m.quizzes || []).length, 0)
  const totalSummaries = (course.studyMaterials || []).reduce((acc, m) => acc + (m.summaries || []).length, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="secondary" 
              onClick={() => (window.location.href = `/courses`)}
              className="flex items-center gap-2 shrink-0 mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">{course.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {course.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {course.category}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {course.difficulty || "beginner"}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Study Materials</h3>
              <p className="text-sm text-gray-500">Upload and manage documents for this course</p>
            </div>
          </div>
          <StudyMaterialManager
            courseId={course.id}
            fetchCourse={fetchCourse}
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
              <p className="text-sm text-gray-500">View and manage course assignments</p>
            </div>
          </div>
          <AssignmentManager courseId={course.id} refreshKey={refreshKey} />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-green-50 rounded-lg">
              <HelpCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quizzes</h3>
              <p className="text-sm text-gray-500">{totalQuizzes} quiz{totalQuizzes !== 1 ? 'es' : ''} generated</p>
            </div>
          </div>
          {course.studyMaterials?.length > 0 ? (
            <div className="space-y-4">
              {course.studyMaterials.map((m) => (
                <QuizManager key={m.id} materialId={m.id} refreshKey={refreshKey} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Add study materials first to create quizzes.
              </p>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Summaries</h3>
              <p className="text-sm text-gray-500">{totalSummaries} summary{totalSummaries !== 1 ? 'ies' : ''} generated</p>
            </div>
          </div>
          {course.studyMaterials?.length > 0 ? (
            <div className="space-y-4">
              {course.studyMaterials.map((m) => (
                <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">{m.title}</h4>
                  {m.summaries?.length > 0 ? (
                    <div className="space-y-3">
                      {m.summaries.map((s) => (
                        <div key={s.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {s.summary}
                          </p>
                          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                            Generated: {new Date(s.generated_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No summaries yet. Generate a summary from the study materials page.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Add study materials first to generate summaries.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
