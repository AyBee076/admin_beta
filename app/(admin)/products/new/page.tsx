"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TrashIcon } from "@phosphor-icons/react";
import ImageUpload from "@/components/ImageUpload";

type Category = {
  id: string;
  name: string;
};

type DraftVariant = {
  tempId: string;
  size: string;
  color: string;
  stock: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Draft variants, not saved yet
  const [variants, setVariants] = useState<DraftVariant[]>([]);
  const [vSize, setVSize] = useState("");
  const [vColor, setVColor] = useState("");
  const [vStock, setVStock] = useState("0");

  useEffect(() => {
    let ignore = false;

    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (!ignore && data) setCategories(data);
    };

    fetchCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const addDraftVariant = () => {
    if (!vSize || !vColor) return;
    setVariants((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        size: vSize,
        color: vColor,
        stock: vStock,
      },
    ]);
    setVSize("");
    setVColor("");
    setVStock("0");
  };

  const removeDraftVariant = (tempId: string) => {
    setVariants((prev) => prev.filter((v) => v.tempId !== tempId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // Step 1: insert the product, get its new id back
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId || null,
        image_url: imageUrl || null,
        is_deleted: false,
      })
      .select()
      .single();

    if (productError || !product) {
      setError(productError?.message ?? "Failed to create product");
      setLoading(false);
      return;
    }

    // Step 2: insert all draft variants using the new product's id
    if (variants.length > 0) {
      const rows = variants.map((v) => ({
        product_id: product.id,
        size: v.size,
        color: v.color,
        stock: parseInt(v.stock, 10) || 0,
      }));

      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(rows);

      if (variantError) {
        // Product was created, but variants failed — let the user know clearly
        setError(
          `Product saved, but variants failed: ${variantError.message}. You can add them from the edit page.`,
        );
        setLoading(false);
        return;
      }
    }

    router.push("/products");
    router.refresh();
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>
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

        {/* Draft variants section */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">
            Variants (sizes / colors) — optional
          </label>

          <div className="flex gap-2 mb-3 flex-wrap">
            <input
              type="text"
              placeholder="Size (e.g. M)"
              value={vSize}
              onChange={(e) => setVSize(e.target.value)}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Color"
              value={vColor}
              onChange={(e) => setVColor(e.target.value)}
              className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Stock"
              value={vStock}
              onChange={(e) => setVStock(e.target.value)}
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={addDraftVariant}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
            >
              + Add
            </button>
          </div>

          {variants.length > 0 && (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {variants.map((v) => (
                <li
                  key={v.tempId}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>
                    {v.size} / {v.color} — stock: {v.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDraftVariant(v.tempId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save product"}
        </button>
      </form>
    </div>
  );
}
