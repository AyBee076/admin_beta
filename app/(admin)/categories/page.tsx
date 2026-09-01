'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const loadCategories = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      setError(error.message)
    } else if (data) {
      setCategories(data)
    }
    setInitialLoading(false)
  }

  useEffect(() => {
  let ignore = false

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (ignore) return

    if (error) {
      setError(error.message)
    } else if (data) {
      setCategories(data)
    }
    setInitialLoading(false)
  }

  fetchCategories()

  return () => {
    ignore = true
  }
}, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('categories').insert({ name })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setName('')
    setLoading(false)
    loadCategories()
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Delete this category? This cannot be undone.')
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    loadCategories()
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {initialLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))}

          {categories.length === 0 && (
            <li className="px-4 py-6 text-center text-gray-500 text-sm">
              No categories yet.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}