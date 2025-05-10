import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "./ui/separator";
import { CiSearch } from "react-icons/ci";
import Data from "@/Shared/Data";

function Search() {
  return (
    <div className='p-2 md:p-5 bg-white rounded-md md:rounded-full flex-col md:flex md:flex-row gap-10 px-5 items-center w-[60%] '>
      <Select>
        <SelectTrigger className="outline-none md:border-none w-full shadow-none text-lg">
          <SelectValue placeholder="Car" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">New</SelectItem>
          <SelectItem value="dark">Old</SelectItem>

        </SelectContent>
      </Select>
      <Separator orientation="vertical" className="hidden md:block" />
      <Select>
      <SelectTrigger className="outline-none md:border-none w-full shadow-none text-lg">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
            {Data.CarBrands.map((brand,index)=>(
                <SelectItem value={brand.name}>{brand.name}</SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Separator orientation="vertical" className="hidden md:block" />
      <Select>
      <SelectTrigger className="outline-none md:border-none w-full shadow-none text-lg">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
        {Data.Pricing.map((price,index)=>(
                <SelectItem value={price.amount}>{price.amount}</SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div>
      <CiSearch className="text-[50px] bg-primary rounded-full p-3 text-white hover:scale-105 transition-all cursor-pointer " />
      </div>
    </div>
  );
}

export default Search;
