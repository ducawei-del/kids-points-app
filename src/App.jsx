import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kids-points-app-v4";

const defaultState = {
  kids: [
    { id: "yoi", name: "Yoi", points: 0, avatar: null, theme: "linear-gradient(135deg,#ff6fb1,#ff8fc2)", accent: "#ff5fa8" },
    { id: "sunny", name: "Sunny", points: 0, avatar: null, theme: "linear-gradient(135deg,#67e4df,#7ee7d5)", accent: "#58d7cf" }
  ],
  recorder: "媽媽",
  rewards: [
    { id: 1, name: "看卡通 30 分鐘", cost: 10 },
    { id: 2, name: "小點心", cost: 15 },
    { id: 3, name: "小禮物", cost: 30 }
  ],
  weeklyTasks: [
    { id: 1, title: "閱讀一本書", description: "並與爸媽分享心得", points: 5 },
    { id: 2, title: "自己整理書包", description: "連續完成 3 天", points: 3 }
  ],
  history: [],
  activeKidId: "yoi",
  tab: "add"
};

function loadState() {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      kids: parsed.kids || defaultState.kids,
      rewards: parsed.rewards || defaultState.rewards,
      weeklyTasks: parsed.weeklyTasks || defaultState.weeklyTasks,
      history: parsed.history || defaultState.history,
    };
  } catch {
    return defaultState;
  }
}

function rankKids(kids) {
  return [...kids].sort((a, b) => b.points - a.points);
}

