import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

interface Lesson {
  id: number
  title: string
  status: 'completed' | 'in_progress' | 'locked'
  order: number
}

interface Level {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}

const LessonSelection: React.FC = () => {
  const { user } = useAuth()
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, progressRes] = await Promise.all([
          axios.get('/api/lessons'),
          axios.get('/api/progress/')
        ])
        
        setLevels(levelsRes.data)
        setUserProgress(progressRes.data)
      } catch (error) {
        console.error('Failed to fetch lesson data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getLessonStatus = (lessonId: number, levelOrder: number, lessonOrder: number): 'completed' | 'in_progress' | 'locked' => {
    const progress = userProgress.find(p => p.lesson_id === lessonId)
    if (progress?.completed) return 'completed'
    
    // If it's the very first lesson, it's always available
    if (levelOrder === 1 && lessonOrder === 1) return 'in_progress'

    // Simple unlock logic for now: if user's level is >= levelOrder, it's available
    if (user && user.level >= levelOrder) return 'in_progress'
    
    return 'locked'
  }

  if (loading) return <div className="text-center py-20">Loading lessons...</div>

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-indigo-900 mb-10 text-center">Your Learning Path</h1>
      
      {levels.map((level, levelIdx) => (
        <div key={level.id} className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-800">{level.title}</h2>
            <p className="text-gray-600">{level.description}</p>
          </div>

          <div className="flex flex-col items-center space-y-12 relative">
            <div className="absolute top-0 bottom-0 w-2 bg-indigo-100 left-1/2 -ml-1 z-0"></div>
            {level.lessons.map((lesson) => {
              const status = getLessonStatus(lesson.id, levelIdx + 1, lesson.order)
              return (
                <div key={lesson.id} className="relative z-10 flex flex-col items-center">
                  <Link
                    to={status === 'locked' ? '#' : `/practice?lessonId=${lesson.id}`}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold transition transform hover:scale-110 shadow-xl ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'in_progress'
                        ? 'bg-indigo-600 text-white ring-8 ring-indigo-200 animate-pulse'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {lesson.order}
                  </Link>
                  <span className="mt-4 font-bold text-gray-700">{lesson.title}</span>
                  {status === 'locked' && (
                    <span className="mt-1 text-xs text-gray-400 uppercase tracking-widest">Locked</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default LessonSelection
