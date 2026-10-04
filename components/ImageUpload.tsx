"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export default function ImageUpload({
  currentUrl,
  onUploaded,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    setPreview(data.publicUrl);
    onUploaded(data.publicUrl);
    setUploading(false);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {preview && (
        <Image
          src={preview}
          alt="Product preview"
          width={128}
          height={128}
          className="w-32 h-32 object-cover rounded-md border border-gray-200 mb-2"
          
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Choose file
      </Button>

      {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
