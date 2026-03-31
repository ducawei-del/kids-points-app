import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kids-points-app-v3";

const defaultState = {
  kids: [
    { id: "yoi", name: "Yoi", points: 0, avatar: null, theme: "linear-gradient(135deg,#ff6fb1,#ff8fc2)", accent: "#ff5fa8" },
    { id: "sunny", name: "Sunny", points: 0, avatar: null, theme: "linear-gradient(135deg,#67e4df,#7ee7d5)", accent: "#58d7cf" }
  ],
  recorder: "媽媽",
  weeklyTasks: [
    { id: 1, title: "閱讀一本書", description: "並與爸媽分享心得", points: 5 }
  ],
  history: []
};

function getInitialState() {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

export default function App() {
  const [state, setState] = useState(() => getInitialState());
  const { kids, recorder, weeklyTasks, history } = state;

  const [activeKidId, setActiveKidId] = useState("yoi");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPoints, setTaskPoints] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeKid = kids.find(k => k.id === activeKidId);

  const updatePoints = (delta) => {
    const val = Number(amount);
    if (!val) return;

    setState(prev => ({
      ...prev,
      kids: prev.kids.map(k =>
        k.id === activeKidId
          ? { ...k, points: Math.max(0, k.points + delta * val) }
          : k
      ),
      history: [
        {
          id: Date.now(),
          text: reason || "手動",
          kid: activeKid.name,
          point: delta * val
        },
        ...prev.history
      ]
    }));

    setReason("");
  };

  const uploadAvatar = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setState(prev => ({
        ...prev,
        kids: prev.kids.map(k =>
          k.id === id ? { ...k, avatar: reader.result } : k
        )
      }));
    };
    reader.readAsDataURL(file);
  };

  const addTask = () => {
    if (!taskTitle) return;

    setState(prev => ({
      ...prev,
      weeklyTasks: [
        ...prev.weeklyTasks,
        {
          id: Date.now(),
          title: taskTitle,
          description: taskDesc,
          points: Number(taskPoints)
        }
      ]
    }));

    setTaskTitle("");
    setTaskDesc("");
    setTaskPoints(1);
  };

  const completeTask = (task) => {
    setState(prev => ({
      ...prev,
      kids: prev.kids.map(k =>
        k.id === activeKidId
          ? { ...k, points: k.points + task.points }
          : k
      ),
      history: [
        {
          id: Date.now(),
          text: task.title,
          kid: activeKid.name,
          point: task.points
        },
        ...prev.history
      ]
    }));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>好習慣存摺</h2>

      <div style={{ display: "flex", gap: 10 }}>
        {kids.map(k => (
          <div key={k.id} style={{ flex: 1, padding: 20, background: k.theme, color: "#fff" }}>
            <div>
              {k.avatar ? (
                <img src={k.avatar} style={{ width: 80, height: 80, borderRadius: 999 }} />
              ) : (
                "👧"
              )}
            </div>
            <input type="file" onChange={(e) => uploadAvatar(e, k.id)} />
            <h3>{k.name}</h3>
            <h1>{k.points}</h1>
          </div>
        ))}
      </div>

      <h3>排行榜</h3>
      {kids
        .slice()
        .sort((a, b) => b.points - a.points)
        .map((k, i) => (
          <div key={k.id}>{i + 1}. {k.name} {k.points}</div>
        ))}

      <h3>加點</h3>
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <input value={reason} onChange={e => setReason(e.target.value)} />
      <button onClick={() => updatePoints(1)}>加</button>
      <button onClick={() => updatePoints(-1)}>扣</button>

      <h3>每週任務</h3>
      {weeklyTasks.map(t => (
        <div key={t.id}>
          {t.title} +{t.points}
          <button onClick={() => completeTask(t)}>完成</button>
        </div>
      ))}

      <input placeholder="任務" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
      <input placeholder="說明" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
      <input type="number" value={taskPoints} onChange={e => setTaskPoints(e.target.value)} />
      <button onClick={addTask}>新增任務</button>

      <h3>紀錄</h3>
      {history.map(h => (
        <div key={h.id}>{h.kid} {h.point} ({h.text})</div>
      ))}
    </div>
  );
}
