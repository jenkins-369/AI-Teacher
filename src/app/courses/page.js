'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, TextArea, Select, LoadingSpinner, Alert, Modal } from '@/components/ui'
import { Plus, BookOpen, Edit2, Trash2, Search, X } from 'lucide-react'
import { coursesApi } from '@/services/api'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ title: '', description: '', category: '', difficulty: 'beginner' })

  const fetchCourses = async () => {
    try {
      const data = await coursesApi.getAll()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await coursesApi.create(formData)
      setShowForm(false)
      setFormData({ title: '', description: '', category: '', difficulty: 'beginner' })
      fetchCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await coursesApi.update(editingCourse.id, formData)
      setShowForm(false)
      setEditingCourse(null)
      setFormData({ title: '', description: '', category: '', difficulty: 'beginner' })
      fetchCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await coursesApi.delete(deletingId)
      setDeletingId(null)
      fetchCourses()
    } catch (err) {
      setError(err.message)
    }
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      category: course.category || '',
      difficulty: course.difficulty || 'beginner'
    })
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingCourse(null)
    setFormData({ title: '', description: '', category: '', difficulty: 'beginner' })
    setShowForm(true)
  }

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.category && course.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading courses...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="mt-1 text-gray-500">Manage and organize your learning courses</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />
      )}

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

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="flex flex-col hover:border-gray-300 transition-colors">
              <a href={`/courses/${course.id}`} className="flex-1 group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {course.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {course.category}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.difficulty || 'Beginner'}
                  </span>
                </div>
              </a>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button 
                  variant="secondary" 
                  className="flex-1 flex items-center justify-center gap-1.5" 
                  onClick={() => openEdit(course)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1 flex items-center justify-center gap-1.5" 
                  onClick={() => setDeletingId(course.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first course'}
          </p>
          {!searchQuery && (
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Course
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <Modal 
          title={editingCourse ? 'Edit Course' : 'Add Course'} 
          onClose={() => { setShowForm(false); setEditingCourse(null); }}
        >
          <form onSubmit={editingCourse ? handleUpdate : handleCreate}>
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter course title"
            />
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe your course"
            />
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g. Mathematics, Science"
            />
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ]}
            />
            <div className="flex gap-2 mt-6">
              <Button type="submit" className="flex-1">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => { setShowForm(false); setEditingCourse(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Course" onClose={() => setDeletingId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the course and all associated data.
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
  )
}