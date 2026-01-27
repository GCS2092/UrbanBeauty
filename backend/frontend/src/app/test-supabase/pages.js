'use client' // Si vous utilisez App Router

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Récupérer les utilisateurs
        const { data: users, error: usersError } = await supabase
          .from('User')
          .select('id, email, role')
          .limit(5)

        if (usersError) throw usersError

        // Test 2: Récupérer les services
        const { data: services, error: servicesError } = await supabase
          .from('Service')
          .select('id, name, price')
          .limit(5)

        if (servicesError) throw servicesError

        // Test 3: Récupérer les produits
        const { data: products, error: productsError } = await supabase
          .from('Product')
          .select('id, name, price')
          .limit(5)

        if (productsError) throw productsError

        setData({ users, services, products })
      } catch (err) {
        console.error('Erreur:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Test de connexion Supabase...</h1>
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-4 text-red-500">❌ Erreur de connexion</h1>
        <div className="bg-red-900/20 border border-red-500 rounded p-4">
          <p className="font-mono">{error}</p>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Vérifiez que :</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Les variables d'environnement sont bien configurées</li>
            <li>RLS (Row Level Security) permet la lecture publique</li>
            <li>Les tables existent dans Supabase</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">✅ Connexion Supabase réussie !</h1>
      
      {/* Utilisateurs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-green-400">👥 Utilisateurs ({data.users?.length})</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          {data.users?.map(user => (
            <div key={user.id} className="border-b border-gray-700 py-2 last:border-0">
              <p className="font-mono text-sm">
                <span className="text-blue-400">{user.email}</span>
                <span className="text-gray-500 ml-4">→ {user.role}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">💇 Services ({data.services?.length})</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          {data.services?.map(service => (
            <div key={service.id} className="border-b border-gray-700 py-2 last:border-0">
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-gray-400">{service.price} FCFA</p>
            </div>
          ))}
        </div>
      </div>

      {/* Produits */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">🛍️ Produits ({data.products?.length})</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          {data.products?.map(product => (
            <div key={product.id} className="border-b border-gray-700 py-2 last:border-0">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-400">{product.price} FCFA</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-900/20 border border-green-500 rounded">
        <p className="text-green-400 font-semibold">🎉 Tout fonctionne parfaitement !</p>
        <p className="text-sm text-gray-400 mt-2">
          Votre frontend Vercel est bien connecté à votre base Supabase.
        </p>
      </div>
    </div>
  )
}