import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

function num(v){ return v === null || v === undefined || v === "" ? null : Number(v); }

export async function POST(req){
  try{
    const body = await req.json();
    const items = Array.isArray(body) ? body : (body.items || [body]);
    if(!items.length) return NextResponse.json({ok:false,error:"No items supplied"},{status:400});
    const sb=getSupabase();
    let saved=0;
    for(const x of items){
      if(!x.movie || !x.language || !x.district || !x.centre || !x.theatre || !x.screen || !x.show_time || !x.source)
        continue;
      const {data:movie,error:e1}=await sb.from("movies").upsert({title:x.movie,language:x.language},{onConflict:"title,language"}).select("id").single();
      if(e1) throw e1;
      const {data:district,error:e2}=await sb.from("districts").upsert({name:x.district},{onConflict:"name"}).select("id").single();
      if(e2) throw e2;
      const {data:centre,error:e3}=await sb.from("centres").upsert({district_id:district.id,name:x.centre},{onConflict:"district_id,name"}).select("id").single();
      if(e3) throw e3;
      const {data:theatre,error:e4}=await sb.from("theatres").upsert({centre_id:centre.id,name:x.theatre},{onConflict:"centre_id,name"}).select("id").single();
      if(e4) throw e4;
      const {data:screen,error:e5}=await sb.from("screens").upsert({theatre_id:theatre.id,name:x.screen,total_seats:num(x.total_seats)},{onConflict:"theatre_id,name"}).select("id").single();
      if(e5) throw e5;
      const {data:show,error:e6}=await sb.from("shows").upsert({
        movie_id:movie.id,screen_id:screen.id,show_date:x.show_date || String(x.show_time).slice(0,10),
        show_time:x.show_time,ticket_price:num(x.ticket_price),source:x.source,source_show_id:x.source_show_id||null
      },{onConflict:"screen_id,show_time,movie_id"}).select("id").single();
      if(e6) throw e6;
      const total=num(x.total_seats), avail=num(x.available_seats), occupied=num(x.occupied_seats);
      const occ = x.occupancy_percent!=null ? num(x.occupancy_percent) : (total && avail!=null ? ((total-avail)/total)*100 : (total && occupied!=null ? (occupied/total)*100 : null));
      const estTickets=x.estimated_tickets!=null?num(x.estimated_tickets):(occupied!=null?occupied:(total&&avail!=null?total-avail:null));
      const gross=x.estimated_gross!=null?num(x.estimated_gross):(estTickets!=null&&x.ticket_price!=null?estTickets*num(x.ticket_price):null);
      const {error:e7}=await sb.from("seat_snapshots").insert({
        show_id:show.id,snapshot_at:x.snapshot_at||new Date().toISOString(),total_seats:total,available_seats:avail,occupied_seats:occupied,
        occupancy_percent:occ,estimated_tickets:estTickets,estimated_gross:gross,source:x.source,source_status:x.source_status||"observed"
      });
      if(e7) throw e7;
      saved++;
    }
    return NextResponse.json({ok:true,saved,received:items.length});
  }catch(e){ return NextResponse.json({ok:false,error:e.message||String(e)},{status:500}); }
}