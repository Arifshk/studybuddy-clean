import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Camera } from "lucide-react";

interface ImageUploadProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 3,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = ""
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    let errorMessage = "";

    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      errorMessage = `Maximum ${maxImages} images allowed`;
      setError(errorMessage);
      return;
    }

    for (const file of files) {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errorMessage = "Only JPEG, PNG, and WebP images are allowed";
        break;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMessage = `Each image must be smaller than ${maxSizeMB}MB`;
        break;
      }

      validFiles.push(file);
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError(null);
    onChange([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Upload Area */}
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          data-testid="image-upload-area"
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
              <Camera className="w-6 h-6" />
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm text-center">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WebP up to {maxSizeMB}MB ({maxImages - images.length} remaining)
            </p>
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          data-testid="file-input"
        />

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive" data-testid="error-message">
            {error}
          </p>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <Card className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      data-testid={`preview-image-${index}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      data-testid={`remove-image-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground">
          Upload photos of your study location to help others find you easily.
        </p>
      </div>
    </div>
  );
}