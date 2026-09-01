import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: deletedProducts },
    { count: totalCategories },
    { count: totalVariants },
    { data: lowStockVariants },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_deleted', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('product_variants').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase
      .from('product_variants')
      .select('id, size, color, stock, products(name)')
      .eq('is_deleted', false)
      .lte('stock', 5)
      .order('stock', { ascending: true })
      .limit(5),
  ])

  const stats = [
    { label: 'Active products', value: activeProducts ?? 0 },
    { label: 'Deleted products', value: deletedProducts ?? 0 },
    { label: 'Total products', value: totalProducts ?? 0 },
    { label: 'Categories', value: totalCategories ?? 0 },
    { label: 'Active variants', value: totalVariants ?? 0 },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 p-4"
          >
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Low stock (5 or fewer)</h2>
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
              {lowStockVariants?.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{v.products?.name}</td>
                  <td className="px-4 py-3">{v.size}</td>
                  <td className="px-4 py-3">{v.color}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{v.stock}</td>
                </tr>
              ))}

              {(!lowStockVariants || lowStockVariants.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No low stock items 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}