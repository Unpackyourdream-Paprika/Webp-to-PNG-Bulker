'use client'

import { useState, useRef, useEffect } from 'react'
import { ImageFile } from '@/types/types'
import { cropImageSquare, loadImage } from '@/lib/imageUtils'
import ImageEditor from './ImageEditor'

interface ImageThumbnailsProps {
  images: ImageFile[]
  onSelectImage: (index: number) => void
  selectedIndex: number | null
  onCropPositionChange: (index: number, offsetX: number, offsetY: number) => void
}

export default function ImageThumbnails({ 
  images, 
  onSelectImage, 
  selectedIndex, 
  onCropPositionChange 
}: ImageThumbnailsProps) {
  const [croppedPreviews, setCroppedPreviews] = useState<string[]>([])
  const [showEditor, setShowEditor] = useState(false)
  
  useEffect(() => {
    // Generate cropped previews for all images
    const generatePreviews = async () => {
      const previews = await Promise.all(
        images.map(async (image) => {
          try {
            const img = await loadImage(image.dataUrl)
            const { dataUrl } = cropImageSquare(
              img, 
              image.cropOffset.x, 
              image.cropOffset.y, 
              200 // Preview size for thumbnails
            )
            return dataUrl
          } catch (err) {
            console.error('Error generating preview:', err)
            return ''
          }
        })
      )
      
      setCroppedPreviews(previews)
    }
    
    generatePreviews()
  }, [images])
  
  const handleImageClick = (index: number) => {
    onSelectImage(index)
    setShowEditor(true)
  }
  
  const handleEditorClose = () => {
    setShowEditor(false)
  }
  
  const handleCropChange = (offsetX: number, offsetY: number) => {
    if (selectedIndex !== null) {
      onCropPositionChange(selectedIndex, offsetX, offsetY)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Uploaded Images ({images.length})</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`
              relative aspect-square overflow-hidden rounded-lg cursor-pointer border-2
              ${selectedIndex === index ? 'border-primary' : 'border-transparent'}
              hover:border-primary hover:shadow-md transition-all duration-200
            `}
            onClick={() => handleImageClick(index)}
          >
            {croppedPreviews[index] ? (
              <img 
                src={croppedPreviews[index]} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              {image.file.name}
            </div>
          </div>
        ))}
      </div>
      
      {showEditor && selectedIndex !== null && (
        <ImageEditor
          image={images[selectedIndex]}
          onClose={handleEditorClose}
          onCropChange={handleCropChange}
        />
      )}
    </div>
  )
} 