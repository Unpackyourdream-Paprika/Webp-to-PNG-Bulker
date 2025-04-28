'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { createDataUrl, loadImage } from '@/lib/imageUtils'
import { ImageFile } from '@/types/types'

interface ImageUploaderProps {
  onImagesUploaded: (images: ImageFile[]) => void
  maxImages: number
}

export default function ImageUploader({ onImagesUploaded, maxImages }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const processedImages: ImageFile[] = []
      
      for (const file of acceptedFiles) {
        // Verify file is WebP
        if (!file.type.includes('webp')) {
          console.warn(`Skipping non-WebP file: ${file.name}`)
          continue
        }
        
        // Create data URL
        const dataUrl = await createDataUrl(file)
        
        // Load image to get dimensions
        const img = await loadImage(dataUrl)
        
        processedImages.push({
          file,
          id: uuidv4(),
          dataUrl,
          originalWidth: img.width,
          originalHeight: img.height,
          cropOffset: { x: 0, y: 0 } // Default center crop
        })
      }
      
      if (processedImages.length > 0) {
        onImagesUploaded(processedImages)
      } else {
        setError('No valid WebP files were found. Please upload WebP images only.')
      }
    } catch (err) {
      console.error('Error processing uploaded files:', err)
      setError('An error occurred while processing the images.')
    } finally {
      setIsLoading(false)
    }
  }, [onImagesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/webp': ['.webp']
    },
    maxFiles: maxImages,
    onDrop: processFiles
  })

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="py-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className="mt-4 text-gray-600">Processing images...</p>
          </div>
        ) : (
          <div className="py-6">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-4 text-lg font-medium">
              {isDragActive ? 'Drop the WebP files here' : 'Drag & drop WebP files here'}
            </p>
            <p className="mt-2 text-gray-500">or click to select files</p>
            <p className="mt-1 text-sm text-gray-400">
              Up to {maxImages} WebP images, which will be cropped to 1:1 ratio
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
} 