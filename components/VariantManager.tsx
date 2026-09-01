'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrashIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react'

type Variant = {
  id: string
  size: string
  color: string
  stock: number
  is_deleted: boolean
}

export default function VariantManager({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [stock, setStock] = useState('0')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const loadVariants = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, size, color, stock, is_deleted')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else if (data) {
      setVariants(data)
    }
    setInitialLoading(false)
  }

  useEffect(() => {
    let ignore = false

    const fetchVariants = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, size, color, stock, is_deleted')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (ignore) return

      if (error) {
        setError(error.message)
      } else if (data) {
        setVariants(data)
      }
      setInitialLoading(false)
    }

    fetchVariants()

    return () => {
      ignore = true
    }
  }, [productId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('product_variants').insert({
      product_id: productId,
      size,
      color,
      stock: parseInt(stock, 10),
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSize('')
    setColor('')
    setStock('0')
    setLoading(false)
    loadVariants()
  }

  const toggleDeleted = async (variantId: string, isDeleted: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('product_variants')
      .update({ is_deleted: !isDeleted })
      .eq('id', variantId)

    if (error) {
      alert(error.message)
      return
    }
    loadVariants()
  }

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Variants (sizes / colors)</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Size (e.g. M)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          required
          className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
          className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {initialLoading ? (
        <p className="text-gray-500 text-sm">Loading variants...</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {variants.map((v) => (
            <li key={v.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className={v.is_deleted ? 'text-gray-400 line-through' : ''}>
                {v.size} / {v.color} — stock: {v.stock}
              </span>
              <button
                onClick={() => toggleDeleted(v.id, v.is_deleted)}
                className={v.is_deleted ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
                title={v.is_deleted ? 'Restore' : 'Soft delete'}
              >
                {v.is_deleted ? <ArrowCounterClockwiseIcon size={16} /> : <TrashIcon size={16} />}
              </button>
            </li>
          ))}

          {variants.length === 0 && (
            <li className="px-4 py-4 text-center text-gray-500 text-sm">
              No variants yet.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}