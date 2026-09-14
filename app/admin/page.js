"use client";

export default function AdminPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Telangana Box Office</h1>
      <h2>Admin Panel</h2>

      <p>Admin panel is working.</p>

      <hr />

      <h3>Add Theatre</h3>

      <p>District</p>
      <select>
        <option>Select District</option>
        <option>Karimnagar</option>
        <option>Hyderabad</option>
        <option>Warangal</option>
      </select>

      <p>Centre / City</p>
      <input placeholder="Example: Karimnagar" />

      <p>Theatre</p>
      <input placeholder="Example: Asian Paradise" />

      <p>Screen</p>
      <input placeholder="Example: Screen 1" />

      <p>Total Seats</p>
      <input type="number" placeholder="Example: 250" />

      <br />
      <br />

      <button>Add Theatre & Screen</button>
    </main>
  );
}
