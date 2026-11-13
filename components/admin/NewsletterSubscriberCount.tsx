'use client';
import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Mail } from '@/components/ui/platform-icons';
export default function NewsletterSubscriberCount(){
 const [total,setTotal]=useState<number|'unavailable'|null>(null);
 useEffect(()=>{let live=true;axiosInstance.get<{data:{total:number}}>('/newsletter/stats').then(({data})=>{if(live)setTotal(data.data.total)}).catch(()=>{if(live)setTotal('unavailable')});return()=>{live=false}},[]);
 return <section className="newsletter-summary" aria-label="Newsletter subscribers"><div><Mail size={17}/><h2>Newsletter subscribers</h2><span>All-time storefront signups</span></div><strong role="status">{typeof total==='number'?total.toLocaleString():total===null?'Loading…':'Unavailable'}</strong></section>
}