function nowText() {
  return new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPoints, setTaskPoints] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  const { kids, recorder, rewards, weeklyTasks, history, activeKidId, tab } = state;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveStatus("已自動儲存");
    } catch {
      setSaveStatus("儲存失敗");
    }
  }, [state]);

  const activeKid = useMemo(() => kids.find(k => k.id === activeKidId) || kids[0], [kids, activeKidId]);
  const ranked = useMemo(() => rankKids(kids), [kids]);

  const patchState = (patch) => {
    setState(prev => ({ ...prev, ...patch }));
  };

  const updateKids = (updater) => {
    setState(prev => ({ ...prev, kids: updater(prev.kids) }));
  };

  const addHistory = (kidName, type, text, points) => {
    setState(prev => ({
      ...prev,
      history: [
        {
          id: Date.now() + Math.random(),
          kidName,
          type,
          text,
          points,
          recorder: prev.recorder,
          createdAt: nowText(),
        },
        ...prev.history,
      ],
    }));
  };

  const updatePoints = (delta) => {
    const n = Number(amount) || 0;
    if (!n) return;
    const pointDelta = delta * n;

    updateKids(prevKids =>
      prevKids.map(k =>
        k.id === activeKidId ? { ...k, points: Math.max(0, k.points + pointDelta) } : k
      )
    );

    addHistory(activeKid.name, delta > 0 ? "加點" : "扣點", reason || (delta > 0 ? "手動加點" : "手動扣點"), pointDelta);
    setReason("");
  };

  const redeemReward = (cost, rewardName) => {
    if (activeKid.points < cost) return;

    updateKids(prevKids =>
      prevKids.map(k =>
        k.id === activeKidId ? { ...k, points: Math.max(0, k.points - cost) } : k
      )
    );

    addHistory(activeKid.name, "兌換獎勵", `兌換：${rewardName}`, -cost);
  };

  const handleAvatarUpload = (event, kidId) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateKids(prevKids =>
        prevKids.map(k => (k.id === kidId ? { ...k, avatar: reader.result } : k))
      );
    };
    reader.readAsDataURL(file);
  };

  const saveTask = () => {
    const pts = Number(taskPoints) || 0;
    if (!taskTitle.trim() || !pts) return;

    if (editingTaskId) {
      patchState({
        weeklyTasks: weeklyTasks.map(task =>
          task.id === editingTaskId
            ? { ...task, title: taskTitle.trim(), description: taskDescription.trim(), points: pts }
            : task
        )
      });
      setEditingTaskId(null);
    } else {
      patchState({
        weeklyTasks: [
          ...weeklyTasks,
          { id: Date.now(), title: taskTitle.trim(), description: taskDescription.trim(), points: pts }
        ]
      });
    }

    setTaskTitle("");
    setTaskDescription("");
    setTaskPoints(1);
  };

  const editTask = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPoints(task.points);
  };

  const deleteTask = (id) => {
    patchState({ weeklyTasks: weeklyTasks.filter(task => task.id !== id) });
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPoints(1);
    }
  };

  const completeTask = (task) => {
    updateKids(prevKids =>
      prevKids.map(k => (k.id === activeKidId ? { ...k, points: k.points + task.points } : k))
    );
    addHistory(activeKid.name, "完成任務", `${task.title}${task.description ? `｜${task.description}` : ""}`, task.points);
  };

  const resetAll = () => {
    setState(defaultState);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPoints(1);
    setEditingTaskId(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
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
          <div style={{ color: saveStatus === "儲存失敗" ? "#ef4444" : "#9ca3af", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{saveStatus}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ color: "#b4b6bd", fontWeight: 800, fontSize: 18 }}>記錄者：</div>
          <button onClick={() => patchState({ recorder: "爸爸" })} style={{ ...buttonBase, color: recorder === "爸爸" ? "#374151" : "#b8bcc5", boxShadow: recorder === "爸爸" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👨 爸爸</button>
          <button onClick={() => patchState({ recorder: "媽媽" })} style={{ ...buttonBase, color: recorder === "媽媽" ? "#374151" : "#b8bcc5", boxShadow: recorder === "媽媽" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👩 媽媽</button>
          <button onClick={resetAll} style={{ ...buttonBase, color: "#ef4444" }}>清空資料</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {kids.map(kid => (
            <div
              key={kid.id}
              onClick={() => patchState({ activeKidId: kid.id })}
              style={{
                borderRadius: 28,
                padding: "22px 16px",
                background: kid.theme,
                color: "#fff",
                cursor: "pointer",
                boxShadow: kid.id === activeKidId ? "0 10px 24px rgba(0,0,0,0.12)" : "none"
              }}
            >
              <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 14px", border: "4px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kid.avatar ? (
                  <img src={kid.avatar} alt={kid.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ fontSize: 40 }}>👧</div>
                )}
              </div>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <label style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                  修改大頭照
                  <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e, kid.id)} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>{kid.name}</div>
              <div style={{ fontSize: 70, lineHeight: 1, fontWeight: 900, textAlign: "center" }}>{kid.points}</div>
              <div style={{ fontSize: 16, fontWeight: 800, opacity: 0.95, marginTop: 10, textAlign: "center" }}>累積點數</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: 16, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f1f1", marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 12 }}>目前排行榜</div>
          <div style={{ display: "grid", gap: 10 }}>
            {ranked.map((kid, index) => (
              <div key={kid.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: kid.accent, color: "#fff", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{index + 1}</div>
                  <div style={{ fontWeight: 900, color: "#111827", fontSize: 18 }}>{kid.name}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#374151" }}>{kid.points} 點</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", background: "#f7f7f8", borderRadius: 999, padding: 8, gap: 8, marginBottom: 20, overflowX: "auto" }}>
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => patchState({ activeKidId: kid.id })}
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

        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #f1f1f1", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #ececec" }}>
            {[
              { key: "add", label: "+ 加點" },
              { key: "minus", label: "－ 扣點" },
              { key: "reward", label: "🎁 兌換獎勵" }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => patchState({ tab: item.key })}
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
                      onClick={() => redeemReward(item.cost, item.name)}
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

        <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f1f1", marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 12 }}>每週小任務</div>

          <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
            {weeklyTasks.map(task => (
              <div key={task.id} style={{ border: "1px solid #ececec", borderRadius: 18, padding: 16, background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#111827" }}>{task.title}</div>
                    <div style={{ marginTop: 4, color: "#6b7280", fontWeight: 700 }}>{task.description}</div>
                    <div style={{ marginTop: 8, color: activeKid.accent, fontWeight: 900 }}>達成可獲得 {task.points} 點</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button onClick={() => completeTask(task)} style={{ border: "none", borderRadius: 12, padding: "10px 12px", background: activeKid.accent, color: "#fff", fontWeight: 900, cursor: "pointer" }}>完成＋{task.points}</button>
                    <button onClick={() => editTask(task)} style={{ border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 12px", background: "#fff", color: "#374151", fontWeight: 900, cursor: "pointer" }}>修改</button>
                    <button onClick={() => deleteTask(task.id)} style={{ border: "1px solid #fecaca", borderRadius: 12, padding: "10px 12px", background: "#fff1f2", color: "#e11d48", fontWeight: 900, cursor: "pointer" }}>刪除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #ececec", paddingTop: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, color: "#111827" }}>{editingTaskId ? "修改任務" : "新增任務"}</div>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="任務名稱（例如：閱讀一本書）"
              style={{ width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 16, padding: "14px 16px", fontSize: 16, fontWeight: 700, marginBottom: 10 }}
            />
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="任務說明（例如：並與爸媽分享）"
              style={{ width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 16, padding: "14px 16px", fontSize: 16, fontWeight: 700, marginBottom: 10 }}
            />
            <input
              type="number"
              value={taskPoints}
              onChange={(e) => setTaskPoints(e.target.value)}
              placeholder="完成可獲得幾點"
              style={{ width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 16, padding: "14px 16px", fontSize: 16, fontWeight: 700, marginBottom: 12 }}
            />
            <button
              onClick={saveTask}
              style={{ width: "100%", border: "none", borderRadius: 16, padding: "14px 16px", background: "#111827", color: "#fff", fontSize: 18, fontWeight: 900, cursor: "pointer" }}
            >
              {editingTaskId ? "儲存修改" : "新增任務"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", border: "1px solid #f1f1f1" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 12 }}>記錄</div>
          <div style={{ display: "grid", gap: 10 }}>
            {history.length === 0 ? (
              <div style={{ color: "#9ca3af", fontWeight: 700 }}>目前還沒有記錄</div>
            ) : (
              history.map(item => (
                <div key={item.id} style={{ border: "1px solid #ececec", borderRadius: 16, padding: 14, background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <div style={{ fontWeight: 900, color: "#111827" }}>{item.kidName}｜{item.type}</div>
                    <div style={{ fontWeight: 900, color: item.points >= 0 ? "#16a34a" : "#ef4444" }}>{item.points >= 0 ? `+${item.points}` : item.points} 點</div>
                  </div>
                  <div style={{ color: "#4b5563", fontWeight: 700, marginBottom: 4 }}>{item.text}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 700 }}>{item.createdAt}｜{item.recorder}記錄</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
