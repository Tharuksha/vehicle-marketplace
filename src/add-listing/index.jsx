import Header from "@/components/Header";
import React, { useState, useRef } from "react";
import carDetails from "@/Shared/carDetails.json";
import InputField from "./components/InputField";
import DropdownField from "./components/DropdownField";
import TextAreaField from "./components/TextAreaField";
import { Separator } from "@/components/ui/separator";
import features from "@/Shared/features.json";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { db } from "../../configs";
import { CarListing, CarImages } from "../../configs/schema";
import IconField from "./components/IconField";
import UploadImages from "./components/UploadImages";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import moment from "moment";
function AddListing() {
  const [formData, setFormData] = useState({});
  const [featuresData, setFeaturesData] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadImagesRef = useRef(null);
  const {user} = useUser();
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFeatureChange = (name, value) => {
    setFeaturesData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImagesUploaded = (images) => {
    console.log("Received images in parent:", images);
    setUploadedImages(images);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user is authenticated and has an email
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        console.error("User email not available. Please ensure you're logged in.");
        alert("Please log in to submit a listing.");
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
            setIsSubmitting(false);
            return;
          }
          
          // Use the returned images from the upload function
          imagesToSave = images;
          console.log("Images ready for saving:", imagesToSave);
        } catch (uploadError) {
          console.error("Error during image upload:", uploadError);
          setIsSubmitting(false);
          return;
        }
      }

      // Then insert the car listing
      const carListingResult = await db.insert(CarListing).values({
        ...formData,
        features: featuresData,
        createdBy: userEmail,
        postedOn: moment().format("YYYY-MM-DD")
      }).returning();

      // Get the inserted car listing ID
      const carListingId = carListingResult?.[0]?.id;
      
      if (!carListingId) {
        console.error("Failed to retrieve car listing ID");
        return;
      }

      console.log("Car listing created with ID:", carListingId);
      console.log("Images to save:", imagesToSave);

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
          // Consider rolling back the car listing
          throw imageError;
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
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="px-10 md:px-20 my-10">
        <h2 className="font-bold text-4xl pb-5">Add Listing </h2>
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
                    />
                  ) : item.fieldType == "dropdown" ? (
                    <DropdownField
                      item={item}
                      handleInputChange={handleInputChange}
                    />
                  ) : item.fieldType == "textarea" ? (
                    <TextAreaField
                      item={item}
                      handleInputChange={handleInputChange}
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
          />
          <div className="mt-10 flex justify-end">
            <Button 
              type="submit" 
              onClick={(e) => onSubmit(e)}
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
