import React, { useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  

function DropdownField({item,handleInputChange}) {
  useEffect(() => {
    // Set default value for required fields
    if (item.required && item.options && item.options.length > 0) {
      handleInputChange(item.name, item.options[0]);
    }
  }, []);

  return (
    <div>
      <Select 
        onValueChange={(value)=>handleInputChange(item.name,value)}
        defaultValue={item.required ? item.options[0] : undefined}
        required={item.required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={item.label} />
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
