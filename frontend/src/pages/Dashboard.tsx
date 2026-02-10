import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-indigo-900">
          Welcome back, {user?.username || 'Explorer'}!
        </h1>
        <p className="text-gray-600">Ready for your daily English challenge?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-400">
          <div className="text-orange-500 font-bold mb-1">XP Points</div>
          <div className="text-2xl font-bold">{user?.experience || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-400">
          <div className="text-red-500 font-bold mb-1">Hearts</div>
          <div className="text-2xl font-bold">{user?.hearts || 0} / {user?.max_hearts || 5}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-yellow-400">
          <div className="text-yellow-500 font-bold mb-1">Level</div>
          <div className="text-2xl font-bold">{user?.level || 1}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-400">
          <div className="text-blue-500 font-bold mb-1">Streak</div>
          <div className="text-2xl font-bold">{user?.streak_count || 0} Days</div>
        </div>
      </div>

      {user?.boost_expires_at && new Date(user.boost_expires_at) > new Date() && (
        <div className="mb-10 bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-4">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <div className="font-bold">2x XP Boost Active!</div>
              <div className="text-sm opacity-90">
                Expires at {new Date(user.boost_expires_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border-2 border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">Unit 1: Basic Greetings</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
            <div className="bg-indigo-600 h-4 rounded-full w-1/3"></div>
          </div>
          <Link
            to="/lessons"
            className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg"
          >
            Continue Learning
          </Link>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-3xl shadow-lg text-center border-2 border-red-100">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Mistake Notebook</h2>
          <p className="text-gray-600 mb-6">Review questions you answered incorrectly to avoid repeating mistakes.</p>
          <Link
            to="/mistakes"
            className="inline-block bg-red-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:bg-red-700 transition transform hover:scale-105 shadow-lg"
          >
            Review Mistakes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
