import React from 'react'
import '@toast-ui/editor/dist/toastui-editor.css';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface props{
  aiOutput:string;
}

function OutputSection({aiOutput}:props) {
  // Render aiOutput directly; previously used toast-ui Editor instance which was removed

  return (
    <div className='bg-white shadow-lg border rounded-lg'>
      <div className='flex justify-between items-center p-5'>
        <h2 className='font-medium text-lg'>Your Result</h2>
        <Button className='flex gap-2'
        onClick={()=>navigator.clipboard.writeText(aiOutput)}
        ><Copy className='w-4 h-4'/> Copy </Button>
      </div>
      <div className='p-5'>
        <pre className='whitespace-pre-wrap break-words text-sm' aria-live="polite">{aiOutput || 'Your result will appear here'}</pre>
      </div>
    </div>
  )
}

export default OutputSection