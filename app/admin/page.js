"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminPage() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

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

      if (!error) {
        setDistricts(data || []);
      }

      setLoading(false);
    }

    loadDistricts();
  }, []);

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Telangana Box Office</h1>

      <h2>Admin Panel</h2>

      <p>Add Theatre Details</p>

      <hr />

      <h3>District</h3>

      {loading ? (
        <p>Loading districts...</p>
      ) : (
        <select style={inputStyle}>
          <option value="">Select District</option>

          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      )}

      <h3>Centre / City</h3>

      <input
        style={inputStyle}
        placeholder="Example: Karimnagar"
      />

      <h3>Theatre</h3>

      <input
        style={inputStyle}
        placeholder="Example: Asian Paradise"
      />

      <h3>Screen</h3>

      <input
        style={inputStyle}
        placeholder="Example: Screen 1"
      />

      <h3>Total Seats</h3>

      <input
        style={inputStyle}
        type="number"
        placeholder="Example: 250"
      />

      <br />
      <br />

      <button style={buttonStyle}>
        Add Theatre & Screen
      </button>
    </main>
  );
}

const inputStyle = {
  width: "350px",
  padding: "10px",
  fontSize: "16px",
  marginBottom: "10px",
};

const buttonStyle = {
  padding: "12px 20px",
  fontSize: "16px",
  cursor: "pointer",
};
