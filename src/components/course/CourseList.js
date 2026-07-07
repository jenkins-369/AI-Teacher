import { Button, Card, LoadingSpinner } from '@/components/ui'
import { useAppContext } from '@/context/AppContext'

export default function CourseList({ onEdit, onDelete, onSelect }) {
  const { courses, loading, deleteCourse } = useAppContext()

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(id)
      onDelete && onDelete(id)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(course => (
        <Card key={course.id}>
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
          <div className="flex gap-2 text-xs mb-3">
            {course.category && <span className="bg-gray-100 px-2 py-1 rounded">{course.category}</span>}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{course.difficulty || 'beginner'}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => onSelect && onSelect(course)}>View</Button>
            <Button variant="secondary" onClick={() => onEdit && onEdit(course)}>Edit</Button>
            <Button variant="danger" onClick={() => handleDelete(course.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {courses.length === 0 && (
        <p className="text-gray-500 col-span-full text-center py-8">No courses found. Create your first course!</p>
      )}
    </div>
  )
}