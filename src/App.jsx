import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kids-points-app-v2";

const initialKids = [
  { id: "yoi", name: "Yoi", points: 0, avatar: null, theme: "linear-gradient(135deg,#ff6fb1,#ff8fc2)", accent: "#ff5fa8" },
  { id: "sunny", name: "Sunny", points: 0, avatar: null, theme: "linear-gradient(135deg,#67e4df,#7ee7d5)", accent: "#58d7cf" }
];

const initialRewards = [
  { id: 1, name: "看卡通 30 分鐘", cost: 10 },
  { id: 2, name: "小點心", cost: 15 },
  { id: 3, name: "小禮物", cost: 30 }
];

const initialWeeklyTasks = [
  { id: 1, title: "閱讀一本書", description: "並與爸媽分享心得", points: 5 },
  { id: 2, title: "自己整理書包", description: "連續完成 3 天", points: 3 }
];

const initialHistory = [];

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      kids: initialKids,
      recorder: "媽媽",
      rewards: initialRewards,
      weeklyTasks: initialWeeklyTasks,
      history: initialHistory,
    };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        kids: initialKids,
        recorder: "媽媽",
        rewards: initialRewards,
        weeklyTasks: initialWeeklyTasks,
        history: initialHistory,
      };
    }
    const parsed = JSON.parse(saved);
    return {
      kids: parsed.kids || initialKids,
      recorder: parsed.recorder || "媽媽",
      rewards: parsed.rewards || initialRewards,
      weeklyTasks: parsed.weeklyTasks || initialWeeklyTasks,
      history: parsed.history || initialHistory,
    };
  } catch {
    return {
      kids: initialKids,
      recorder: "媽媽",
      rewards: initialRewards,
      weeklyTasks: initialWeeklyTasks,
      history: initialHistory,
    };
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
  const initial = getInitialState();

  const [kids, setKids] = useState(initial.kids);
  const [activeKidId, setActiveKidId] = useState("yoi");
  const [recorder, setRecorder] = useState(initial.recorder);
  const [tab, setTab] = useState("add");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [rewards] = useState(initial.rewards);
  const [weeklyTasks, setWeeklyTasks] = useState(initial.weeklyTasks);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPoints, setTaskPoints] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [history, setHistory] = useState(initial.history);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ kids, recorder, rewards, weeklyTasks, history })
    );
  }, [kids, recorder, rewards, weeklyTasks, history]);

  const activeKid = useMemo(() => kids.find(k => k.id === activeKidId) || kids[0], [kids, activeKidId]);
  const ranked = useMemo(() => rankKids(kids), [kids]);

  const addHistory = (kidName, type, text, points) => {
    setHistory(prev => [
      {
        id: Date.now() + Math.random(),
        kidName,
        type,
        text,
        points,
        recorder,
        createdAt: nowText(),
      },
      ...prev,
    ]);
  };

  const updatePoints = (delta) => {
    const n = Number(amount) || 0;
    if (!n) return;
    const pointDelta = delta * n;
    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, points: Math.max(0, k.points + pointDelta) } : k));
    addHistory(activeKid.name, delta > 0 ? "加點" : "扣點", reason || (delta > 0 ? "手動加點" : "手動扣點"), pointDelta);
    setReason("");
  };

  const redeemReward = (cost, rewardName) => {
    if (activeKid.points < cost) return;
    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, points: Math.max(0, k.points - cost) } : k));
    addHistory(activeKid.name, "兌換獎勵", `兌換：${rewardName}`, -cost);
  };

  const handleAvatarUpload = (event, kidId) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setKids(prev => prev.map(k => k.id === kidId ? { ...k, avatar: reader.result } : k));
    };
    reader.readAsDataURL(file);
  };

  const saveTask = () => {
    const pts = Number(taskPoints) || 0;
    if (!taskTitle.trim() || !pts) return;

    if (editingTaskId) {
      setWeeklyTasks(prev => prev.map(task =>
        task.id === editingTaskId
          ? { ...task, title: taskTitle.trim(), description: taskDescription.trim(), points: pts }
          : task
      ));
      setEditingTaskId(null);
    } else {
      setWeeklyTasks(prev => [
        ...prev,
        { id: Date.now(), title: taskTitle.trim(), description: taskDescription.trim(), points: pts }
      ]);
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
    setWeeklyTasks(prev => prev.filter(task => task.id !== id));
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPoints(1);
    }
  };

  const completeTask = (task) => {
    setKids(prev => prev.map(k => k.id === activeKidId ? { ...k, points: k.points + task.points } : k));
    addHistory(activeKid.name, "完成任務", `${task.title}${task.description ? `｜${task.description}` : ""}`, task.points);
  };

  const resetAll = () => {
    setKids(initialKids);
    setRecorder("媽媽");
    setWeeklyTasks(initialWeeklyTasks);
    setHistory([]);
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
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ color: "#b4b6bd", fontWeight: 800, fontSize: 18 }}>記錄者：</div>
          <button onClick={() => setRecorder("爸爸")} style={{ ...buttonBase, color: recorder === "爸爸" ? "#374151" : "#b8bcc5", boxShadow: recorder === "爸爸" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👨 爸爸</button>
          <button onClick={() => setRecorder("媽媽")} style={{ ...buttonBase, color: recorder === "媽媽" ? "#374151" : "#b8bcc5", boxShadow: recorder === "媽媽" ? "0 3px 10px rgba(0,0,0,0.05)" : "none" }}>👩 媽媽</button>
          <button onClick={resetAll} style={{ ...buttonBase, color: "#ef4444" }}>清空資料</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {kids.map(kid => (
            <div
              key={kid.id}
              onClick={() => setActiveKidId(kid.id)}
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
                <label style={{ display: "inline-block", background: "rgba(255,255,255,0.2)
