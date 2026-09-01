import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductsTable from "@/components/ProductsTable";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="p-6 text-red-600">
        Error loading products: {error.message}
      </p>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      <ProductsTable initialProducts={products ?? []} />
    </div>
  );
}