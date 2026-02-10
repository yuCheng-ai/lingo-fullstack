import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ChevronLeft, CheckCircle2, XCircle, Heart, Coins, Trophy } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  answer: string
}

interface Lesson {
  id: number
  title: string
  description: string
  type: string
  content: string // JSON string
}

const Practice: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const lessonId = searchParams.get('lessonId')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [heartsLost, setHeartsLost] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [wrongQuestionIds, setWrongQuestionIds] = useState<number[]>([])

  useEffect(() => {
    if (!lessonId) {
      navigate('/lessons')
      return
    }

    const fetchLesson = async () => {
      try {
        const res = await axios.get(`/api/lessons/${lessonId}`)
        setLesson(res.data)
        const parsedQuestions = JSON.parse(res.data.content)
        setQuestions(parsedQuestions)
      } catch (err) {
        console.error('Failed to fetch lesson', err)
        toast.error('Failed to load lesson')
        navigate('/lessons')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId, navigate])

  const handleOptionSelect = (option: string) => {
    if (isCorrect !== null) return
    setSelectedOption(option)
  }

  const handleCheck = () => {
    if (!selectedOption || !questions[currentIndex]) return

    const correct = selectedOption === questions[currentIndex].answer
    setIsCorrect(correct)
    
    if (correct) {
      setScore(prev => prev + 1)
      toast.success('Correct!', { icon: '👏' })
    } else {
      setHeartsLost(prev => prev + 1)
      // Add wrong question id to the list
      const currentQuestionId = questions[currentIndex].id
      setWrongQuestionIds(prev => [...prev, currentQuestionId])
      toast.error(`Wrong! The correct answer was: ${questions[currentIndex].answer}`, { icon: '❌' })
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsCorrect(null)
    } else {
      // Final submission
      const finalScorePercentage = Math.round((score / questions.length) * 100)
      try {
        await axios.post('/api/progress/submit', {
          lesson_id: parseInt(lessonId!),
          score: finalScorePercentage,
          hearts_lost: heartsLost,
          wrong_question_ids: wrongQuestionIds
        })
        setCompleted(true)
        refreshUser() // Update global user stats
      } catch (err) {
        toast.error('Failed to save progress')
      }
    }
  }

  if (loading) return <div className="text-center py-20">Loading lesson...</div>
  if (!lesson || questions.length === 0) return <div className="text-center py-20">No questions found.</div>

  if (completed) {
    const finalScore = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-indigo-100 mt-10">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-indigo-900 mb-2">Lesson Completed!</h2>
        <p className="text-gray-600 mb-8">You've finished {lesson.title}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-2xl">
            <div className="text-indigo-600 font-bold text-sm uppercase">Score</div>
            <div className="text-2xl font-black">{finalScore}%</div>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl">
            <div className="text-red-600 font-bold text-sm uppercase">Hearts Lost</div>
            <div className="text-2xl font-black">{heartsLost}</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/lessons')}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg"
        >
          Back to Path
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button 
          onClick={() => navigate('/lessons')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex-1 mx-4">
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-red-500 font-bold">
            <Heart className="w-5 h-5 mr-1 fill-current" />
            {user?.hearts}
          </div>
          <div className="flex items-center text-yellow-500 font-bold">
            <Coins className="w-5 h-5 mr-1 fill-current" />
            {user?.coins}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-indigo-50">
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">
          Question {currentIndex + 1} of {questions.length}
        </h3>
        <h2 className="text-2xl font-bold text-indigo-900 mb-8">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className={`w-full text-left p-5 rounded-2xl border-2 font-medium transition-all ${
                selectedOption === option
                  ? isCorrect === null
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : isCorrect && option === currentQuestion.answer
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : !isCorrect && option === selectedOption
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-400'
                  : isCorrect !== null && option === currentQuestion.answer
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
              }`}
            >
              <span className="inline-block w-8 h-8 rounded-lg bg-gray-100 text-center leading-8 mr-4 text-sm font-bold text-gray-500">
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white border-t-2 border-gray-100 p-6 fixed bottom-0 left-0 right-0 md:relative md:rounded-3xl md:shadow-lg md:border-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {isCorrect === null ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOption}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-md ${
                selectedOption 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <div className={`w-full flex items-center justify-between p-2 rounded-2xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center ml-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500 mr-3" />
                    <span className="text-green-800 font-bold text-lg">Amazing!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500 mr-3" />
                    <span className="text-red-800 font-bold text-lg">Correct answer: {currentQuestion.answer}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleNext}
                className={`px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition transform active:scale-95 ${
                  isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Practice;
