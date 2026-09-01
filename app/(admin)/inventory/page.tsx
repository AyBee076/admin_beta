import { createClient } from '@/lib/supabase/server'
import StockInput from '@/components/StockInput'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id, size, color, stock, is_deleted, products(name)')
    .eq('is_deleted', false)
    .order('stock', { ascending: true })

  if (error) {
    return <p className="p-6 text-red-600">Error loading inventory: {error.message}</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Inventory</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variants?.map((variant: any) => (
              <tr key={variant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{variant.products?.name}</td>
                <td className="px-4 py-3">{variant.size}</td>
                <td className="px-4 py-3">{variant.color}</td>
                <td className="px-4 py-3">
                  <StockInput variantId={variant.id} initialStock={variant.stock} />
                </td>
              </tr>
            ))}

            {variants?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No variants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}