import React from 'react'
import {useUser, UserButton, SignInButton} from '@clerk/clerk-react';
import {Button} from '@/components/ui/button';
import { Link } from 'react-router-dom';
function Header() {
    const {user,isSignedIn}=useUser();
  return (
    <div className='flex justify-between items-center shadow-sm p-5'>
      <img src='/logo.svg' width={150} heigh={100}/>
      <ul className='hidden md:flex gap-16 '>
        <li className='font-medium hover:scale-105 transition-all cursor-pointer hover:text-primary'>Home</li>
        <li className='font-medium hover:scale-105 transition-all cursor-pointer hover:text-primary'>New</li>
        <li className='font-medium hover:scale-105 transition-all cursor-pointer hover:text-primary'>Preowned</li>
        <li className='font-medium hover:scale-105 transition-all cursor-pointer hover:text-primary'>Search</li>

      </ul>
      {isSignedIn?
      <div className='flex items-center gap-5'>
        <UserButton/>
        <Link to="/profile">
        <Button>Submit Listing</Button>
        </Link>
    </div>
    :
    <SignInButton mode="modal">
      <Button>Submit Listing</Button>
    </SignInButton>
      }
    </div>
  )
}

export default Header
