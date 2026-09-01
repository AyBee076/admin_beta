'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PencilIcon, TrashIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react'

export default function ProductActions({
  productId,
  isDeleted,
}: {
  productId: string
  isDeleted: boolean
}) {
  const router = useRouter()

  const toggleDeleted = async () => {
    const confirmed = confirm(
      isDeleted ? 'Restore this product?' : 'Soft delete this product?'
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: !isDeleted })
      .eq('id', productId)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/products/${productId}/edit`}
        className="text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <PencilIcon size={18} />
      </Link>

      <button
        onClick={toggleDeleted}
        className={isDeleted ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}
        title={isDeleted ? 'Restore' : 'Soft delete'}
      >
        {isDeleted ? <ArrowCounterClockwiseIcon size={18} /> : <TrashIcon size={18} />}
      </button>
    </div>
  )
}