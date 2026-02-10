import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            LingoQuest
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/lessons" className="text-gray-600 hover:text-indigo-600">Lessons</Link>
            <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600">Leaderboard</Link>
            <Link to="/shop" className="text-gray-600 hover:text-indigo-600">Shop</Link>
            <Link to="/profile" className="text-gray-600 hover:text-indigo-600">Profile</Link>
            <Link to="/mistakes" className="text-gray-600 hover:text-indigo-600">Mistakes</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
