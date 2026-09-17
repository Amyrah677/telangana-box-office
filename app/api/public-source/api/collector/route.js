import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      movie,
      language,
      district,
      centre,
      theatre,
      screen,
      show_time,
      ticket_price,
      total_seats,
      available_seats,
      source,
      source_status,
    } = body;

    if (!movie || !district || !theatre || !show_time) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const occupied =
      total_seats != null && available_seats != null
        ? Number(total_seats) - Number(available_seats)
        : null;

    const occupancy =
      total_seats && occupied != null
        ? (occupied / Number(total_seats)) * 100
        : null;

    const estimatedGross =
      ticket_price != null && occupied != null
        ? Number(ticket_price) * occupied
        : null;

    const { data: movieRow, error: movieError } = await supabase
      .from("movies")
      .upsert(
        {
          title: movie,
          language: language || "Unknown",
        },
        { onConflict: "title,language" }
      )
      .select()
      .single();

    if (movieError) throw movieError;

    const { data: districtRow, error: districtError } = await supabase
      .from("districts")
      .upsert({ name: district }, { onConflict: "name" })
      .select()
      .single();

    if (districtError) throw districtError;

    const { data: centreRow, error: centreError } = await supabase
      .from("centres")
      .upsert(
        {
          district_id: districtRow.id,
          name: centre || district,
        },
        { onConflict: "district_id,name" }
      )
      .select()
      .single();

    if (centreError) throw centreError;

    const { data: theatreRow, error: theatreError } = await supabase
      .from("theatres")
      .upsert(
        {
          centre_id: centreRow.id,
          name: theatre,
        },
        { onConflict: "centre_id,name" }
      )
      .select()
      .single();

    if (theatreError) throw theatreError;

    const { data: screenRow, error: screenError } = await supabase
      .from("screens")
      .upsert(
        {
          theatre_id: theatreRow.id,
          name: screen || "Screen 1",
          total_seats: total_seats != null ? Number(total_seats) : null,
        },
        { onConflict: "theatre_id,name" }
      )
      .select()
      .single();

    if (screenError) throw screenError;

    const showDate = new Date(show_time).toISOString().slice(0, 10);

    const { data: showRow, error: showError } = await supabase
      .upsert(
        {
          movie_id: movieRow.id,
          screen_id: screenRow.id,
          show_date: showDate,
          show_time,
          ticket_price:
            ticket_price != null ? Number(ticket_price) : null,
          source: source || "public_observed",
        },
        { onConflict: "movie_id,screen_id,show_time" }
      )
      .select()
      .single();

    if (showError) throw showError;

    const { data: snapshot, error: snapshotError } = await supabase
      .from("seat_snapshots")
      .insert({
        show_id: showRow.id,
        total_seats:
          total_seats != null ? Number(total_seats) : null,
        available_seats:
          available_seats != null ? Number(available_seats) : null,
        occupied_seats: occupied,
        occupancy_percent: occupancy,
        estimated_tickets: occupied,
        estimated_gross: estimatedGross,
        source: source || "public_observed",
        source_status: source_status || "observed",
      })
      .select()
      .single();

    if (snapshotError) throw snapshotError;

    return NextResponse.json({
      ok: true,
      snapshot_id: snapshot.id,
      occupied,
      occupancy_percent: occupancy,
      estimated_gross: estimatedGross,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Collector failed",
      },
      { status: 500 }
    );
  }
}
