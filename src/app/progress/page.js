"use client";

import { useState, useEffect } from "react";
import { Card, Button, LoadingSpinner, Alert, Modal } from "@/components/ui";
import { 
  Activity, TrendingUp, BookOpen, Trash2, ArrowLeft,
  Award, Clock, Target, BarChart3, Search, Filter
} from 'lucide-react'
import { progressApi } from "@/services/api";

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProgress = async () => {
    try {
      const data = await progressApi.getAll();
      setProgress(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await progressApi.delete(deletingId);
      setDeletingId(null);
      fetchProgress();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading progress...</p>
      </div>
    );
  }

  const filteredProgress = progress.filter(p => 
    (p.course?.title || p.course_id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCompletionColor = (percent) => {
    if (percent >= 80) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', ring: 'ring-green-200' }
    if (percent >= 50) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-200' }
    if (percent >= 25) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500', ring: 'ring-yellow-200' }
    return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', ring: 'ring-red-200' }
  }

  const averageCompletion = progress.length > 0 
    ? progress.reduce((acc, p) => acc + (p.completion_percent || 0), 0) / progress.length 
    : 0

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
            <p className="mt-1 text-gray-500">
              {progress.length > 0 
                ? `Tracking progress across ${progress.length} course${progress.length !== 1 ? 's' : ''}`
                : 'Track your learning journey and achievements'
              }
            </p>
          </div>
          {progress.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {(averageCompletion * 100).toFixed(0)}% avg completion
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />
      )}

      {progress.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {progress.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No progress recorded yet</h3>
          <p className="text-gray-500 mb-6">Complete quizzes and assignments to start tracking your progress</p>
          <Button onClick={() => window.location.href = '/quizzes'} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Take a Quiz
          </Button>
        </div>
      ) : filteredProgress.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No courses match your search</h3>
          <p className="text-gray-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProgress.map(p => {
            const completionPercent = Math.round((p.completion_percent || 0) * 100)
            const colors = getCompletionColor(p.completion_percent || 0)
            
            return (
              <Card key={p.id} className="hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg} ring-1 ${colors.ring} shrink-0`}>
                    <BookOpen className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {p.course?.title || p.course_id}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {p.quizzes_completed || 0} of {p.total_quizzes || 0} activities completed
                    </p>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completion</span>
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {completionPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${colors.bar}`}
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="danger" 
                      size="sm"
                      className="flex items-center gap-1.5"
                      onClick={() => setDeletingId(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {deletingId && (
        <Modal title="Delete Progress" onClose={() => setDeletingId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the progress record.
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