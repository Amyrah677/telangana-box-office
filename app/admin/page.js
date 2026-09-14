"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminPage() {
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [centre, setCentre] = useState("");
  const [theatre, setTheatre] = useState("");
  const [screen, setScreen] = useState("");
  const [seats, setSeats] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      setMessage("Supabase configuration missing.");
      return;
    }

    const supabase = createClient(url, key);

    async function loadDistricts() {
      const { data, error } = await supabase
        .from("districts")
        .select("id,name")
        .order("name");

      if (error) {
        setMessage("Could not load districts.");
        return;
      }

      setDistricts(data || []);
    }

    loadDistricts();
  }, []);

  async function addTheatre() {
    setMessage("");

    if (!district || !centre || !theatre || !screen || !seats) {
      setMessage("Please fill all fields.");
      return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      setMessage("Supabase configuration missing.");
      return;
    }

    const supabase = createClient(url, key);

    // Find existing centre or create it
    let { data: centreData } = await supabase
      .from("centres")
      .select("id")
      .eq("district_id", district)
      .eq("name", centre)
      .maybeSingle();

    if (!centreData) {
      const { data, error } = await supabase
        .from("centres")
        .insert({
          district_id: district,
          name: centre,
        })
        .select("id")
        .single();

      if (error) {
        setMessage("Could not add centre.");
        return;
      }

      centreData = data;
    }

    // Find existing theatre or create it
    let { data: theatreData } = await supabase
      .from("theatres")
      .select("id")
      .eq("centre_id", centreData.id)
      .eq("name", theatre)
      .maybeSingle();

    if (!theatreData) {
      const { data, error } = await supabase
        .from("theatres")
        .insert({
          centre_id: centreData.id,
          name: theatre,
        })
        .select("id")
        .single();

      if (error) {
        setMessage("Could not add theatre.");
        return;
      }

      theatreData = data;
    }

    // Add screen
    const { error: screenError } = await supabase
      .from("screens")
      .insert({
        theatre_id: theatreData.id,
        name: screen,
        total_seats: Number(seats),
      });

    if (screenError) {
      setMessage(
        screenError.code === "23505"
          ? "This screen already exists."
          : "Could not add screen."
      );
      return;
    }

    setMessage("✅ Theatre & Screen added successfully!");

    setCentre("");
    setTheatre("");
    setScreen("");
    setSeats("");
  }

  return (
    <main className="admin-wrap">
      <div className="admin-header">
        <div>
          <h1>Telangana Box Office</h1>
          <p>Admin Panel</p>
        </div>

        <a href="/">← Dashboard</a>
      </div>

      <div className="admin-card">
        <h2>Add Theatre</h2>
        <p className="help">
          Add a centre, theatre and screen to the Telangana database.
        </p>

        <label>District</label>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">Select District</option>

          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <label>Centre / City</label>

        <input
          type="text"
          value={centre}
          onChange={(e) => setCentre(e.target.value)}
          placeholder="Example: Karimnagar"
        />

        <label>Theatre</label>

        <input
          type="text"
          value={theatre}
          onChange={(e) => setTheatre(e.target.value)}
          placeholder="Example: Asian Paradise"
        />

        <label>Screen</label>

        <input
          type="text"
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
          placeholder="Example: Screen 1"
        />

        <label>Total Seats</label>

        <input
          type="number"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          placeholder="Example: 250"
        />

        <button onClick={addTheatre}>
          Add Theatre & Screen
        </button>

        {message && <div className="message">{message}</div>}
      </div>
    </main>
  );
}
