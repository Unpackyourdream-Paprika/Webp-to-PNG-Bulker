'use client'

import { useState, useRef, useEffect } from 'react'
import { ImageFile } from '@/types/types'
import { loadImage } from '@/lib/imageUtils'

interface ImageEditorProps {
  image: ImageFile
  onClose: () => void
  onCropChange: (offsetX: number, offsetY: number) => void
}

export default function ImageEditor({ image, onClose, onCropChange }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [cropOffset, setCropOffset] = useState(image.cropOffset)
  
  // Track the original image dimensions
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    cropSize: 0,
    scale: 1
  })

  // Set up the canvas on first render
  useEffect(() => {
    const setupCanvas = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      try {
        const img = await loadImage(image.dataUrl)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Set canvas dimensions (max 500px for editor)
        const maxSize = 500
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        
        const displayWidth = img.width * scale
        const displayHeight = img.height * scale
        
        canvas.width = displayWidth
        canvas.height = displayHeight
        
        // Save dimensions and scale
        const cropSize = Math.min(img.width, img.height)
        setDimensions({
          width: img.width,
          height: img.height,
          cropSize,
          scale
        })
        
        // Draw the image
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight)
        
        // Draw crop overlay
        drawCropOverlay(ctx, displayWidth, displayHeight, cropSize * scale, cropOffset)
      } catch (err) {
        console.error('Error setting up canvas:', err)
      }
    }
    
    setupCanvas()
  }, [image.dataUrl])
  
  // Redraw canvas when crop offset changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const redrawCanvas = async () => {
      try {
        const img = await loadImage(image.dataUrl)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        drawCropOverlay(
          ctx, 
          canvas.width, 
          canvas.height, 
          dimensions.cropSize * dimensions.scale, 
          cropOffset
        )
      } catch (err) {
        console.error('Error redrawing canvas:', err)
      }
    }
    
    redrawCanvas()
  }, [cropOffset, dimensions])
  
  // Draw the crop overlay on the canvas
  const drawCropOverlay = (
    ctx: CanvasRenderingContext2D, 
    canvasWidth: number, 
    canvasHeight: number, 
    cropSize: number,
    offset: { x: number, y: number }
  ) => {
    const { scale } = dimensions
    
    // Calculate crop box position
    let cropX = 0
    let cropY = 0
    
    if (canvasWidth > canvasHeight) {
      // Landscape image
      cropX = (canvasWidth - cropSize) / 2 + (offset.x * scale)
      cropY = (offset.y * scale)
    } else {
      // Portrait or square image
      cropX = (offset.x * scale)
      cropY = (canvasHeight - cropSize) / 2 + (offset.y * scale)
    }
    
    // Ensure crop box is within image bounds
    cropX = Math.max(0, Math.min(cropX, canvasWidth - cropSize))
    cropY = Math.max(0, Math.min(cropY, canvasHeight - cropSize))
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.beginPath()
    
    // Draw outer rectangle
    ctx.rect(0, 0, canvasWidth, canvasHeight)
    
    // Draw inner crop area (cutout)
    ctx.moveTo(cropX, cropY)
    ctx.lineTo(cropX + cropSize, cropY)
    ctx.lineTo(cropX + cropSize, cropY + cropSize)
    ctx.lineTo(cropX, cropY + cropSize)
    ctx.closePath()
    ctx.fill('evenodd')
    
    // Draw crop box border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(cropX, cropY, cropSize, cropSize)
    
    // Draw grid lines for rule of thirds
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(cropX + cropSize / 3, cropY)
    ctx.lineTo(cropX + cropSize / 3, cropY + cropSize)
    ctx.moveTo(cropX + (cropSize / 3) * 2, cropY)
    ctx.lineTo(cropX + (cropSize / 3) * 2, cropY + cropSize)
    
    // Horizontal lines
    ctx.moveTo(cropX, cropY + cropSize / 3)
    ctx.lineTo(cropX + cropSize, cropY + cropSize / 3)
    ctx.moveTo(cropX, cropY + (cropSize / 3) * 2)
    ctx.lineTo(cropX + cropSize, cropY + (cropSize / 3) * 2)
    ctx.stroke()
  }
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setStartPos({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    })
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    
    const dx = (e.nativeEvent.offsetX - startPos.x) / dimensions.scale
    const dy = (e.nativeEvent.offsetY - startPos.y) / dimensions.scale
    
    setCropOffset({
      x: cropOffset.x + dx,
      y: cropOffset.y + dy
    })
    
    setStartPos({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleSave = () => {
    onCropChange(cropOffset.x, cropOffset.y)
    onClose()
  }
  
  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Adjust Crop Position</h3>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className={`border ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Click and drag to adjust the crop position. The image will be cropped to a 1:1 ratio.</p>
        </div>
        
        <div className="mt-4 flex justify-end gap-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="btn btn-primary"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
} 