import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100-4rem)] text-center py-20">
      <h1 className="text-5xl font-extrabold text-indigo-900 mb-6">
        Learn English the Fun Way
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Master English with bite-sized lessons, interactive exercises, and a competitive leaderboard.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/register"
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
        >
          Start Learning
        </Link>
        <Link
          to="/login"
          className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition"
        >
          I Already Have an Account
        </Link>
      </div>
    </div>
  )
}

export default Home
