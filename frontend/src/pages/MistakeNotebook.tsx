import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, BookOpen, ChevronRight } from 'lucide-react'

interface WrongQuestion {
  id: number
  lesson_id: number
  question_id: number
  question_text: string
  correct_answer: string
  user_answer: string
  mastered: boolean
  created_at: string
  last_reviewed: string | null
  lesson_title: string | null
}

const MistakeNotebook: React.FC = () => {
  const { user } = useAuth()
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWrongQuestions()
  }, [])

  const fetchWrongQuestions = async () => {
    try {
      const res = await axios.get('/api/mistakes/')
      setWrongQuestions(res.data)
    } catch (err) {
      console.error('Failed to fetch wrong questions', err)
      toast.error('Failed to load mistake notebook')
    } finally {
      setLoading(false)
    }
  }

  const handleMaster = async (id: number) => {
    try {
      await axios.post(`/api/mistakes/${id}/master`)
      toast.success('Question marked as mastered!')
      // Update local state
      setWrongQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, mastered: true } : q))
      )
    } catch (err) {
      console.error('Failed to mark as mastered', err)
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading your mistakes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-red-100 rounded-2xl mr-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Mistake Notebook</h1>
            <p className="text-gray-600">Review and master questions you answered incorrectly.</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-2xl border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-red-700">
                {wrongQuestions.filter(q => !q.mastered).length} unmastered questions
              </span>
              <span className="text-gray-600 mx-2">•</span>
              <span className="text-green-700">
                {wrongQuestions.filter(q => q.mastered).length} mastered
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Total: {wrongQuestions.length} questions
            </div>
          </div>
        </div>
      </header>

      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No mistakes yet!</h3>
          <p className="text-gray-600 mb-8">Keep practicing lessons to collect questions here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {wrongQuestions.map((q) => (
            <div
              key={q.id}
              className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                q.mastered ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    {q.mastered ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                      {q.lesson_title || `Lesson ${q.lesson_id}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {q.question_text}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(q.created_at).toLocaleDateString()}
                  </div>
                  {!q.mastered && (
                    <button
                      onClick={() => handleMaster(q.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-md"
                    >
                      Mark as Mastered
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="text-sm font-bold text-red-700 uppercase mb-1">Correct Answer</div>
                  <div className="text-lg font-bold text-gray-800">{q.correct_answer}</div>
                </div>
                {q.user_answer && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm font-bold text-gray-700 uppercase mb-1">Your Answer</div>
                    <div className="text-lg font-bold text-gray-800">{q.user_answer}</div>
                  </div>
                )}
              </div>
              {q.mastered && (
                <div className="mt-4 flex items-center text-green-600 font-bold">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mastered on {q.last_reviewed ? new Date(q.last_reviewed).toLocaleDateString() : 'N/A'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MistakeNotebook
