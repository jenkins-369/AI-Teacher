'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { coursesApi, progressApi } from '@/services/api'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

export const AppProvider = ({ children }) => {
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [coursesData, progressData] = await Promise.all([
        coursesApi.getAll(),
        progressApi.getAll()
      ])
      setCourses(coursesData)
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCourse = async (courseData) => {
    try {
      const newCourse = await coursesApi.create(courseData)
      setCourses(prev => [...prev, newCourse])
      return newCourse
    } catch (error) {
      throw error
    }
  }

  const updateCourse = async (id, courseData) => {
    try {
      const updated = await coursesApi.update(id, courseData)
      setCourses(prev => prev.map(c => c.id === id ? updated : c))
      if (selectedCourse?.id === id) setSelectedCourse(updated)
      return updated
    } catch (error) {
      throw error
    }
  }

  const deleteCourse = async (id) => {
    try {
      await coursesApi.delete(id)
      setCourses(prev => prev.filter(c => c.id !== id))
      if (selectedCourse?.id === id) setSelectedCourse(null)
    } catch (error) {
      throw error
    }
  }

  const value = {
    courses,
    progress,
    loading,
    selectedCourse,
    setSelectedCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    refreshData: fetchData
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}