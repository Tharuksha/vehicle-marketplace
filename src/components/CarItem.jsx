import React from "react";
import { Separator } from "./ui/separator";
import { BsFuelPumpDiesel } from "react-icons/bs";
import { IoSpeedometerOutline } from "react-icons/io5";
import { GiGearStickPattern } from "react-icons/gi";
import { RxOpenInNewWindow } from "react-icons/rx";

function CarItem({ car }) {
  // Helper function to get the first image URL or fallback
  const getImageUrl = () => {
    if (car?.images && car.images.length > 0) {
      const firstImage = car.images[0];
      return firstImage.imageUrl || 'https://placehold.co/600x400?text=No+Image';
    }
    return 'https://placehold.co/600x400?text=No+Image';
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden w-[300px] hover:shadow-xl cursor-pointer">
      {car?.condition === 'New' && (
        <h2 className='absolute m-2 bg-green-500 text-white rounded-full px-2 py-1 text-sm'>New</h2>
      )}
      <img 
        src={getImageUrl()} 
        className="rounded-t-xl w-full h-[180px] object-cover"
        onError={(e) => {
          e.target.src = 'https://placehold.co/600x400?text=No+Image';
        }}
      />
      <div className="p-4 ">
        <h2 className="font-bold text-black text-lg mb-2">{car?.make} {car?.model}</h2>
        <Separator/>
        <div className='grid grid-cols-3 mt-5'>
            <div className='flex flex-col items-center'>
              <BsFuelPumpDiesel className="text-lg mb-2"/>
              <h2>{car?.mileage} Miles</h2>
            </div>
            <div className='flex flex-col items-center'>
              <IoSpeedometerOutline className="text-lg mb-2"/>
              <h2>{car?.fuelType}</h2>
            </div>
            <div className='flex flex-col items-center'>
              <GiGearStickPattern className="text-lg mb-2"/>
              <h2>{car?.transmission}</h2>
            </div>
        </div>
        <Separator className="my-2"/>
        <div className='flex items-center justify-between gap-x-4'>
            <h2 className='font-bold text-xl'>Rs.{car?.sellingPrice}</h2>
            <h2 className="text-primary text-sm flex items-center gap-2">View Details <RxOpenInNewWindow className="text-lg"/></h2>
        </div>
      </div>
    </div>
  );
}

export default CarItem;
