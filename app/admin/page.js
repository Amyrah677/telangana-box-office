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

  const [movie, setMovie] = useState("");
  const [language, setLanguage] = useState("");

  const [message, setMessage] = useState("");
  const [savingMovie, setSavingMovie] = useState(false);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    async function loadDistricts() {
      const { data } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");

      setDistricts(data || []);
    }

    loadDistricts();
  }, []);

  async function addMovie() {
    setMessage("");

    if (!movie || !language) {
      setMessage("❌ Movie name and language are required.");
      return;
    }

    setSavingMovie(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { error } = await supabase
      .from("movies")
      .insert({
        title: movie,
        language: language,
      });

    if (error) {
      if (error.code === "23505") {
        setMessage("⚠️ This movie already exists.");
      } else {
        setMessage("❌ Movie could not be added.");
      }

      setSavingMovie(false);
      return;
    }

    setMessage("✅ Movie added successfully!");

    setMovie("");
    setLanguage("");
    setSavingMovie(false);
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Telangana Box Office</h1>

      <h2>Admin Panel</h2>

      <hr />

      <h2>🎬 Add Movie</h2>

      <p>Movie Name</p>

      <input
        style={inputStyle}
        type="text"
        value={movie}
        onChange={(e) => setMovie(e.target.value)}
        placeholder="Example: Mandaadi"
      />

      <p>Language</p>

      <select
        style={inputStyle}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="">Select Language</option>
        <option value="Telugu">Telugu</option>
        <option value="Hindi">Hindi</option>
        <option value="Tamil">Tamil</option>
        <option value="Malayalam">Malayalam</option>
        <option value="Kannada">Kannada</option>
        <option value="English">English</option>
      </select>

      <br />

      <button
        style={buttonStyle}
        onClick={addMovie}
        disabled={savingMovie}
      >
        {savingMovie ? "Saving..." : "Add Movie"}
      </button>

      {message && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <hr style={{ marginTop: "40px" }} />

      <h2>🏢 Theatre Details</h2>

      <p>District</p>

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

      <p>Centre / City</p>

      <input
        style={inputStyle}
        value={centre}
        onChange={(e) => setCentre(e.target.value)}
        placeholder="Example: Karimnagar"
      />

      <p>Theatre</p>

      <input
        style={inputStyle}
        value={theatre}
        onChange={(e) => setTheatre(e.target.value)}
        placeholder="Example: Asian Paradise"
      />

      <p>Screen</p>

      <input
        style={inputStyle}
        value={screen}
        onChange={(e) => setScreen(e.target.value)}
        placeholder="Example: Screen 1"
      />

      <p>Total Seats</p>

      <input
        style={inputStyle}
        type="number"
        value={seats}
        onChange={(e) => setSeats(e.target.value)}
        placeholder="Example: 250"
      />
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
