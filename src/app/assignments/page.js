"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, TextArea, LoadingSpinner, Alert, Modal } from "@/components/ui";
import { 
  Search, Plus, Trash2, GraduationCap, Clock, FileText,
  CheckCircle, AlertCircle, ArrowLeft, Send, X
} from 'lucide-react'
import { assignmentsApi, coursesApi, progressApi } from "@/services/api";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [submittingId, setSubmittingId] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentsApi.getAll(),
        coursesApi.getAll()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await assignmentsApi.delete(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openSubmitModal = (assignmentId) => {
    setSubmittingId(assignmentId);
    setSubmissionText("");
    setSubmissionResult(null);
  };

  const closeSubmitModal = () => {
    setSubmittingId(null);
    setSubmissionText("");
    setSubmissionResult(null);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submittingId || !submissionText.trim()) return;

    setSubmitting(true);
    try {
      const assignment = assignments.find(a => a.id === submittingId);
      const result = await assignmentsApi.submit(submittingId, {
        submission_text: submissionText
      });
      setSubmissionResult(result);

      if (assignment?.course_id) {
        await progressApi.upsert({
          course_id: assignment.course_id
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading assignments...</p>
      </div>
    );
  }

  const assignmentsByCourse = courses
    .map(course => ({
      ...course,
      assignments: assignments.filter(a => a.course_id === course.id)
    }))
    .filter(c => c.assignments.length > 0);

  const totalAssignments = assignments.length

  const filteredAssignmentsByCourse = assignmentsByCourse.map(course => ({
    ...course,
    assignments: course.assignments.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.instructions && a.instructions.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(c => c.assignments.length > 0)

  const getDueStatus = (dueDate) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-500', bg: 'bg-gray-50' }
    const due = new Date(dueDate)
    const now = new Date()
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''}`, color: 'text-red-600', bg: 'bg-red-50' }
    if (diff === 0) return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (diff <= 3) return { text: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { text: `Due in ${diff} days`, color: 'text-green-600', bg: 'bg-green-50' }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-gray-500">
              {totalAssignments > 0 
                ? `${totalAssignments} assignment${totalAssignments !== 1 ? 's' : ''} across ${courses.filter(c => assignments.some(a => a.course_id === c.id)).length} course${courses.filter(c => assignments.some(a => a.course_id === c.id)).length !== 1 ? 's' : ''}`
                : 'View and submit assignments generated from your study materials'
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />
      )}

      {assignments.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
          <p className="text-gray-500 mb-6">Generate assignments from study materials to get started</p>
          <Button onClick={() => window.location.href = '/materials'} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Go to Materials
          </Button>
        </div>
      ) : filteredAssignmentsByCourse.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments match your search</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredAssignmentsByCourse.map(course => (
            <div key={course.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.assignments.length} assignment{course.assignments.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                {course.assignments.map(a => {
                  const dueStatus = getDueStatus(a.due_date)
                  return (
                    <Card key={a.id} className="hover:border-gray-300 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-purple-50 rounded-lg shrink-0">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900">{a.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a.instructions}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${dueStatus.bg} ${dueStatus.color}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  {dueStatus.text}
                                </span>
                                {a.due_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(a.due_date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 lg:shrink-0">
                          <Button 
                            onClick={() => openSubmitModal(a.id)}
                            className="flex items-center gap-1.5"
                          >
                            <Send className="w-4 h-4" />
                            Submit
                          </Button>
                          <Button 
                            variant="danger" 
                            className="flex items-center gap-1.5"
                            onClick={() => setDeletingId(a.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {submittingId && (
        <Modal
          title="Submit Assignment"
          onClose={closeSubmitModal}
        >
          {!submissionResult ? (
            <form onSubmit={handleSubmitAssignment}>
              {(() => {
                const assignment = assignments.find(a => a.id === submittingId)
                return (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{assignment?.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{assignment?.instructions}</p>
                  </div>
                )
              })()}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Submission</label>
                <TextArea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  placeholder="Paste or type your assignment submission here..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting...' : 'Submit for Feedback'}
                </Button>
                <Button variant="secondary" type="button" onClick={closeSubmitModal} className="flex-1">Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-0.1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">AI Feedback</h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {submissionResult.feedback.score}/100
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium mb-2 text-blue-900">Overall Feedback</h5>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{submissionResult.feedback.feedback}</p>
              </div>

              {submissionResult.feedback.strengths && submissionResult.feedback.strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium mb-2 text-green-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {submissionResult.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {submissionResult.feedback.suggestions && submissionResult.feedback.suggestions.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium mb-2 text-yellow-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Suggestions for Improvement
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {submissionResult.feedback.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-yellow-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="secondary" onClick={closeSubmitModal}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Assignment" onClose={() => setDeletingId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the assignment and all submissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeletingId(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
