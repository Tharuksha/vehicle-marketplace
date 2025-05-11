import Header from '@/components/Header'
import React, { useState } from 'react'
import carDetails from '@/Shared/carDetails.json'
import InputField from './components/InputField'
import DropdownField from './components/DropdownField'
import TextAreaField from './components/TextAreaField'
import { Separator } from '@/components/ui/separator'
import features from '@/Shared/features.json'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
function AddListing() {
    const [formData,setFormData]=useState({});
    const handleInputChange=(name,value)=>{
        setFormData((prevData)=>({
            ...prevData,
            [name]:value}))
            console.log(formData);
    }
    const onSubmit=(e)=>{
        e.preventDefault();
        
    }
  return (
    <div>
      <Header/>
      <div className='px-10 md:px-20 my-10'>
        <h2 className='font-bold text-4xl pb-5'>Add Listing </h2>
        <form className='p-10 border rounded-lg'>
            {/*car details*/}
            <div>
                <h2 className='font-medium text-xl mb-6'>Car Details</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {carDetails.carDetails.map((item,index)=>(
                        <div key={index}>
                            <label className='text-sm'>{item?.label}{item.required&&<span className='text-red-500'>*</span>}</label>
                        {item.fieldType=='text' ||item.fieldType=='number'?<InputField item={item} handleInputChange={handleInputChange}/>
                        :item.fieldType=='dropdown'?<DropdownField item={item} handleInputChange={handleInputChange}/>
                        :item.fieldType=='textarea'?<TextAreaField item={item} handleInputChange={handleInputChange}/>
                        :null}
                        </div>
                    ))}
                </div>
                </div>
                <Separator className='my-10'/>
                {/*features list*/}
                <div>
                    <h2 className='font-medium text-xl mb-6'>Features List</h2>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
                        {features.features.map((item,index)=>(
                            <div key={index} className='flex items-center gap-2'>
                                <Checkbox onCheckedChange={(value)=>handleInputChange(item.name,value)}/><h2>{item.label}</h2>
                            </div>
                        ))}
                    </div>
                   
                </div>
                {/* car images*/}
                <div className='mt-10 flex justify-end'>
                   <Button type='submit' onClick={(e)=>onSubmit(e)}>Submit</Button> 
                </div>
        </form>

      </div>
    </div>
  )
}

export default AddListing
