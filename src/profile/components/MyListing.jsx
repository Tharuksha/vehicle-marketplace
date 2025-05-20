import { useEffect, React, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { db } from "../../../configs";
import { CarListing, CarImages } from "../../../configs/schema";
import { eq, desc, and } from "drizzle-orm";
import Service from "../../Shared/Service";
import { useToast } from "@/hooks/use-toast";

function MyListing() {
  const { user } = useUser();
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to extract image URL from car object
  const getCarImageUrl = (car) => {
    console.log("Car images:", car.images);

    if (!car.images || car.images.length === 0) {
      return "https://placehold.co/600x400?text=No+Image";
    }

    // Check the structure of the first image
    const firstImage = car.images[0];
    console.log("First image object:", firstImage);

    if (firstImage && firstImage.imageUrl) {
      return firstImage.imageUrl;
    } else if (firstImage && firstImage.url) {
      return firstImage.url;
    } else if (firstImage && firstImage.fileUrl) {
      return firstImage.fileUrl;
    } else if (typeof firstImage === "string") {
      return firstImage;
    }

    return "https://placehold.co/600x400?text=No+Image";
  };

  useEffect(() => {
    user && GetUserCarListing();
  }, [user]);

  const GetUserCarListing = async () => {
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(CarListing)
        .leftJoin(CarImages, eq(CarListing.id, CarImages.carListingId))
        .where(
          eq(CarListing.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(CarListing.id));
      const resp = Service.FormatResult(result);
      console.log("Formatted car listings:", resp);
      // Log first car's images to debug
      if (resp.length > 0) {
        console.log("First car images:", resp[0].images);
      }
      setCarList(resp);
     
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your listings. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        // First delete associated images
        await db.delete(CarImages).where(eq(CarImages.carListingId, carId));

        // Then delete the car listing
        await db
          .delete(CarListing)
          .where(
            and(
              eq(CarListing.id, carId),
              eq(CarListing.createdBy, user?.primaryEmailAddress?.emailAddress)
            )
          );

        // Update the UI
        setCarList(carList.filter((car) => car.id !== carId));
        toast({
          title: "Listing deleted",
          description: "Your car listing has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting car:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the listing. Please try again later.",
        });
      }
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-4xl">My Listing</h2>
        <Link to="/add-listing">
          <Button>Add Listing</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : carList.length > 0 ? (
          carList.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-md bg-white relative flex flex-col h-full"
            >
              {item.condition === "New" && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-full z-10">
                  New
                </div>
              )}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={getCarImageUrl(item)}
                  alt={item.make + " " + item.model}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    console.log("Image failed to load:", e.target.src);
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-xl border-b pb-2 mb-3">
                  {item.make} {item.model}
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <p className="font-medium">{item.mileage} Miles</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    <p className="font-medium">{item.fuelType}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    <p className="font-medium">{item.transmission}</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-2xl font-bold">
                      ${item.sellingPrice}
                    </span>
                    <Link
                      to={`/car-details/${item.id}`}
                      className="text-blue-600 flex items-center hover:underline"
                    >
                      View Details
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>

                  <div className="flex justify-between mt-3 pt-3 border-t">
                    <Link
                      to={"/add-listing?mode=edit&id=" + item?.id}
                      className="text-blue-600 flex items-center hover:underline"
                    >
                      Edit
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 flex items-center hover:underline"
                    >
                      Delete
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border rounded-lg bg-gray-50">
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No listings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first car listing
            </p>
            <div className="mt-6">
              <Link to="/add-listing">
                <Button>Add Your First Listing</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListing;
