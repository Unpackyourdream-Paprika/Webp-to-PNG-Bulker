import { ImageFile, CropSettings } from "@/types/types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Load an image and get its dimensions
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Create a dataUrl from a file
export const createDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Crop an image to 1:1 aspect ratio
export const cropImageSquare = (
  imgElement: HTMLImageElement,
  offsetX: number = 0,
  offsetY: number = 0,
  size?: number
): { dataUrl: string; width: number; height: number } => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  const originalWidth = imgElement.width;
  const originalHeight = imgElement.height;
  
  // Determine the crop size based on the smaller dimension
  const cropSize = Math.min(originalWidth, originalHeight);
  
  // Setup the canvas size
  const canvasSize = size || cropSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  
  // Calculate the crop position with offsets
  let cropX = 0;
  let cropY = 0;
  
  if (originalWidth > originalHeight) {
    // Landscape image, center horizontally
    cropX = Math.floor((originalWidth - cropSize) / 2) + offsetX;
    cropY = 0 + offsetY;
  } else {
    // Portrait or square image, center vertically
    cropX = 0 + offsetX;
    cropY = Math.floor((originalHeight - cropSize) / 2) + offsetY;
  }
  
  // Ensure crop coordinates are within the image boundaries
  cropX = Math.max(0, Math.min(cropX, originalWidth - cropSize));
  cropY = Math.max(0, Math.min(cropY, originalHeight - cropSize));
  
  // Draw the cropped image to the canvas
  ctx.drawImage(
    imgElement,
    cropX, cropY, cropSize, cropSize, // Source rectangle
    0, 0, canvasSize, canvasSize      // Destination rectangle
  );
  
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvasSize,
    height: canvasSize
  };
};

// Convert WebP to PNG
export const convertWebPToPNG = async (
  imageFile: ImageFile,
  settings: CropSettings
): Promise<string> => {
  try {
    const img = await loadImage(imageFile.dataUrl);
    
    let outputSize: number | undefined;
    if (!settings.maintainOriginalSize) {
      outputSize = settings.exportSize;
    }
    
    const { dataUrl } = cropImageSquare(
      img,
      imageFile.cropOffset.x,
      imageFile.cropOffset.y,
      outputSize
    );
    
    return dataUrl;
  } catch (error) {
    console.error("Error converting image:", error);
    throw error;
  }
};

// Process multiple images and create ZIP
export const processImagesAndDownloadZip = async (
  images: ImageFile[],
  settings: CropSettings
): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Create a folder in the zip
    const folder = zip.folder("cropped-images");
    if (!folder) throw new Error("Could not create folder in zip");
    
    // Process each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const pngDataUrl = await convertWebPToPNG(image, settings);
      
      // Remove the "data:image/png;base64," part
      const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
      
      // Create filename without extension and add .png
      const filename = image.file.name.replace(/\.[^/.]+$/, "") + ".png";
      
      // Add the file to the zip
      folder.file(filename, base64Data, { base64: true });
    }
    
    // Generate and download the zip file
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "cropped-images.zip");
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
};

// Function to download a single PNG
export const downloadSinglePNG = async (
  image: ImageFile,
  settings: CropSettings
): Promise<void> => {
  try {
    const pngDataUrl = await convertWebPToPNG(image, settings);
    const filename = image.file.name.replace(/\.[^/.]+$/, "") + ".png";
    
    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}; 