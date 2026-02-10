import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Trophy, User as UserIcon } from 'lucide-react'

interface LeaderboardUser {
  id: number
  username: string
  experience: number
  level: number
  avatar_url: string
}

const Leaderboard: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/users/leaderboard')
        setUsers(res.data)
      } catch (err) {
        console.error('Failed to fetch leaderboard', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) return <div className="text-center py-20">Loading leaderboard...</div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-indigo-900">Global Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other learners</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-indigo-50">
        {users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No users yet. Be the first!</div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center p-6 border-b border-gray-100 last:border-0 transition hover:bg-gray-50 ${
                currentUser?.id === user.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'text-yellow-500' : 
                index === 1 ? 'text-gray-400' : 
                index === 2 ? 'text-orange-400' : 'text-gray-500'
              }`}>
                #{index + 1}
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl mx-4 overflow-hidden border-2 border-white shadow-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-indigo-400" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className={`font-bold text-lg ${currentUser?.id === user.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {user.username} {currentUser?.id === user.id && '(You)'}
                </h3>
                <div className="text-sm text-gray-500 font-medium">Level {user.level}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-2xl text-indigo-600">{user.experience}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">XP Points</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard
