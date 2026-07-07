import { useState } from 'react'
import { Card, Button, Input, Select, Modal, LoadingSpinner, Alert } from '@/components/ui'

export default function CourseForm({ course, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    difficulty: course?.difficulty || 'beginner'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">{course ? 'Edit Course' : 'Add New Course'}</h2>
      {error && <Alert message={error} type="error" onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={formData.title}
          onChange={handleChange('title')}
          required
        />
        <TextArea
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
        />
        <Input
          label="Category"
          value={formData.category}
          onChange={handleChange('category')}
        />
        <Select
          label="Difficulty"
          value={formData.difficulty}
          onChange={handleChange('difficulty')}
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' }
          ]}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : course ? 'Update' : 'Create'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}