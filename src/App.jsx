import React, { useMemo, useState } from "react";

const initialKids = [
  { id: "yoi", name: "Yoi", points: 0, theme: "linear-gradient(135deg,#ff6fb1,#ff8fc2)", accent: "#ff5fa8" },
  { id: "sunny", name: "Sunny", points: 0, theme: "linear-gradient(135deg,#67e4df,#7ee7d5)", accent: "#58d7cf" }
];

const initialRewards = [
  { id: 1, name: "看卡通 30 分鐘", cost: 10 },
  { id: 2, name: "小點心", cost: 15 },
  { id: 3, name: "小禮物", cost: 30 }
];

export default function App() {
  const [kids, setKids] = useState(initialKids);
  const [activeKidId, setActiveKidId] = useState("yoi");
  const [recorder, setRecorder] = useState("媽媽");
  const [tab, setTab] = useState("add");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [rewards] = useState(initialRewards);

  const activeKid = useMemo(() => kids.find(k => k.id === activeKidId) || kids[0], [kids, activeKidId]);

  const updatePoints = (delta) => {
    const n = Number(amount) || 0;
    if (!n) return;
    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, points: Math.max(0, k.points + delta * n) } : k));
    setReason("");
  };

  const redeemReward = (cost) => {
    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, points: Math.max(0, k.points - cost) } : k));
  };

  const buttonBase = {
    border: "2px solid #e5e7eb",
    borderRadius: 999,
    background: "#fff",
    padding: "12px 24px",
    fontWeight: 800,
    fontSize: 18,
    color: "#9ca3af",
    cursor: "pointer"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3f4", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 36, padding: "24px 20px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 8 }}>📝 好習慣存摺挑戰⭐</div>
          <div style={{ color: "#c0c4cc", fontSize: 18, fontWeight: 700 }}>每天進步一點點，存滿滿的好習慣！</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ color: "#b4b6bd", fontWeight: 800, fontSize: 18 }}>記錄者：</div>
          <button onClick={() => setRecorder("爸爸")} style={{ ...buttonBase, color: recorder === "爸爸" ? "#374151" : "#b8bcc5", boxShadow: recorder === "爸爸" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👨 爸爸</button>
          <button onClick={() => setRecorder("媽媽")} style={{ ...buttonBase, color: recorder === "媽媽" ? "#374151" : "#b8bcc5", boxShadow: recorder === "媽媽" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👩 媽媽</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => setActiveKidId(kid.id)}
              style={{
                border: "none",
                borderRadius: 28,
                padding: "22px 16px",
                background: kid.theme,
                color: "#fff",
                cursor: "pointer",
                boxShadow: kid.id === activeKidId ? "0 10px 24px rgba(0,0,0,0.12)" : "none"
              }}
            >
              <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 14px", border: "4px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👧</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>{kid.name}</div>
              <div style={{ fontSize: 70, lineHeight: 1, fontWeight: 900 }}>{kid.points}</div>
              <div style={{ fontSize: 16, fontWeight: 800, opacity: 0.95, marginTop: 10 }}>累積點數</div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", background: "#f7f7f8", borderRadius: 999, padding: 8, gap: 8, marginBottom: 20, overflowX: "auto" }}>
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => setActiveKidId(kid.id)}
              style={{
                minWidth: 180,
                border: "none",
                borderRadius: 999,
                padding: "14px 18px",
                background: kid.id === activeKidId ? kid.accent : "transparent",
                color: kid.id === activeKidId ? "#fff" : "#c0c4cc",
                fontWeight: 900,
                fontSize: 18,
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              👧 {kid.name}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #f1f1f1" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #ececec" }}>
            {[
              { key: "add", label: "+ 加點" },
              { key: "minus", label: "－ 扣點" },
              { key: "reward", label: "🎁 兌換獎勵" }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                style={{
                  border: "none",
                  background: "#fff",
                  padding: "18px 10px 16px",
                  fontWeight: 900,
                  fontSize: 18,
                  color: tab === item.key ? "#374151" : "#b6bbc4",
                  borderBottom: tab === item.key ? `4px solid ${activeKid.accent}` : "4px solid transparent",
                  cursor: "pointer"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {(tab === "add" || tab === "minus") && (
              <>
                <div style={{ color: "#b6bbc4", fontWeight: 800, marginBottom: 8, fontSize: 16 }}>{tab === "add" ? "加幾點" : "扣幾點"}</div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 18, padding: "18px 16px", fontSize: 26, fontWeight: 900, marginBottom: 18 }}
                />

                <div style={{ color: "#b6bbc4", fontWeight: 800, marginBottom: 8, fontSize: 16 }}>{tab === "add" ? "加點原因" : "扣點原因"}</div>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={tab === "add" ? "例：主動完成作業、幫忙洗碗、考了100分" : "例：拖延、吵架、沒收玩具"}
                  style={{ width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 18, padding: "18px 16px", fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#6b7280" }}
                />

                <button
                  onClick={() => updatePoints(tab === "add" ? 1 : -1)}
                  style={{ width: "100%", border: "none", borderRadius: 18, padding: "16px 18px", background: activeKid.accent, color: "#fff", fontSize: 20, fontWeight: 900, cursor: "pointer" }}
                >
                  {tab === "add" ? `幫 ${activeKid.name} 加點` : `幫 ${activeKid.name} 扣點`}
                </button>
              </>
            )}

            {tab === "reward" && (
              <div style={{ display: "grid", gap: 12 }}>
                {rewards.map(item => (
                  <div key={item.id} style={{ border: "1px solid #ececec", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "#111827" }}>{item.name}</div>
                      <div style={{ color: "#9ca3af", fontWeight: 800, marginTop: 4 }}>需要 {item.cost} 點</div>
                    </div>
                    <button
                      onClick={() => redeemReward(item.cost)}
                      style={{ border: "none", borderRadius: 14, padding: "12px 14px", background: activeKid.points >= item.cost ? activeKid.accent : "#d1d5db", color: "#fff", fontWeight: 900, cursor: activeKid.points >= item.cost ? "pointer" : "not-allowed" }}
                    >
                      兌換
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
