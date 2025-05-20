import React from 'react'
import { Input } from '@/components/ui/input'

function InputField({item, handleInputChange, carInfo, error}) {
  return (
    <div className="space-y-1">
      <Input 
        type={item?.fieldType} 
        name={item?.name} 
        required={item?.required} 
        defaultValue={carInfo[item?.name]}
        onChange={(e)=>handleInputChange(item.name,e.target.value)}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}

export default InputField
