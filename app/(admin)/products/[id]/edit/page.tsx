'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ImageUpload'
import VariantManager from '@/components/VariantManager'

type Category = {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      const supabase = createClient()

      const { data: cats } = await supabase.from('categories').select('id, name')
      if (!ignore && cats) setCategories(cats)

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (ignore) return

      if (error) {
        setError(error.message)
        setInitialLoading(false)
        return
      }

      if (product) {
        setName(product.name ?? '')
        setDescription(product.description ?? '')
        setPrice(String(product.price ?? ''))
        setCategoryId(product.category_id ?? '')
        setImageUrl(product.image_url ?? '')
        setIsDeleted(product.is_deleted ?? false)
      }

      setInitialLoading(false)
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId || null,
        image_url: imageUrl || null,
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/products')
    router.refresh()
  }

  const toggleDeleted = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: !isDeleted })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setIsDeleted(!isDeleted)
    setLoading(false)
    router.refresh()
  }

  if (initialLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isDeleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {isDeleted ? 'Deleted' : 'Active'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <ImageUpload currentUrl={imageUrl} onUploaded={(url) => setImageUrl(url)} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={toggleDeleted}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              isDeleted
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isDeleted ? 'Restore product' : 'Delete product'}
          </button>
        </div>
      </form>

      <VariantManager productId={id} />
    </div>
  )
}