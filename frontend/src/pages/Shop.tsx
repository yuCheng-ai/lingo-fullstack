import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Heart, Zap, Coins, ShoppingBag } from 'lucide-react'

interface ShopItem {
  id: number
  name: string
  description: string
  price: number
  type: string
}

const Shop: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/shop/items')
        setItems(res.data)
      } catch (err) {
        console.error('Failed to fetch shop items', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleBuy = async (itemId: number) => {
    setBuyingId(itemId)
    try {
      const res = await axios.post('/api/shop/buy', { item_id: itemId })
      toast.success(res.data.message)
      refreshUser()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Purchase failed')
    } finally {
      setBuyingId(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="w-12 h-12 text-red-500" />
      case 'boost': return <Zap className="w-12 h-12 text-yellow-500" />
      case 'coins': return <Coins className="w-12 h-12 text-yellow-600" />
      default: return <ShoppingBag className="w-12 h-12 text-indigo-500" />
    }
  }

  if (loading) return <div className="text-center py-20">Loading shop...</div>

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Shop</h1>
          <p className="text-gray-600">Spend your hard-earned coins on power-ups!</p>
        </div>
        <div className="bg-yellow-100 px-6 py-3 rounded-2xl flex items-center border-2 border-yellow-200">
          <Coins className="w-6 h-6 text-yellow-600 mr-2" />
          <span className="text-2xl font-black text-yellow-700">{user?.coins || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-3xl shadow-lg border-2 border-indigo-50 flex flex-col items-center text-center transition hover:shadow-xl">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
              {getIcon(item.type)}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
            <p className="text-gray-500 mb-8 flex-grow text-sm">{item.description}</p>
            <button
              onClick={() => handleBuy(item.id)}
              disabled={buyingId !== null || (user?.coins || 0) < item.price}
              className={`w-full py-4 rounded-2xl font-bold transition flex items-center justify-center shadow-md ${
                (user?.coins || 0) >= item.price
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {buyingId === item.id ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Coins className="w-5 h-5 mr-2" />
                  {item.price}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Shop
