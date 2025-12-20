import { UserButton } from '@clerk/nextjs'
import { Search } from 'lucide-react'
import React from 'react'

function Header() {
  return (
    <div className='p-5 shadow-sm border-b-2 bg-white flex justify-between items-center'>
      {/* Search and membership CTA removed */}
      <div></div>
      <div className='flex gap-5 items-center'>
        <UserButton/>
      </div>
    </div>
  )
}

export default Header