'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ProductActions from '@/components/ProductsActions'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  is_deleted: boolean
}

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((current) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as Product, ...current]
            }
            if (payload.eventType === 'UPDATE') {
              return current.map((p) =>
                p.id === payload.new.id ? (payload.new as Product) : p
              )
            }
            if (payload.eventType === 'DELETE') {
              return current.filter((p) => p.id !== payload.old.id)
            }
            return current
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Image</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200" />
                )}
              </td>
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">{product.price}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    product.is_deleted
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {product.is_deleted ? 'Deleted' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3">
                <ProductActions productId={product.id} isDeleted={product.is_deleted} />
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}