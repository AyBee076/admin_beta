'use client'

import ImageUpload from '@/components/ImageUpload'

export type ProductImages = {
  front: string
  back: string
  detail: string
}

export default function ProductImagesUpload({
  value,
  onChange,
}: {
  value: ProductImages
  onChange: (images: ProductImages) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Front <span className="text-red-600">*</span>
        </label>
        <ImageUpload
          currentUrl={value.front}
          onUploaded={(url) => onChange({ ...value, front: url })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Back <span className="text-red-600">*</span>
        </label>
        <ImageUpload
          currentUrl={value.back}
          onUploaded={(url) => onChange({ ...value, back: url })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Detail 
        </label>
        <ImageUpload
          currentUrl={value.detail}
          onUploaded={(url) => onChange({ ...value, detail: url })}
        />
      </div>
    </div>
  )
}