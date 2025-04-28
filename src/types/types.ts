export interface ImageFile {
  file: File;
  id: string;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  cropOffset: {
    x: number;
    y: number;
  };
}

export interface CropSettings {
  exportSize: number;
  maintainOriginalSize: boolean;
} 