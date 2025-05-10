import React from "react";
import FakeData from "../Shared/FakeData";
import CarItem from "./CarItem";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function MostSearchVehicle() {
  console.log(FakeData.carList);
  return (
    <div className='mx-24'>
      <h2 className="font-bold text-3xl text-center mt-16 mb-7">
        Most Search Vehicle
      </h2>
      <Carousel>
        <CarouselContent className="gap-x-6">
        {FakeData.carList.map((car, index) => (
            <CarouselItem className="basis-1/4" key={index}>
              <CarItem car={car} />
            </CarouselItem>
        ))}
          
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      
    </div>
  );
}

export default MostSearchVehicle;
