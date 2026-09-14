import { NextResponse } from "next/server";

export async function GET(req){
  const expected=process.env.COLLECTOR_CRON_SECRET;
  const auth=req.headers.get("authorization");
  if(expected && auth !== `Bearer ${expected}`) return NextResponse.json({ok:false,error:"Unauthorized"},{status:401});
  const url=process.env.COLLECTOR_SOURCE_URL;
  if(!url) return NextResponse.json({ok:true,status:"ready",message:"No authorized source endpoint configured yet. Collector API is ready."});
  try{
    const headers={};
    if(process.env.COLLECTOR_SOURCE_TOKEN) headers.authorization=`Bearer ${process.env.COLLECTOR_SOURCE_TOKEN}`;
    const r=await fetch(url,{headers,cache:"no-store"});
    if(!r.ok) return NextResponse.json({ok:false,error:`Source returned ${r.status}`},{status:502});
    const data=await r.json();
    const base=new URL(req.url);
    const ingest=new URL("/api/collector",base);
    const ir=await fetch(ingest,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
    const result=await ir.json();
    return NextResponse.json({ok:ir.ok,source:url,result});
  }catch(e){return NextResponse.json({ok:false,error:e.message||String(e)},{status:500});}
}