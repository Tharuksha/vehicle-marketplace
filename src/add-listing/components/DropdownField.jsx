import React, { useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  

function DropdownField({item,handleInputChange,carInfo}) {
  useEffect(() => {
    // Set default value for required fields
    if (item.required && item.options && item.options.length > 0 && !carInfo[item.name]) {
      handleInputChange(item.name, item.options[0]);
    }
  }, []);

  // Ensure value is always defined to avoid controlled/uncontrolled warning
  const currentValue = carInfo[item.name] || "";

  return (
    <div>
      <Select 
        onValueChange={(value)=>handleInputChange(item.name,value)}
        value={currentValue}
        required={item.required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={item.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {item?.options?.map((option,index)=>(
              <SelectItem key={index} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default DropdownField
