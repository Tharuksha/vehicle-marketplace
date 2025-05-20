import {React,useState,useEffect} from "react";
import FakeData from "../Shared/FakeData";
import CarItem from "./CarItem";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { db } from '../../configs'
import { CarListing, CarImages } from '../../configs/schema'
import { eq, desc} from 'drizzle-orm'
import Service from "../Shared/Service";

function MostSearchVehicle() {
  
const [carList,setCarList]=useState([]);

  useEffect(()=>{
    GetPopularCarList()
  },[])

const GetPopularCarList = async () => {
  const result = await db.select().from(CarListing)
    .leftJoin(CarImages, eq(CarListing.id, CarImages.carListingId))
    .orderBy(desc(CarListing.id))
    .limit(10);
  const resp = Service.FormatResult(result);
  console.log(resp);
  setCarList(resp);
}

  return (
    <div className='mx-24'>
      <h2 className="font-bold text-3xl text-center mt-16 mb-7">
        Most Popular Vehicles
      </h2>
      <Carousel>
        <CarouselContent className="gap-x-6">
        {carList.map((car, index) => (
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
