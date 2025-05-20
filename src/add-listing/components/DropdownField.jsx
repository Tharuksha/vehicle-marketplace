import React, { useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  

function DropdownField({item, handleInputChange, carInfo, error}) {
  useEffect(() => {

    if (item.required && item.options && item.options.length > 0 && !carInfo?.[item.name]) {
      handleInputChange(item.name, item.options[0]);
    }
  }, []);

  return (
    <div className="space-y-1">
      <Select 
        onValueChange={(value)=>handleInputChange(item.name,value)}
        value={carInfo?.[item.name] || ""}
        required={item.required}>
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder={item.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {item?.options?.map((option,index)=>(
              <SelectItem key={index} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}

export default DropdownField
