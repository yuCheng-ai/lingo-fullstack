import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User as UserIcon, Calendar, Star, Award, Edit2, Save, X, Flame } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.put('/api/users/me', {
        username,
        email,
        avatar_url: avatarUrl
      })
      await refreshUser()
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-indigo-50">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="p-2 bg-green-500/80 hover:bg-green-500 rounded-full transition text-white disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setUsername(user.username)
                  setEmail(user.email)
                  setAvatarUrl(user.avatar_url || '')
                }}
                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="px-8 pb-10">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg mx-auto overflow-hidden group relative">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-5xl">
                  <UserIcon className="w-16 h-16 text-indigo-400" />
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <span className="text-white text-xs font-bold">Change Avatar</span>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 mb-10">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Avatar URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          ) : (
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <div className="flex items-center justify-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-indigo-50 p-6 rounded-3xl text-center border-b-4 border-indigo-200">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-5 h-5 text-indigo-500 mr-2" />
                <span className="text-2xl font-black text-indigo-900">Level {user.level}</span>
              </div>
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Proficiency</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-3xl text-center border-b-4 border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-2xl font-black text-purple-900">{user.experience.toLocaleString()}</span>
              </div>
              <div className="text-purple-400 text-xs font-bold uppercase tracking-widest">Total XP</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-3xl text-center border-b-4 border-orange-200">
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-2xl font-black text-orange-900">{user.streak_count}</span>
              </div>
              <div className="text-orange-400 text-xs font-bold uppercase tracking-widest">Day Streak</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-3xl text-center border-b-4 border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">💎</span>
                <span className="text-2xl font-black text-blue-900">{user.coins.toLocaleString()}</span>
              </div>
              <div className="text-blue-400 text-xs font-bold uppercase tracking-widest">Gems</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 px-2">Account Statistics</h3>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-gray-600 font-medium">Email</span>
              <span className="text-gray-900 font-bold">{user.email}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-gray-600 font-medium">Hearts Capacity</span>
              <span className="text-gray-900 font-bold">{user.max_hearts}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-gray-600 font-medium">Account Status</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">Active</span>
            </div>
          </div>

          <button className="w-full mt-10 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm">
            Edit Profile Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
