import Header from "@/components/Header";
import React, { useState, useRef, useEffect } from "react";
import carDetails from "@/Shared/carDetails.json";
import InputField from "./components/InputField";
import DropdownField from "./components/DropdownField";
import TextAreaField from "./components/TextAreaField";
import { Separator } from "@/components/ui/separator";
import features from "@/Shared/features.json";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { db } from "../../configs";
import { eq } from "drizzle-orm";
import { CarListing, CarImages } from "../../configs/schema";
import IconField from "./components/IconField";
import UploadImages from "./components/UploadImages";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import moment from "moment";
import Service from "@/Shared/Service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

function AddListing() {
  const [formData, setFormData] = useState({});
  const [featuresData, setFeaturesData] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carInfo, setCarInfo] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [formError, setFormError] = useState("");
  const uploadImagesRef = useRef(null);
  const {user} = useUser();
  const mode = searchParams.get("mode");
  const recordId = searchParams.get("id");
  const { toast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    if(mode=='edit')
    {
      GetListingDetail();
    }
  },[]);

  const GetListingDetail = async () => {
    const result = await db.select().from(CarListing).innerJoin(CarImages, eq(CarListing.id, CarImages.carListingId)).where(eq(CarListing.id, recordId));

    const resp = Service.FormatResult(result);
    
    // Populate both carInfo and formData for editing
    if (resp[0]) {
      const { features, images, ...carData } = resp[0];
      setCarInfo(carData);
      setFormData(carData); // Initialize formData with the same values
      setFeaturesData(features || {});
      
      // Extract initial images data from the fetched listing
      if (images && images.length > 0) {
        console.log("Setting initial images from database:", images);
        setUploadedImages(images);
      }
    }
  }

  const handleInputChange = (name, value) => {
    // Update formData state
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Also update carInfo state to keep UI in sync
    setCarInfo((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear validation error for this field when user makes a change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFeatureChange = (name, value) => {
    setFeaturesData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImagesUploaded = (images) => {
    // Prevent redundant state updates if images haven't changed
    if (JSON.stringify(images) === JSON.stringify(uploadedImages)) {
      console.log("Images unchanged, skipping update");
      return;
    }
    
    console.log("Received images in parent:", images);
    setUploadedImages(images);
    
    // Clear image validation error when images are uploaded
    if (validationErrors.images) {
      setValidationErrors(prev => ({
        ...prev,
        images: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Validate required fields
    carDetails.carDetails.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
    });
    
    // Price format validation
    const priceFields = ['originalPrice', 'sellingPrice'];
    priceFields.forEach(field => {
      if (formData[field]) {
        const priceRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
        if (!priceRegex.test(formData[field])) {
          errors[field] = 'Price must be a valid number (e.g., 1000 or 1000.00)';
          isValid = false;
        }
      }
    });
    
    // Selling price required validation
    if (!formData.sellingPrice) {
      errors.sellingPrice = 'Selling price is required';
      isValid = false;
    }
    
    // Year validation
    if (formData.year) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.year = `Year must be between 1900 and ${currentYear + 1}`;
        isValid = false;
      }
    }
    
    // VIN validation (if provided)
    if (formData.vin && formData.vin.trim() !== '') {
      // Basic VIN validation - 17 alphanumeric characters except I, O, Q
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
      if (!vinRegex.test(formData.vin)) {
        errors.vin = 'VIN must be 17 characters (letters and numbers only, excluding I, O, Q)';
        isValid = false;
      }
    }
    
    // Images validation - now uploadedImages includes both uploaded and pending images
    if (uploadedImages.length === 0) {
      errors.images = 'At least one image is required';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Validate form before submission
      if (!validateForm()) {
        setFormError("Please fix the validation errors before submitting.");
        setIsSubmitting(false);
        return;
      }

      // Check if user is authenticated and has an email
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        console.error("User email not available. Please ensure you're logged in.");
        setFormError("Please log in to submit a listing.");
        setIsSubmitting(false);
        return;
      }

      let imagesToSave = [];
      
      // First upload any pending images
      if (uploadImagesRef.current?.uploadToSupabase) {
        try {
          const { success, images } = await uploadImagesRef.current.uploadToSupabase();
          if (!success) {
            console.error("Failed to upload images to storage");
            setFormError("Failed to upload images. Please try again.");
            setIsSubmitting(false);
            return;
          }
          
          // Use the returned images from the upload function
          imagesToSave = images.filter(img => !img.isPending); // Filter out any pending images
          console.log("Images ready for saving:", imagesToSave);
        } catch (uploadError) {
          console.error("Error during image upload:", uploadError);
          setFormError("Error uploading images: " + uploadError.message);
          setIsSubmitting(false);
          return;
        }
      } else if (uploadedImages.length > 0) {
        // If we have existing images but no new ones to upload, use the existing ones
        imagesToSave = uploadedImages.filter(img => !img.isPending); // Filter out any pending images
        console.log("Using existing images:", imagesToSave);
      }

      let carListingId;
      
      try {
        if (mode === 'edit' && recordId) {
          // Update existing listing
          const updateResult = await db.update(CarListing)
            .set({
              ...formData,
              features: featuresData,
              updatedBy: userEmail,
              updatedOn: moment().format("YYYY-MM-DD")
            })
            .where(eq(CarListing.id, recordId))
            .returning();
          
          carListingId = recordId;
          console.log("Car listing updated with ID:", carListingId);
          
          // Delete existing images if we have new ones to save
          if (imagesToSave && imagesToSave.length > 0) {
            try {
              // First delete all existing images from the database
              await db.delete(CarImages).where(eq(CarImages.carListingId, carListingId));
              console.log("Deleted existing images for car listing ID:", carListingId);
            } catch (deleteError) {
              console.error("Error deleting existing images:", deleteError);
              setFormError("Error updating images. Some data may not be saved properly.");
            }
          }
        } else {
          // Insert new car listing
          const carListingResult = await db.insert(CarListing).values({
            ...formData,
            features: featuresData,
            createdBy: userEmail,
            postedOn: moment().format("YYYY-MM-DD")
          }).returning();

          // Get the inserted car listing ID
          carListingId = carListingResult?.[0]?.id;
        }
      } catch (dbError) {
        console.error("Database error during car listing save:", dbError);
        setFormError("Error saving listing information. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      if (!carListingId) {
        console.error("Failed to retrieve car listing ID");
        setFormError("Error processing your request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Insert all uploaded images
      if (imagesToSave && imagesToSave.length > 0) {
        try {
          // Ensure each image has the required fields
          const imageInserts = imagesToSave.map(image => {
            if (!image.imageUrl || !image.storageId) {
              console.error("Invalid image data:", image);
              throw new Error("Invalid image data structure");
            }
            return {
              imageUrl: image.imageUrl,
              storageId: image.storageId,
              carListingId: carListingId
            };
          });

          console.log("Attempting to insert images:", imageInserts);

          // Insert images one by one to better track errors
          for (const imageData of imageInserts) {
            const result = await db.insert(CarImages).values(imageData).returning();
            console.log("Inserted image:", result);
          }

          console.log("Successfully saved all images to database");
        } catch (imageError) {
          console.error("Error saving images to database:", imageError);
          setFormError("Error saving images. Your listing was created but images may be missing.");
          // Navigate anyway since the listing was created
          navigate("/profile");
          return;
        }
      } else {
        console.log("No images to save to database");
      }

      // Clear the form and images after successful submission
      setFormData({});
      setFeaturesData([]);
      setUploadedImages([]);
      if (uploadImagesRef.current) {
        // Reset the UploadImages component
        uploadImagesRef.current.resetImages();
      }

      // Navigate to the profile page after successful submission
      navigate("/profile");

      toast({
        title: mode === 'edit' ? "Listing updated" : "Listing created",
        description: mode === 'edit' ? "Your car listing has been successfully updated." : "Your car listing has been successfully created.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError("An unexpected error occurred. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your listing. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="px-10 md:px-20 my-10">
        <h2 className="font-bold text-4xl pb-5">{mode === 'edit' ? 'Edit' : 'Add'} Listing </h2>
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <form className="p-10 border rounded-lg">
          {/*car details*/}
          <div>
            <h2 className="font-medium text-xl mb-6">Car Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {carDetails.carDetails.map((item, index) => (
                <div key={index}>
                  <label className="text-sm flex gap-2 items-center mb-2">
                    <IconField iconName={item?.icon} />
                    {item?.label}
                    {item.required && <span className="text-red-500">*</span>}
                  </label>
                  {item.fieldType == "text" || item.fieldType == "number" ? (
                    <InputField
                      item={item}
                      handleInputChange={handleInputChange}
                      carInfo={carInfo}
                      error={validationErrors[item.name]}
                    />
                  ) : item.fieldType == "dropdown" ? (
                    <DropdownField
                      item={item}
                      handleInputChange={handleInputChange}
                      carInfo={carInfo}
                      error={validationErrors[item.name]}
                    />
                  ) : item.fieldType == "textarea" ? (
                    <TextAreaField
                      item={item}
                      handleInputChange={handleInputChange}
                      carInfo={carInfo}
                      error={validationErrors[item.name]}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-10" />
          {/*features list*/}
          <div>
            <h2 className="font-medium text-xl mb-6">Features List</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {features.features.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox
                    onCheckedChange={(value) =>
                      handleFeatureChange(item.name, value)
                    }
                    checked={featuresData?.[item.name]}
                  />
                  <h2>{item.label}</h2>
                </div>
              ))}
            </div>
          </div>
          {/* car images*/}
          <Separator className="my-10" />
          <UploadImages 
            ref={uploadImagesRef}
            onImagesUploaded={handleImagesUploaded}
            initialImages={mode === 'edit' ? uploadedImages : []}
            error={validationErrors.images}
          />
          <div className="mt-10 flex justify-end">
            <Button 
              type="submit" 
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddListing;
