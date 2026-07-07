'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, TextArea, Select, LoadingSpinner, Alert, Modal } from '@/components/ui'
import { 
  Plus, BookOpen, Edit2, Trash2, Search, X, FileText, 
  ChevronRight, ExternalLink, Filter, RefreshCw
} from 'lucide-react'
import { studyMaterialsApi, coursesApi } from '@/services/api'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('')
  const [formData, setFormData] = useState({ course_id: '', title: '', file_url: '', file_type: 'pdf', pages: '' })

  const fetchData = async () => {
    try {
      const [materialsData, coursesData] = await Promise.all([
        studyMaterialsApi.getAll(),
        coursesApi.getAll()
      ])
      setMaterials(materialsData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await studyMaterialsApi.create(formData)
      setShowForm(false)
      setFormData({ course_id: '', title: '', file_url: '', file_type: 'pdf', pages: '' })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await studyMaterialsApi.update(editingMaterial.id, formData)
      setShowForm(false)
      setEditingMaterial(null)
      setFormData({ course_id: '', title: '', file_url: '', file_type: 'pdf', pages: '' })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await studyMaterialsApi.delete(deletingId)
      setDeletingId(null)
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const openEdit = (material) => {
    setEditingMaterial(material)
    setFormData({
      course_id: material.course_id.toString(),
      title: material.title,
      file_url: material.file_url || '',
      file_type: material.file_type || 'pdf',
      pages: material.pages?.toString() || ''
    })
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingMaterial(null)
    setFormData({ course_id: courses[0]?.id.toString() || '', title: '', file_url: '', file_type: 'pdf', pages: '' })
    setShowForm(true)
  }

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.file_type && m.file_type.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCourse = !selectedCourseFilter || m.course_id.toString() === selectedCourseFilter
    return matchesSearch && matchesCourse
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 text-sm">Loading study materials...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
            <p className="mt-1 text-gray-500">Manage documents and resources for your courses</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Material
          </Button>
        </div>
      </div>

      {error && (
        <Alert message={error} type="error" onClose={() => setError('')} className="mb-6" />
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {courses.length > 0 && (
          <div className="relative sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="space-y-4">
          {filteredMaterials.map(m => (
            <Card key={m.id} className="hover:border-gray-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={`/chat?material_id=${m.id}`} className="group block">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {m.title}
                        </h3>
                      </a>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {m.course?.title || m.course_id}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="uppercase font-medium text-xs tracking-wide">{m.file_type || 'PDF'}</span>
                        <span className="text-gray-300">|</span>
                        <span>{m.pages || 0} pages</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <a href={`/chat?material_id=${m.id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Chat
                  </a>
                  <Button variant="secondary" className="flex items-center gap-1.5" onClick={() => openEdit(m)}>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="danger" className="flex items-center gap-1.5" onClick={() => setDeletingId(m.id)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No materials found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCourseFilter ? 'Try adjusting your filters' : 'Upload your first study material to get started'}
          </p>
          {!searchQuery && !selectedCourseFilter && (
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Study Material
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <Modal 
          title={editingMaterial ? 'Edit Study Material' : 'Add Study Material'} 
          onClose={() => { setShowForm(false); setEditingMaterial(null); }}
        >
          <form onSubmit={editingMaterial ? handleUpdate : handleCreate}>
            <Select
              label="Course"
              value={formData.course_id}
              onChange={(e) => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
              required
              options={courses.map(c => ({ value: c.id.toString(), label: c.title }))}
            />
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter material title"
            />
            <Input
              label="File URL"
              value={formData.file_url}
              onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
              placeholder="https://example.com/document.pdf"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="File Type"
                value={formData.file_type}
                onChange={(e) => setFormData(prev => ({ ...prev, file_type: e.target.value }))}
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'docx', label: 'DOCX' },
                  { value: 'txt', label: 'TXT' },
                  { value: 'pptx', label: 'PPTX' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              <Input
                label="Pages"
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="submit" className="flex-1">
                {editingMaterial ? 'Update Material' : 'Create Material'}
              </Button>
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => { setShowForm(false); setEditingMaterial(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Study Material" onClose={() => setDeletingId(null)}>
          <div className="text-center">
            <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-1 font-medium">Are you sure?</p>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete the study material and all associated data.
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