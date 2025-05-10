import React from 'react'
import { Input } from '@/components/ui/input'

function InputField({item}) {
  return (
    <div>
      <Input type={item?.fieldType} name={item?.name} required={item?.required} />
    </div>
  )
}

export default InputField
