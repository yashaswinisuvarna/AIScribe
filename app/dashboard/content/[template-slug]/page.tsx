"use client"
import React, { useContext, useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
// server-side AI calls now proxied via /api/ai/generate
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'

import moment from 'moment'
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { useRouter } from 'next/navigation'
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext'
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext'
import { useUser } from '@clerk/nextjs'

interface PROPS{
    params:{
        'template-slug':string
    }
}


function CreateNewContent(props:PROPS) {
   
    const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug']);
    const [loading,setLoading]=useState(false);
    const [aiOutput,setAiOutput]=useState<string>('');
    const {user}=useUser();
    const router=useRouter();
    const {totalUsage,setTotalUsage}=useContext(TotalUsageContext)
    const {userSubscription,setUserSubscription}=useContext(UserSubscriptionContext);
    const {updateCreditUsage,setUpdateCreditUsage}=useContext(UpdateCreditUsageContext)
    /**
     * Used to generate content from AI
     * @param formData 
     * @returns 
     */
    const GenerateAIContent=async(formData:any)=>{
        if(totalUsage>=10000&&!userSubscription)
            {
                console.log("Please Upgrade");
                router.push('/dashboard/billing')
                return ;
            }
        setLoading(true);
        const SelectedPrompt=selectedTemplate?.aiPrompt;
                const FinalAIPrompt = JSON.stringify(formData) + ", " + SelectedPrompt;
                // Send prompt to server-side generate route to keep API key private
                const maxRetries = 3;
                let attempt = 0;
                let res: Response | null = null;
                let lastErr: any = null;

                while (attempt < maxRetries) {
                    try {
                        res = await fetch('/api/ai/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: FinalAIPrompt }),
                        });

                        if (res.ok) break;

                        // treat 429/503 as transient and retry
                        const status = res.status;
                        if (status === 429 || status === 503) {
                            lastErr = await res.text().catch(() => `status ${status}`);
                            const backoff = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
                            await new Promise(r => setTimeout(r, backoff));
                            attempt++;
                            continue;
                        }

                        // non-retryable error
                        const errText = await res.text().catch(() => 'unknown error');
                        throw new Error(`AI generation failed: ${errText}`);
                    }
                    catch(e:any){
                        lastErr = e;
                        // for network errors, exponential backoff
                        const backoff = Math.pow(2, attempt) * 500;
                        await new Promise(r => setTimeout(r, backoff));
                        attempt++;
                    }
                }

                if (!res || !res.ok) {
                    console.warn('AI generation failed after retries', lastErr);
                    const friendly = 'AI service temporarily unavailable. Please try again in a moment.';
                    setAiOutput(friendly);
                    setLoading(false);
                    return;
                }

                const aiResp = await res.json().catch(async () => {
                    const t = await res.text();
                    return { text: t };
                });

                const aiText = aiResp?.candidates?.[0]?.content?.text || aiResp?.text || (typeof aiResp === 'string' ? aiResp : '')
                setAiOutput(aiText);
                await SaveInDb(JSON.stringify(formData), selectedTemplate?.slug, aiText)
        setLoading(false);
        
        setUpdateCreditUsage(Date.now())

    }

    const SaveInDb=async(formData:any,slug:any,aiResp:string)=>{
        try{
        const result=await db.insert(AIOutput).values({
            formData:formData,
            templateSlug:slug,
            aiResponse:aiResp,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD/MM/yyyy'),
        });

        console.log(result);
        }
        catch(e:any){
            console.warn('SaveInDb DB error', e.message || e);
            return;
        }
    }
    

  return (
    <div className='p-5'>
        <Link href={"/dashboard"}>
            <Button> <ArrowLeft/> Back</Button>
        </Link>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 py-5 '>
            {/* FormSection  */}
                <FormSection 
                selectedTemplate={selectedTemplate}
                userFormInput={(v:any)=>GenerateAIContent(v)}
                loading={loading} />
            {/* OutputSection  */}
            <div className='col-span-2'>
                <OutputSection aiOutput={aiOutput} />
                </div>
        </div>
    </div>
  )
}

export default CreateNewContent