import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'vehicles';

const UploadImages = forwardRef(({ onImagesUploaded, initialImages = [], error }, ref) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const initialLoadComplete = useRef(false);
  const prevInitialImagesRef = useRef([]);
  const { toast } = useToast();


  useEffect(() => {
    if (initialLoadComplete.current) return;
    
    const loadInitialImages = () => {
      if (initialImages && initialImages.length > 0) {
        console.log("Initially loading images on mount:", initialImages);
        
        const formattedImages = initialImages.map(img => ({
          previewUrl: img.imageUrl,
          cloudUrl: img.imageUrl,
          fileId: img.storageId,
          uploaded: true,
          id: img.storageId || uuidv4(),
          signature: img.storageId
        }));
        
        setSelectedImages(formattedImages);
        prevInitialImagesRef.current = [...initialImages];
        initialLoadComplete.current = true;
      }
    };
    
    loadInitialImages();
  }, [initialImages]);


  useEffect(() => {
    if (!initialLoadComplete.current || !initialImages || initialImages.length === 0) return;
    
    const areImagesEqual = (prevImages, newImages) => {
      if (prevImages.length !== newImages.length) return false;
      
      return prevImages.every((prevImg, index) => {
        const newImg = newImages[index];
        return prevImg.imageUrl === newImg.imageUrl && 
               prevImg.storageId === newImg.storageId;
      });
    };
    
    if (areImagesEqual(prevInitialImagesRef.current, initialImages)) return;
    
    console.log("initialImages changed, updating...");
    prevInitialImagesRef.current = [...initialImages];
    
 
    const existingImagesMap = new Map(
      selectedImages.map(img => [img.fileId || img.signature, img])
    );
    
    
    const newImages = initialImages.filter(img => 
      !existingImagesMap.has(img.storageId)
    ).map(img => ({
      previewUrl: img.imageUrl,
      cloudUrl: img.imageUrl,
      fileId: img.storageId,
      uploaded: true,
      id: img.storageId || uuidv4(),
      signature: img.storageId
    }));
    
    if (newImages.length > 0) {
      setSelectedImages(prevImages => [...prevImages, ...newImages]);
    }
  }, [initialImages]);

  useImperativeHandle(ref, () => ({
    uploadToSupabase,
    hasSelectedImages: () => selectedImages.length > 0,
    resetImages: () => {
      
      selectedImages.forEach(image => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
      setSelectedImages([]);
      setUploadError(null);
      setDeleteError(null);
      initialLoadComplete.current = false;
    }
  }));

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);

    
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setUploadError(`${invalidFiles.length} file(s) were not images and were rejected.`);
      return;
    }

    
    const existingSignatures = new Map(
      selectedImages.map(img => [img.signature, true])
    );

    
    const newImages = await Promise.all(
      files
        .filter(file => {
          const fileSignature = `${file.name}-${file.size}`;
          return !existingSignatures.has(fileSignature);
        })
        .map(async (file) => {
          const uniqueId = uuidv4();
          const previewUrl = URL.createObjectURL(file);
          
          
          const fileExt = file.name.split('.').pop();
          const fileName = `${uniqueId}.${fileExt}`;
          const filePath = `car-images/${fileName}`;

          try {
            const { data, error } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) throw error;

            const { data: urlData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(filePath);

            return {
              file,
              previewUrl,
              cloudUrl: urlData.publicUrl,
              fileId: filePath,
              uploaded: true,
              id: uniqueId,
              signature: `${file.name}-${file.size}`,
            };
          } catch (error) {
            console.error("Error uploading image:", error);
            return {
              file,
              previewUrl,
              uploaded: false,
              id: uniqueId,
              signature: `${file.name}-${file.size}`,
            };
          }
        })
    );

    if (newImages.length === 0) {
      setUploadError("No new unique images were selected.");
      return;
    }

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    setUploadError(null);

    
    const allUploadedImages = updatedImages
      .filter(img => img.uploaded && img.cloudUrl && img.fileId)
      .map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));

    if (allUploadedImages.length > 0) {
      onImagesUploaded(allUploadedImages);
    }

    e.target.value = '';
  };

  const uploadToSupabase = async () => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const unuploadedImages = selectedImages.filter(img => !img.uploaded);
      console.log("Uploading images to storage:", unuploadedImages.length);
      
      
      let allUploadedImages = selectedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      );
      
      console.log("Already uploaded images count:", allUploadedImages.length);
      
      if (unuploadedImages.length === 0) {
        console.log("No new images to upload");
        
        
        const imagesForDb = allUploadedImages.map(img => ({
          imageUrl: img.cloudUrl,
          storageId: img.fileId
        }));
        
        console.log("Existing uploaded images:", imagesForDb);
        onImagesUploaded(imagesForDb);
        
        toast({
          title: "Images uploaded",
          description: `Successfully uploaded ${imagesForDb.length} image${imagesForDb.length > 1 ? 's' : ''}.`,
        });
        
        return { 
          success: true, 
          images: imagesForDb 
        };
      }

      const uploadPromises = unuploadedImages.map(async (image) => {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `car-images/${fileName}`;

        console.log("Uploading image:", fileName);

        
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, image.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error("Error uploading to storage:", error);
          throw error;
        }

        
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        console.log("Image uploaded successfully:", {
          url: urlData.publicUrl,
          path: filePath
        });

        return {
          ...image,
          cloudUrl: urlData.publicUrl,
          fileId: filePath,
          uploaded: true,
          signature: filePath 
        };
      });

      const newlyUploadedImages = await Promise.all(uploadPromises);
      console.log("All images uploaded to storage:", newlyUploadedImages);
      
      
      const updatedImages = [...selectedImages];
      newlyUploadedImages.forEach(uploadedImg => {
        const index = updatedImages.findIndex(img => img.id === uploadedImg.id);
        if (index !== -1) {
          updatedImages[index] = uploadedImg;
        } else {
          updatedImages.push(uploadedImg);
        }
      });
      
      setSelectedImages(updatedImages);

      
      allUploadedImages = updatedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      );
      
      
      const imagesForDb = allUploadedImages.map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));

      console.log("Total uploaded images:", allUploadedImages.length);
      console.log("Sending image data to parent:", imagesForDb);
      
      
      if (imagesForDb.length === 0) {
        console.error("ERROR: No images to send to parent even though we just uploaded some!");
        return { success: false, images: [] };
      }
      
      onImagesUploaded(imagesForDb);

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${imagesForDb.length} image${imagesForDb.length > 1 ? 's' : ''}.`,
      });

      return { 
        success: true, 
        images: imagesForDb 
      };
    } catch (error) {
      console.error("Error uploading images:", error);
      setUploadError("Failed to upload images. Please try again.");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
      });
      return { success: false, images: [] };
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    try {
      setDeleteError(null);
      const imageToRemove = selectedImages[index];
      
      // Only delete from Supabase if it was already uploaded
      if (imageToRemove.uploaded && imageToRemove.fileId) {
        console.log("Deleting image from storage:", imageToRemove.fileId);
        
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([imageToRemove.fileId]);
          
        if (error) {
          console.error("Error removing image from storage:", error);
          setDeleteError("Failed to delete image from storage. Please try again.");
          return;
        }

        console.log("Image deleted from storage successfully");
      }

      // Revoke the preview URL to free up memory
      URL.revokeObjectURL(imageToRemove.previewUrl);

      const updatedImages = selectedImages.filter((_, i) => i !== index);
      setSelectedImages(updatedImages);
      
      // Collect uploaded images
      const uploadedImgs = updatedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      ).map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));
      
      // Collect pending images
      const pendingImgs = updatedImages.filter(
        img => !img.uploaded
      ).map(img => ({
        imageUrl: img.previewUrl,
        storageId: img.id || `pending-${uuidv4()}`,
        isPending: true
      }));
      
      // Combine both types
      const allImages = [...uploadedImgs, ...pendingImgs];

      console.log("Remaining images (uploaded + pending):", allImages.length);
      onImagesUploaded(allImages);

      toast({
        title: "Image deleted",
        description: "Image has been successfully removed.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      setDeleteError("An unexpected error occurred while deleting the image.");
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
      });
    }
  };

  return (
    <div>
      <h2 className="font-medium text-xl mb-6">Car Images</h2>
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {uploadError}
        </div>
      )}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {deleteError}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {selectedImages.map((image, index) => (
          <div key={`image-${index}-${image.fileId || image.previewUrl}`} className="relative group">
            <img
              src={image.previewUrl}
              alt={`Preview ${index + 1}`}
              className="w-full h-40 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl"></div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeImage(index);
              }}
              className="absolute top-2 right-2 bg-white shadow-md rounded-full w-7 h-7 flex items-center justify-center 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100
                         focus:outline-none transform hover:scale-110"
              aria-label="Remove image"
            >
              <svg 
                className="w-4 h-4 text-gray-600" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            {!image.uploaded && (
              <div className="absolute bottom-2 right-2">
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Not uploaded
                </div>
              </div>
            )}
            {uploading && !image.uploaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ))}
        
        <div className="relative">
          <label htmlFor="upload-images" className="block">
            <div className={`border rounded-xl border-dotted border-primary bg-blue-100 p-10 cursor-pointer hover:shadow-md h-40 flex items-center justify-center ${error ? 'border-red-500 border-2' : ''}`}>
              <h2 className='text-lg text-center text-primary'>
                {uploading ? 'Uploading...' : '+ Add Images'}
              </h2>
            </div>
          </label>
          <input 
            type="file" 
            multiple={true} 
            id="upload-images"
            className='hidden'
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
});

export default UploadImages;
