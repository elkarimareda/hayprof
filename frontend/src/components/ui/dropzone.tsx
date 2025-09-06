import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  value?: File[];
  disabled?: boolean;
}

export default function Dropzone({
  onFilesChange,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  value = [],
  disabled = false,
}: DropzoneProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);

      // Generate previews for image files
      const newPreviews = acceptedFiles.map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file);
        }
        return "";
      });

      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
    },
    [value, maxFiles, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke URL to prevent memory leaks
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    onFilesChange(newFiles);
    setPreviews(newPreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          value.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">
                  {Object.values(accept).flat().join(", ")} up to{" "}
                  {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg border border-gray-200 p-2"
            >
              {/* Thumbnail */}
              <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
