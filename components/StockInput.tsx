'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function StockInput({
  variantId,
  initialStock,
}: {
  variantId: string
  initialStock: number
}) {
  const [stock, setStock] = useState(initialStock)
  const [saving, setSaving] = useState(false)

  const handleBlur = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('product_variants')
      .update({ stock })
      .eq('id', variantId)

    setSaving(false)
    if (error) alert(error.message)
  }

  return (
    <input
      type="number"
      value={stock}
      onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
      onBlur={handleBlur}
      className={`w-20 rounded-md border px-2 py-1 text-sm ${
        stock === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
      } ${saving ? 'opacity-50' : ''}`}
    />
  )
}