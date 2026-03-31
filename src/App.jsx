import React, { useState } from "react";

const initialKids = [
  { id: "yoi", name: "Yoi", points: 0 },
  { id: "sunny", name: "Sunny", points: 0 }
];

export default function App() {
  const [kids, setKids] = useState(initialKids);
  const [activeKidId, setActiveKidId] = useState("yoi");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");

  const updatePoints = (delta) => {
    setKids(prev => prev.map(k =>
      k.id === activeKidId
        ? { ...k, points: k.points + delta }
        : k
    ));
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>

      {/* 上面選人 */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 16 }}>
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => setActiveKidId(kid.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 20,
              border: "1px solid #ddd",
              background: kid.id === activeKidId ? "#000" : "#f2f2f2",
              color: kid.id === activeKidId ? "#fff" : "#666",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ccc" }}></div>
            {kid.name}
          </button>
        ))}
      </div>

      {/* 左右卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {kids.map((kid) => (
          <div
            key={kid.id}
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
            }}
          >
            <div style={{ fontSize: 16, fontWeight: "bold" }}>{kid.name}</div>
            <div style={{ fontSize: 32, fontWeight: "900" }}>{kid.points}</div>
          </div>
        ))}
      </div>

      {/* 加點區 */}
      <div style={{ background: "#fff", padding: 16, borderRadius: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 10, fontWeight: "bold" }}>加點</div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <input
          type="text"
          placeholder="原因（例如：完成作業）"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => updatePoints(amount)}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: "#22c55e", color: "#fff", border: "none", fontWeight: "bold" }}
          >+ 加點</button>

          <button
            onClick={() => updatePoints(-amount)}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: "#ef4444", color: "#fff", border: "none", fontWeight: "bold" }}
          >- 扣點</button>
        </div>
      </div>

    </div>
  );
}
