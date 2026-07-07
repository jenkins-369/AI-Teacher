"use client";

import { useState, useEffect } from "react";
import { Card, LoadingSpinner, Alert, Button } from "@/components/ui";
import { FileText, Clock, Trash2 } from 'lucide-react'
import { assignmentsApi } from "@/services/api";

export default function AssignmentManager({ courseId, refreshKey }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      const data = await assignmentsApi.getAll();
      setAssignments(data.filter((a) => a.course_id === parseInt(courseId)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId, refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

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
      {error && (
        <Alert message={error} type="error" onClose={() => setError("")} />
      )}

      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((a) => {
            const dueStatus = getDueStatus(a.due_date)
            return (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.instructions}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${dueStatus.bg} ${dueStatus.color}`}>
                        <Clock className="w-3 h-3" />
                        {dueStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.href = `/assignments`}
                    className="flex items-center gap-1.5"
                  >
                    View
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No assignments yet. Generate an assignment from study materials.
          </p>
        </div>
      )}
    </div>
  );
}
