import React, { useState } from "react";

const initialKids = [
  { id: "yoi", name: "Yoi", points: 0 },
  { id: "sunny", name: "Sunny", points: 0 }
];
export default function App() {
  const [kids, setKids] = useState(initialKids);
  const [activeKidId, setActiveKidId] = useState("yoi");
    return (
    <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 16 }}>
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => setActiveKidId(kid.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              background: kid.id === activeKidId ? "#000" : "#eee",
              color: kid.id === activeKidId ? "#fff" : "#666"
            }}
          >
            {kid.name}
          </button>
        ))}
      </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {kids.map((kid) => (
          <div key={kid.id} style={{ padding: 16, background: "#fff" }}>
            <div>{kid.name}</div>
            <div>{kid.points}</div>
          </div>
        ))}
      </div>
          </div>
  );
}
