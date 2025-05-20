import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'vehicles';

const UploadImages = forwardRef(({ onImagesUploaded, initialImages = [] }, ref) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Initial loading effect - runs only once on mount with initial images
  useEffect(() => {
    const loadInitialImages = () => {
      if (initialImages && initialImages.length > 0) {
        console.log("Initially loading images on mount:", initialImages);
        
        const formattedImages = initialImages.map(img => ({
          previewUrl: img.imageUrl,
          cloudUrl: img.imageUrl,
          fileId: img.storageId,
          uploaded: true
        }));
        
        setSelectedImages(formattedImages);
        
        // Notify parent component about initial images
        const imagesForDb = formattedImages.map(img => ({
          imageUrl: img.cloudUrl,
          storageId: img.fileId
        }));
        
        onImagesUploaded(imagesForDb);
      }
    };
    
    loadInitialImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Track changes to initialImages after initial mount
  useEffect(() => {
    // Skip empty initialImages
    if (!initialImages || initialImages.length === 0) return;
    
    // Compare current initialImages with selectedImages to avoid duplicates
    const hasChanges = initialImages.some(initialImg => 
      !selectedImages.some(selectedImg => 
        selectedImg.fileId === initialImg.storageId && 
        selectedImg.cloudUrl === initialImg.imageUrl
      )
    );
    
    // Skip if no changes detected
    if (!hasChanges) return;
    
    console.log("initialImages changed, updating...");
    
    // Create a map of existing images by fileId to avoid duplicates
    const existingImagesMap = new Map(
      selectedImages
        .filter(img => img.uploaded && img.fileId)
        .map(img => [img.fileId, img])
    );
    
    // Process new images, avoiding duplicates
    const newImages = initialImages.filter(img => 
      !existingImagesMap.has(img.storageId)
    ).map(img => ({
      previewUrl: img.imageUrl,
      cloudUrl: img.imageUrl,
      fileId: img.storageId,
      uploaded: true
    }));
    
    // Only update if we have new images
    if (newImages.length > 0) {
      console.log(`Adding ${newImages.length} new images from props`);
      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
    }
  }, [initialImages]);  // Only depend on initialImages

  useImperativeHandle(ref, () => ({
    uploadToSupabase,
    resetImages: () => {
      // Clean up any object URLs before resetting
      selectedImages.forEach(image => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
      setSelectedImages([]);
      setError(null);
      setDeleteError(null);
    }
  }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs for selected files
    const newImages = files.map(file => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
      uploaded: false
    }));

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    
    // Notify parent component with any currently uploaded images
    const currentlyUploadedImages = selectedImages.filter(
      img => img.uploaded && img.cloudUrl && img.fileId
    );
    
    if (currentlyUploadedImages.length > 0) {
      const imagesForDb = currentlyUploadedImages.map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));
      
      console.log("Currently uploaded images:", imagesForDb);
      onImagesUploaded(imagesForDb);
    }
    
    e.target.value = ''; // Reset input
  };

  const uploadToSupabase = async () => {
    setUploading(true);
    setError(null);
    
    try {
      const unuploadedImages = selectedImages.filter(img => !img.uploaded);
      console.log("Uploading images to storage:", unuploadedImages.length);
      
      // Prepare array to collect all uploaded images (both new and existing)
      let allUploadedImages = selectedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      );
      
      console.log("Already uploaded images count:", allUploadedImages.length);
      
      if (unuploadedImages.length === 0) {
        console.log("No new images to upload");
        
        // Format the data for the database
        const imagesForDb = allUploadedImages.map(img => ({
          imageUrl: img.cloudUrl,
          storageId: img.fileId
        }));
        
        console.log("Existing uploaded images:", imagesForDb);
        onImagesUploaded(imagesForDb);
        
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

        // Upload to Supabase Storage
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

        // Get public URL
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
          uploaded: true
        };
      });

      const newlyUploadedImages = await Promise.all(uploadPromises);
      console.log("All images uploaded to storage:", newlyUploadedImages);
      
      // Update state with uploaded images
      const updatedImages = [...selectedImages];
      newlyUploadedImages.forEach(uploadedImg => {
        const index = updatedImages.findIndex(img => img.previewUrl === uploadedImg.previewUrl);
        if (index !== -1) {
          updatedImages[index] = uploadedImg;
        } else {
          updatedImages.push(uploadedImg);
        }
      });
      
      setSelectedImages(updatedImages);

      // Now collect ALL uploaded images for the database (both previous and new)
      allUploadedImages = updatedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      );
      
      // Format the data for the database
      const imagesForDb = allUploadedImages.map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));

      console.log("Total uploaded images:", allUploadedImages.length);
      console.log("Sending image data to parent:", imagesForDb);
      
      // This should never be empty if we've just uploaded images
      if (imagesForDb.length === 0) {
        console.error("ERROR: No images to send to parent even though we just uploaded some!");
        return { success: false, images: [] };
      }
      
      onImagesUploaded(imagesForDb);

      return { 
        success: true, 
        images: imagesForDb 
      };
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images. Please try again.");
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
      
      // Only notify parent of remaining uploaded images with correct structure for DB
      const remainingUploadedImages = updatedImages.filter(
        img => img.uploaded && img.cloudUrl && img.fileId
      );
      
      const imagesForDb = remainingUploadedImages.map(img => ({
        imageUrl: img.cloudUrl,
        storageId: img.fileId
      }));

      console.log("Remaining uploaded images count:", remainingUploadedImages.length);
      console.log("Updating parent with remaining images:", imagesForDb);
      onImagesUploaded(imagesForDb);
    } catch (error) {
      console.error("Error removing image:", error);
      setDeleteError("An unexpected error occurred while deleting the image.");
    }
  };

  return (
    <div>
      <h2 className="font-medium text-xl mb-6">Car Images</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {error}
        </div>
      )}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {deleteError}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {selectedImages.map((image, index) => (
          <div key={image.previewUrl} className="relative group">
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
            <div className='border rounded-xl border-dotted border-primary bg-blue-100 p-10 cursor-pointer hover:shadow-md h-40 flex items-center justify-center'>
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
