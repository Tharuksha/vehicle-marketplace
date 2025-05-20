import React from 'react'
import { Textarea } from '@/components/ui/textarea'

function TextAreaField({item, handleInputChange, carInfo, error}) {
  return (
    <div className="space-y-1">
      <Textarea 
        onChange={(e)=>handleInputChange(item.name,e.target.value)}
        required={item.required}
        defaultValue={carInfo[item.name]}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}

export default TextAreaField
