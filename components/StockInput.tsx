'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PencilSimpleIcon, TrashIcon, CheckIcon, XIcon } from '@phosphor-icons/react'

export default function StockInput({
  variantId,
  initialStock,
  onDeleted,
}: {
  variantId: string
  initialStock: number
  onDeleted?: (variantId: string) => void
}) {
  const [stock, setStock] = useState(initialStock)
  const [draftStock, setDraftStock] = useState(initialStock)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const startEditing = () => {
    setDraftStock(stock)
    setError('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setDraftStock(stock)
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock: draftStock })
      .eq('id', variantId)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setStock(draftStock)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Remove this variant? This cannot be undone.')) return

    setDeleting(true)
    setError('')

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)

    setDeleting(false)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    onDeleted?.(variantId)
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <input
          type="number"
          value={draftStock}
          onChange={(e) => setDraftStock(parseInt(e.target.value, 10) || 0)}
          autoFocus
          disabled={saving}
          className={`w-20 rounded-md border px-2 py-1 text-sm ${
            draftStock === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${saving ? 'opacity-50' : ''}`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
          aria-label="Save stock"
        >
          <CheckIcon size={16} />
        </button>
        <button
          type="button"
          onClick={cancelEditing}
          disabled={saving}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Cancel"
        >
          <XIcon size={16} />
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`w-20 rounded-md border px-2 py-1 text-sm ${
          stock === 0 ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300'
        }`}
      >
        {stock}
      </span>
      <button
        type="button"
        onClick={startEditing}
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
        aria-label="Edit stock"
      >
        <PencilSimpleIcon size={16} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
        aria-label="Delete variant"
      >
        <TrashIcon size={16} />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}