import React from 'react'
import Search from './Search'

function Hero() {
  return (
    <div className='flex flex-col items-center p-10 py-20 gap-6 h-[650px] w-full bg-[#eef0fc]'>
      <h2 className='text-lg font-medium'>The best place to buy and sell cars</h2>
      <h2 className='text-[60px] font-bold'>Find your dream car</h2>
      <Search/>
      <img src='/bmw.png' alt='bmw' className='max-w-5xl w-full object-contain mx-auto -mt-40' />
    </div>
  )
}

export default Hero
