import { UserProfile } from '@clerk/nextjs'
import React from 'react'

function Settings() {
  return (
    <div className='flex items-center justify-center h-full'>
        {/* Use hash routing so UserProfile works without a catch-all route */}
        <UserProfile routing="hash" />
    </div>
  )
}

export default Settings