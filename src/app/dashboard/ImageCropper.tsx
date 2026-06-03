'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

type Area = { x: number; y: number; width: number; height: number }

async function getCroppedImg(imageSrc: string, crop: Area): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext('2d')!
  const scaleX = img.naturalWidth / img.width
  const scaleY = img.naturalHeight / img.height
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, 400, 400)
  return new Promise(resolve => canvas.toBlob(blob => resolve(new File([blob!], 'avatar.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.9))
}

export default function ImageCropper({
  imageSrc,
  onDone,
  onCancel,
}: {
  imageSrc: string
  onDone: (file: File, preview: string) => void
  onCancel: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  async function handleDone() {
    if (!croppedArea) return
    const file = await getCroppedImg(imageSrc, croppedArea)
    onDone(file, URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom slider */}
      <div className="bg-black px-6 py-3 flex items-center gap-3">
        <span className="text-white/50 text-xs">ย่อ</span>
        <input type="range" min={1} max={3} step={0.1} value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-1 accent-[#E31E24]" />
        <span className="text-white/50 text-xs">ขยาย</span>
      </div>

      {/* Buttons */}
      <div className="bg-black px-5 pb-6 pt-2 flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-white/20 text-white text-sm font-semibold py-3 rounded-xl">
          ยกเลิก
        </button>
        <button onClick={handleDone}
          className="flex-1 bg-[#003087] text-white text-sm font-semibold py-3 rounded-xl">
          ใช้รูปนี้ ✓
        </button>
      </div>
    </div>
  )
}
