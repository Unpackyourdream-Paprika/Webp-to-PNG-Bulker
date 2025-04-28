'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ImageThumbnails from '@/components/ImageThumbnails'
import ExportOptions from '@/components/ExportOptions'
import { ImageFile } from '@/types/types'

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [exportSize, setExportSize] = useState<number>(512)
  const [maintainOriginalSize, setMaintainOriginalSize] = useState<boolean>(false)

  const handleImagesUploaded = (newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages])
  }

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCropPositionChange = (index: number, offsetX: number, offsetY: number) => {
    setImages(prev => {
      const newImages = [...prev]
      newImages[index] = {
        ...newImages[index],
        cropOffset: { x: offsetX, y: offsetY }
      }
      return newImages
    })
  }

  return (
    <main className="container-app">
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 mb-4 bg-[#FF6700] rounded-full flex items-center justify-center">
          {/* 심슨 캐릭터 SVG 아이콘 */}
          <svg width="85" height="85" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* 머리 */}
            <path d="M100 20 Q135 20 150 60 Q160 90 155 125 Q152 145 140 160 Q125 175 100 180 Q75 175 60 160 Q48 145 45 125 Q40 90 50 60 Q65 20 100 20" fill="#FED90F" />
            
            {/* 입 */}
            <path d="M120 140 C110 155, 90 155, 80 140" stroke="#000" strokeWidth="2" fill="none" />
            
            {/* 눈 */}
            <circle cx="80" cy="100" r="15" fill="#FFF" />
            <circle cx="120" cy="100" r="15" fill="#FFF" />
            <circle cx="80" cy="100" r="5" fill="#000" />
            <circle cx="120" cy="100" r="5" fill="#000" />
            
            {/* 코와 입 */}
            <path d="M100 120 L95 135 L105 135 Z" fill="#FED90F" stroke="#000" strokeWidth="1" />
            
            {/* 옷 */}
            <path d="M60 180 H140 V200 H60 Z" fill="#0F96D6" />
            <path d="M85 180 V200" stroke="#FFF" strokeWidth="2" />
            <path d="M115 180 V200" stroke="#FFF" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-center">
          Simpson WebP Bulker Cropper PNG Exporter
        </h1>
      </div>
      
      <ImageUploader 
        onImagesUploaded={handleImagesUploaded} 
        maxImages={100} 
      />
      
      {images.length > 0 && (
        <>
          <ImageThumbnails 
            images={images}
            onSelectImage={handleImageSelect}
            selectedIndex={selectedImageIndex}
            onCropPositionChange={handleCropPositionChange}
          />
          
          <ExportOptions 
            images={images}
            exportSize={exportSize}
            setExportSize={setExportSize}
            maintainOriginalSize={maintainOriginalSize}
            setMaintainOriginalSize={setMaintainOriginalSize}
          />
        </>
      )}
    </main>
  )
}