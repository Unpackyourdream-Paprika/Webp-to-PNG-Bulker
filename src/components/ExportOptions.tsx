'use client'

import React, { useState } from 'react'
import { ImageFile, CropSettings } from '@/types/types'
import { processImagesAndDownloadZip, downloadSinglePNG } from '@/lib/imageUtils'

interface ExportOptionsProps {
  images: ImageFile[]
  exportSize: number
  setExportSize: (size: number) => void
  maintainOriginalSize: boolean
  setMaintainOriginalSize: (maintain: boolean) => void
}

export default function ExportOptions({
  images,
  exportSize,
  setExportSize,
  maintainOriginalSize,
  setMaintainOriginalSize
}: ExportOptionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleExportSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10)
    if (!isNaN(size)) {
      setExportSize(size)
    }
  }
  
  const handleMaintainSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaintainOriginalSize(e.target.checked)
  }
  
  const handleExportAll = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const settings: CropSettings = {
        exportSize,
        maintainOriginalSize
      }
      
      await processImagesAndDownloadZip(images, settings)
    } catch (err) {
      console.error('Error during export:', err)
      setError('An error occurred during export. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleExportSingle = async (index: number) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const settings: CropSettings = {
        exportSize,
        maintainOriginalSize
      }
      
      await downloadSinglePNG(images[index], settings)
    } catch (err) {
      console.error('Error during export:', err)
      setError('An error occurred during export. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Export Options</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintainSize"
            checked={maintainOriginalSize}
            onChange={handleMaintainSizeChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="maintainSize" className="ml-2 block text-sm text-gray-700">
            Maintain original size (only crop to 1:1 ratio)
          </label>
        </div>
        
        {!maintainOriginalSize && (
          <div>
            <label htmlFor="outputSize" className="block text-sm font-medium text-gray-700 mb-1">
              Output PNG Size:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="outputSize"
                min="128"
                max="2048"
                step="32"
                value={exportSize}
                onChange={handleExportSizeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium w-20">{exportSize}x{exportSize}px</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleExportAll}
            disabled={isProcessing || images.length === 0}
            className={`btn btn-primary flex items-center ${
              isProcessing || images.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All as ZIP
              </>
            )}
          </button>
          
          {/* Add option to download thumbnails grid for reference */}
          <button
            onClick={() => {/* Implement thumbnail grid download */}}
            disabled={isProcessing || images.length === 0}
            className={`btn btn-secondary flex items-center ${
              isProcessing || images.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Download Thumbnail Grid
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 