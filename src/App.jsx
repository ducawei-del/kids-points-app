import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuXMfvkNFkt8uGxFrrgQPYfpDS-XRVhQ",
  authDomain: "kids-points-7bbee.firebaseapp.com",
  projectId: "kids-points-7bbee",
  storageBucket: "kids-points-7bbee.firebasestorage.app",
  messagingSenderId: "594490154631",
  appId: "1:594490154631:web:2615022cfda45f966de222"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "family", "main");

const defaultState = {
  kids: [
    { id: "yoi", name: "Yoi", points: 0, avatar: null, accent: "#ff5fa8", bg: "linear-gradient(135deg,#ff6fb1 0%,#ff8fc2 100%)" },
    { id: "sunny", name: "Sunny", points: 0, avatar: null, accent: "#58d7cf", bg: "linear-gradient(135deg,#67e4df 0%,#7ee7d5 100%)" }
  ],
  recorder: "媽媽",
  activeKidId: "yoi",
  tab: "add",
  rewards: [
    { id: 1, name: "做指甲", cost: 300 },
    { id: 2, name: "使用手機30分鐘", cost: 100 },
    { id: 3, name: "去公園玩", cost: 35 },
    { id: 4, name: "買100元以下文具", cost: 80 }
  ],
  weeklyTasks: [
    { id: 1, title: "閱讀一本書", description: "並與爸媽分享心得", points: 5 },
    { id: 2, title: "自己整理書包", description: "連續完成 3 天", points: 3 }
  ],
  history: []
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f2f3",
    padding: "20px 14px",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937"
  },
  shell: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 32,
    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
    padding: 20
  },
  title: { fontSize: 26, fontWeight: 900, textAlign: "center", margin: 0 },
  subtitle: { textAlign: "center", color: "#c2c6cf", fontSize: 18, fontWeight: 800, margin: "12px 0 6px" },
  sync: { textAlign: "center", color: "#9ca3af", fontSize: 14, fontWeight: 800, marginBottom: 18 },
  rowCenter: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  pill: active => ({
    border: "2px solid #e5e7eb",
    background: "#fff",
    borderRadius: 999,
    padding: "12px 24px",
    fontSize: 18,
    fontWeight: 900,
    color: active ? "#374151" : "#b9bec8",
    boxShadow: active ? "0 4px 10px rgba(0,0,0,0.06)" : "none",
    cursor: "pointer"
  }),
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 18, marginBottom: 20 },
  card: bg => ({
    background: bg,
    borderRadius: 30,
    padding: "26px 18px 24px",
    color: "#fff",
    minHeight: 360,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 12px 26px rgba(0,0,0,0.08)",
    cursor: "pointer"
  }),
  avatarWrap: {
    width: 108,
    height: 108,
    borderRadius: "50%",
    border: "5px solid rgba(255,255,255,0.55)",
    margin: "0 auto 12px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  miniBtn: {
    display: "inline-block",
    margin: "0 auto",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer"
  },
  cardName: { textAlign: "center", fontSize: 28, fontWeight: 900, margin: "14px 0 8px" },
  cardPoint: { textAlign: "center", fontSize: 84, lineHeight: 1, fontWeight: 900, margin: 0 },
  cardLabel: { textAlign: "center", fontSize: 18, fontWeight: 900, marginTop: 12 },
  rankingBox: {
    background: "#fff",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
    marginBottom: 20
  },
  sectionTitle: { fontSize: 22, fontWeight: 900, margin: "0 0 14px" },
  rankItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#f7f8fb", borderRadius: 18, padding: "16px 18px", marginBottom: 12 },
  kidSwitchWrap: { display: "flex", background: "#f7f7f8", borderRadius: 999, padding: 8, gap: 8, marginBottom: 20, overflowX: "auto" },
  kidSwitch: (active, accent) => ({
    minWidth: 180,
    border: "none",
    borderRadius: 999,
    padding: "14px 18px",
    background: active ? accent : "transparent",
    color: active ? "#fff" : "#c0c4cc",
    fontWeight: 900,
    fontSize: 18,
    textAlign: "left",
    cursor: "pointer"
  }),
  whiteBox: { background: "#fff", borderRadius: 28, boxShadow: "0 8px 20px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: 20 },
  tabs: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", borderBottom: "1px solid #ececec" },
  tabBtn: (active, accent) => ({
    border: "none",
    background: "#fff",
    padding: "18px 10px 16px",
    fontWeight: 900,
    fontSize: 18,
    color: active ? "#374151" : "#b6bbc4",
    borderBottom: active ? `4px solid ${accent}` : "4px solid transparent",
    cursor: "pointer"
  }),
  body: { padding: 20 },
  label: { color: "#b6bbc4", fontWeight: 800, marginBottom: 8, fontSize: 16 },
  input: { width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 18, padding: "16px", fontSize: 18, fontWeight: 700, marginBottom: 14, outline: "none" },
  bigInput: { width: "100%", boxSizing: "border-box", border: "2px solid #ececec", borderRadius: 18, padding: "16px", fontSize: 26, fontWeight: 900, marginBottom: 14, outline: "none" },
  primaryBtn: accent => ({ width: "100%", border: "none", borderRadius: 18, padding: "16px 18px", background: accent, color: "#fff", fontSize: 20, fontWeight: 900, cursor: "pointer" }),
  itemBox: { border: "1px solid #ececec", borderRadius: 18, padding: 16, background: "#fafafa", marginBottom: 12 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  subBtn: { border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 12px", background: "#fff", color: "#374151", fontWeight: 900, cursor: "pointer" },
  delBtn: { border: "1px solid #fecaca", borderRadius: 12, padding: "10px 12px", background: "#fff1f2", color: "#e11d48", fontWeight: 900, cursor: "pointer" },
  logBox: { border: "1px solid #ececec", borderRadius: 16, padding: 14, background: "#fafafa", marginBottom: 10 }
};

export default function App() {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("同步中...");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPoints, setTaskPoints] = useState(1);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState(1);
  const [editingRewardId, setEditingRewardId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setState({ ...defaultState, ...snap.data() });
        } else {
          setDoc(docRef, defaultState);
        }
        setLoaded(true);
        setSaveStatus("已同步");
      },
      () => {
        setLoaded(true);
        setSaveStatus("同步失敗");
      }
    );
    return () => unsub();
  }, []);

  const syncState = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setSaveStatus("同步中...");
      setDoc(docRef, next)
        .then(() => setSaveStatus("已同步"))
        .catch(() => setSaveStatus("同步失敗"));
      return next;
    });
  };

  const { kids, recorder, rewards, weeklyTasks, history, activeKidId, tab } = state;
  const activeKid = useMemo(() => kids.find((k) => k.id === activeKidId) || kids[0], [kids, activeKidId]);
  const ranked = useMemo(() => [...kids].sort((a, b) => b.points - a.points), [kids]);

  const addHistory = (kidName, type, text, points, usedRecorder = recorder) => ({
    id: Date.now() + Math.random(),
    kidName,
    type,
    text,
    points,
    recorder: usedRecorder,
    createdAt: new Date().toLocaleString("zh-TW")
  });

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 360;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e, kidId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (img) => {
      syncState((prev) => ({
        ...prev,
        kids: prev.kids.map((k) => (k.id === kidId ? { ...k, avatar: img } : k))
      }));
    });
    e.target.value = "";
  };

  const updatePoints = (delta) => {
    const n = Number(amount) || 0;
    if (!n) return;
    const pointDelta = delta * n;
    syncState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) => (k.id === prev.activeKidId ? { ...k, points: Math.max(0, k.points + pointDelta) } : k)),
      history: [addHistory(activeKid.name, delta > 0 ? "加點" : "扣點", reason || (delta > 0 ? "手動加點" : "手動扣點"), pointDelta, prev.recorder), ...prev.history]
    }));
    setReason("");
  };

  const redeemReward = (cost, name) => {
    if (activeKid.points < cost) return;
    syncState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) => (k.id === prev.activeKidId ? { ...k, points: Math.max(0, k.points - cost) } : k)),
      history: [addHistory(activeKid.name, "兌換獎勵", `兌換：${name}`, -cost, prev.recorder), ...prev.history]
    }));
  };

  const completeTask = (task) => {
    syncState((prev) => ({
      ...prev,
      kids: prev.kids.map((k) => (k.id === prev.activeKidId ? { ...k, points: k.points + task.points } : k)),
      history: [addHistory(activeKid.name, "完成任務", `${task.title}${task.description ? `｜${task.description}` : ""}`, task.points, prev.recorder), ...prev.history]
    }));
  };

  const saveTask = () => {
    const pts = Number(taskPoints) || 0;
    if (!taskTitle.trim() || !pts) return;
    syncState((prev) => ({
      ...prev,
      weeklyTasks: editingTaskId
        ? prev.weeklyTasks.map((t) => (t.id === editingTaskId ? { ...t, title: taskTitle.trim(), description: taskDescription.trim(), points: pts } : t))
        : [...prev.weeklyTasks, { id: Date.now(), title: taskTitle.trim(), description: taskDescription.trim(), points: pts }]
    }));
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPoints(1);
  };

  const saveReward = () => {
    const cost = Number(rewardCost) || 0;
    if (!rewardName.trim() || !cost) return;
    syncState((prev) => ({
      ...prev,
      rewards: editingRewardId
        ? prev.rewards.map((r) => (r.id === editingRewardId ? { ...r, name: rewardName.trim(), cost } : r))
        : [...prev.rewards, { id: Date.now(), name: rewardName.trim(), cost }]
    }));
    setEditingRewardId(null);
    setRewardName("");
    setRewardCost(1);
  };

  if (!loaded) return <div style={{ ...styles.page, display: "flex", justifyContent: "center", alignItems: "center" }}>同步中...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>📝 好習慣存摺挑戰⭐</h1>
        <div style={styles.subtitle}>每天進步一點點，存滿滿的好習慣！</div>
        <div style={styles.sync}>{saveStatus}</div>

        <div style={styles.rowCenter}>
          <div style={{ color: "#b4b6bd", fontWeight: 800, fontSize: 18 }}>記錄者：</div>
          <button style={styles.pill(recorder === "爸爸")} onClick={() => syncState((prev) => ({ ...prev, recorder: "爸爸" }))}>👨 爸爸</button>
          <button style={styles.pill(recorder === "媽媽")} onClick={() => syncState((prev) => ({ ...prev, recorder: "媽媽" }))}>👩 媽媽</button>
        </div>

        <div style={styles.grid2}>
          {kids.map((kid) => (
            <div key={kid.id} style={styles.card(kid.bg)} onClick={() => syncState((prev) => ({ ...prev, activeKidId: kid.id }))}>
              <div>
                <div style={styles.avatarWrap}>
                  {kid.avatar ? <img src={kid.avatar} alt={kid.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 44 }}>👧</div>}
                </div>
                <div style={{ textAlign: "center" }}>
                  <label style={styles.miniBtn}>
                    修改大頭照
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleAvatarUpload(e, kid.id)} />
                  </label>
                </div>
                <div style={styles.cardName}>{kid.name}</div>
              </div>
              <div>
                <div style={styles.cardPoint}>{kid.points}</div>
                <div style={styles.cardLabel}>累積點數</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.rankingBox}>
          <div style={styles.sectionTitle}>目前排行榜</div>
          {ranked.map((kid, index) => (
            <div key={kid.id} style={styles.rankItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: kid.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{index + 1}</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{kid.name}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{kid.points} 點</div>
            </div>
          ))}
        </div>

        <div style={styles.kidSwitchWrap}>
          {kids.map((kid) => (
            <button key={kid.id} style={styles.kidSwitch(kid.id === activeKidId, kid.accent)} onClick={() => syncState((prev) => ({ ...prev, activeKidId: kid.id }))}>👧 {kid.name}</button>
          ))}
        </div>

        <div style={styles.whiteBox}>
          <div style={styles.tabs}>
            {[
              { key: "add", label: "+ 加點" },
              { key: "minus", label: "－ 扣點" },
              { key: "reward", label: "🎁 兌換獎勵" }
            ].map((item) => (
              <button key={item.key} style={styles.tabBtn(tab === item.key, activeKid.accent)} onClick={() => syncState((prev) => ({ ...prev, tab: item.key }))}>{item.label}</button>
            ))}
          </div>

          <div style={styles.body}>
            {(tab === "add" || tab === "minus") && (
              <>
                <div style={styles.label}>{tab === "add" ? "加幾點" : "扣幾點"}</div>
                <input style={styles.bigInput} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div style={styles.label}>{tab === "add" ? "加點原因" : "扣點原因"}</div>
                <input style={styles.input} type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={tab === "add" ? "例：主動完成作業、幫忙洗碗、考了100分" : "例：拖延、吵架、沒收玩具"} />
                <button style={styles.primaryBtn(activeKid.accent)} onClick={() => updatePoints(tab === "add" ? 1 : -1)}>{tab === "add" ? `幫 ${activeKid.name} 加點` : `幫 ${activeKid.name} 扣點`}</button>
              </>
            )}

            {tab === "reward" && (
              <div>
                {rewards.map((item) => (
                  <div key={item.id} style={styles.itemBox}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>{item.name}</div>
                        <div style={{ color: "#9ca3af", fontWeight: 800, marginTop: 4 }}>需要 {item.cost} 點</div>
                      </div>
                      <div style={styles.actions}>
                        <button style={{ ...styles.subBtn, background: activeKid.points >= item.cost ? activeKid.accent : "#d1d5db", color: "#fff", border: "none" }} onClick={() => redeemReward(item.cost, item.name)}>兌換</button>
                        <button style={styles.subBtn} onClick={() => { setEditingRewardId(item.id); setRewardName(item.name); setRewardCost(item.cost); }}>修改</button>
                        <button style={styles.delBtn} onClick={() => syncState((prev) => ({ ...prev, rewards: prev.rewards.filter((r) => r.id !== item.id) }))}>刪除</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: "1px solid #ececec", paddingTop: 16, marginTop: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>{editingRewardId ? "修改獎勵" : "新增獎勵"}</div>
                  <input style={styles.input} type="text" value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder="獎勵名稱" />
                  <input style={styles.input} type="number" value={rewardCost} onChange={(e) => setRewardCost(e.target.value)} placeholder="需要幾點" />
                  <button style={styles.primaryBtn("#111827")} onClick={saveReward}>{editingRewardId ? "儲存修改" : "新增獎勵"}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.rankingBox}>
          <div style={styles.sectionTitle}>每週小任務</div>
          {weeklyTasks.map((task) => (
            <div key={task.id} style={styles.itemBox}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{task.title}</div>
                  <div style={{ color: "#6b7280", fontWeight: 700, marginTop: 4 }}>{task.description}</div>
                  <div style={{ color: activeKid.accent, fontWeight: 900, marginTop: 8 }}>達成可獲得 {task.points} 點</div>
                </div>
                <div style={styles.actions}>
                  <button style={{ ...styles.subBtn, background: activeKid.accent, color: "#fff", border: "none" }} onClick={() => completeTask(task)}>完成＋{task.points}</button>
                  <button style={styles.subBtn} onClick={() => { setEditingTaskId(task.id); setTaskTitle(task.title); setTaskDescription(task.description); setTaskPoints(task.points); }}>修改</button>
                  <button style={styles.delBtn} onClick={() => syncState((prev) => ({ ...prev, weeklyTasks: prev.weeklyTasks.filter((t) => t.id !== task.id) }))}>刪除</button>
                </div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #ececec", paddingTop: 16, marginTop: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>{editingTaskId ? "修改任務" : "新增任務"}</div>
            <input style={styles.input} type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="任務名稱" />
            <input style={styles.input} type="text" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="任務說明" />
            <input style={styles.input} type="number" value={taskPoints} onChange={(e) => setTaskPoints(e.target.value)} placeholder="任務點數" />
            <button style={styles.primaryBtn("#111827")} onClick={saveTask}>{editingTaskId ? "儲存修改" : "新增任務"}</button>
          </div>
        </div>

        <div style={styles.rankingBox}>
          <div style={styles.sectionTitle}>記錄</div>
          {history.length === 0 ? (
            <div style={{ color: "#9ca3af", fontWeight: 700 }}>目前還沒有記錄</div>
          ) : (
            history.map((item) => (
              <div key={item.id} style={styles.logBox}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                  <div style={{ fontWeight: 900 }}>{item.kidName}｜{item.type}</div>
                  <div style={{ fontWeight: 900, color: item.points >= 0 ? "#16a34a" : "#ef4444" }}>{item.points >= 0 ? `+${item.points}` : `${item.points}`} 點</div>
                </div>
                <div style={{ color: "#4b5563", fontWeight: 700, marginBottom: 4 }}>{item.text}</div>
                <div style={{ color: "#9ca3af", fontSize: 13, fontWeight: 700 }}>{item.createdAt}｜{item.recorder}記錄</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
