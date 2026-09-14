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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    async function loadDistricts() {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");

      if (error) {
        setMessage("❌ Districts load avvaledu.");
      } else {
        setDistricts(data || []);
      }

      setLoading(false);
    }

    loadDistricts();
  }, []);

  async function addTheatre() {
    setMessage("");

    if (!district || !centre || !theatre || !screen || !seats) {
      setMessage("❌ Please fill all fields.");
      return;
    }

    setSaving(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    // 1. Find or create Centre
    let { data: centreData, error: centreFindError } = await supabase
      .from("centres")
      .select("id")
      .eq("district_id", district)
      .eq("name", centre)
      .maybeSingle();

    if (centreFindError) {
      setMessage("❌ Centre check failed.");
      setSaving(false);
      return;
    }

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
        setMessage("❌ Centre add cheyyalekapoyam.");
        setSaving(false);
        return;
      }

      centreData = data;
    }

    // 2. Find or create Theatre
    let { data: theatreData, error: theatreFindError } = await supabase
      .from("theatres")
      .select("id")
      .eq("centre_id", centreData.id)
      .eq("name", theatre)
      .maybeSingle();

    if (theatreFindError) {
      setMessage("❌ Theatre check failed.");
      setSaving(false);
      return;
    }

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
        setMessage("❌ Theatre add cheyyalekapoyam.");
        setSaving(false);
        return;
      }

      theatreData = data;
    }

    // 3. Add Screen
    const { error: screenError } = await supabase
      .from("screens")
      .insert({
        theatre_id: theatreData.id,
        name: screen,
        total_seats: Number(seats),
      });

    if (screenError) {
      if (screenError.code === "23505") {
        setMessage("⚠️ Ee screen already exists.");
      } else {
        setMessage("❌ Screen add cheyyalekapoyam.");
      }

      setSaving(false);
      return;
    }

    // 4. Success
    setMessage("✅ Theatre & Screen successfully added!");

    setCentre("");
    setTheatre("");
    setScreen("");
    setSeats("");

    setSaving(false);
  }

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Telangana Box Office</h1>

      <h2>Admin Panel</h2>

      <p>Add Theatre, Screen and Seat Details</p>

      <hr />

      <h3>District</h3>

      {loading ? (
        <p>Loading districts...</p>
      ) : (
        <select
          style={inputStyle}
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
      )}

      <h3>Centre / City</h3>

      <input
        style={inputStyle}
        type="text"
        value={centre}
        onChange={(e) => setCentre(e.target.value)}
        placeholder="Example: Karimnagar"
      />

      <h3>Theatre</h3>

      <input
        style={inputStyle}
        type="text"
        value={theatre}
        onChange={(e) => setTheatre(e.target.value)}
        placeholder="Example: Asian Paradise"
      />

      <h3>Screen</h3>

      <input
        style={inputStyle}
        type="text"
        value={screen}
        onChange={(e) => setScreen(e.target.value)}
        placeholder="Example: Screen 1"
      />

      <h3>Total Seats</h3>

      <input
        style={inputStyle}
        type="number"
        value={seats}
        onChange={(e) => setSeats(e.target.value)}
        placeholder="Example: 250"
      />

      <br />
      <br />

      <button
        style={buttonStyle}
        onClick={addTheatre}
        disabled={saving}
      >
        {saving ? "Saving..." : "Add Theatre & Screen"}
      </button>

      {message && (
        <p
          style={{
            marginTop: "20px",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  maxWidth: "500px",
  padding: "12px",
  fontSize: "16px",
  marginBottom: "10px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "13px 22px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};
