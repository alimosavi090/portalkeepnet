import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 5,
    disabled = false
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (images.length >= maxImages) {
            toast({
                title: "Maximum images reached",
                description: `You can only upload up to ${maxImages} images.`,
                variant: "destructive",
            });
            return;
        }

        const file = files[0];

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JPEG, PNG, WebP, or GIF image.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image must be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/v1/upload/image', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onImagesChange([...images, data.url]);

            toast({
                title: "Success",
                description: "Image uploaded successfully!",
            });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        try {
            const filename = imageUrl.split('/').pop();
            if (!filename) return;

            const response = await fetch(`/api/v1/upload/image/${filename}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            onImagesChange(images.filter(img => img !== imageUrl));

            toast({
                title: "Success",
                description: "Image removed successfully!",
            });
        } catch (error) {
            toast({
                title: "Delete failed",
                description: "Failed to delete image. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-border",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={disabled || uploading || images.length >= maxImages}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    {uploading ? (
                        <>
                            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Drag & drop an image here, or click to select
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPEG, PNG, WebP, or GIF (max 5MB)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {images.length} / {maxImages} images uploaded
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || images.length >= maxImages}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Select Image
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                        >
                            <img
                                src={imageUrl}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveImage(imageUrl)}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
}
