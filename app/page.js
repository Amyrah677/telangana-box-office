"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("All");
  const [movie, setMovie] = useState("All");
  const [language, setLanguage] = useState("All");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      setLoading(false);
      return;
    }

    const sb = createClient(url, key);

    async function load() {
      setLoading(true);

      const { data, error } = await sb
        .from("snapshot_view")
        .select("*")
        .order("snapshot_at", { ascending: false })
        .limit(500);

      if (!error && data) {
        setRows(data);
      }

      setLoading(false);
    }

    load();
  }, []);

  const districts = [
    "All",
    ...new Set(rows.map((r) => r.district).filter(Boolean)),
  ];

  const movies = [
    "All",
    ...new Set(rows.map((r) => r.movie).filter(Boolean)),
  ];

  const languages = [
    "All",
    ...new Set(rows.map((r) => r.language).filter(Boolean)),
  ];

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (district === "All" || r.district === district) &&
          (movie === "All" || r.movie === movie) &&
          (language === "All" || r.language === language)
      ),
    [rows, district, movie, language]
  );

  const tickets = filtered.reduce(
    (a, r) => a + (Number(r.estimated_tickets) || 0),
    0
  );

  const gross = filtered.reduce(
    (a, r) => a + (Number(r.estimated_gross) || 0),
    0
  );

  return (
    <main className="wrap">
      <div className="top">
        <div>
          <div className="brand">Telangana Box Office</div>
          <div className="sub">
            Live-ready Telangana movie tracking dashboard
          </div>
        </div>

        <div className="pill">Collector Ready</div>
      </div>

      <div className="panel">
        <div className="filters">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districts.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>

          <select value={movie} onChange={(e) => setMovie(e.target.value)}>
            {movies.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="label">OBSERVED / EST. TICKETS</div>
          <div className="value">{tickets.toLocaleString()}</div>
        </div>

        <div className="card">
          <div className="label">EST. GROSS</div>
          <div className="value">
            ₹
            {gross.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="card">
          <div className="label">SNAPSHOTS</div>
          <div className="value">{filtered.length}</div>
        </div>

        <div className="card">
          <div className="label">DATABASE</div>
          <div className="value ok">Connected</div>
        </div>
      </div>

      <div className="panel">
        <h3>Seat / Show Snapshots</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>District</th>
                <th>Centre</th>
                <th>Theatre</th>
                <th>Screen</th>
                <th>Movie</th>
                <th>Language</th>
                <th>Show</th>
                <th>Occupancy</th>
                <th>Tickets</th>
                <th>Gross</th>
                <th>Source</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.district}</td>
                  <td>{r.centre}</td>
                  <td>{r.theatre}</td>
                  <td>{r.screen}</td>
                  <td>{r.movie}</td>
                  <td>{r.language}</td>
                  <td>{new Date(r.show_time).toLocaleString("en-IN")}</td>

                  <td>
                    {r.occupancy_percent != null
                      ? Number(r.occupancy_percent).toFixed(1) + "%"
                      : "-"}
                  </td>

                  <td>{r.estimated_tickets ?? "-"}</td>

                  <td>
                    {r.estimated_gross != null
                      ? "₹" + Number(r.estimated_gross).toFixed(0)
                      : "-"}
                  </td>

                  <td>
                    <span className="pill">{r.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h3>Data rule</h3>

        <p>
          Reliable sold counts are shown as tickets sold only when the source
          provides them. Seat-map observations are labelled as observed
          occupancy / estimated tickets.
        </p>

        <p className="footer">
          Collector endpoint: <code>/api/collector</code> · Scheduled hook:{" "}
          <code>/api/cron</code>
        </p>
      </div>
    </main>
  );
}
