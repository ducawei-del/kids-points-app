import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// Firebase
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

export default function App() {
  const [state, setState] = useState({
    kids: [
      { id: 1, name: "Yoi", points: 0 },
      { id: 2, name: "Sunny", points: 0 }
    ],
    activeKidId: 1,
    rewards: [
      { id: 1, name: "做指甲", cost: 300 },
      { id: 2, name: "使用手機30分鐘", cost: 100 },
      { id: 3, name: "去公園玩", cost: 35 },
      { id: 4, name: "買100元以下文具", cost: 80 }
    ],
    tasks: [
      { id: 1, name: "閱讀一本書並分享", points: 50 }
    ],
    history: []
  });

  // 🔥 即時同步
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "family", "main"), (docSnap) => {
      if (docSnap.exists()) {
        setState(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  // 🔥 更新資料
  const patchState = (updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      setDoc(doc(db, "family", "main"), newState);
      return newState;
    });
  };

  const activeKid = state.kids.find(k => k.id === state.activeKidId);

  // 加點
  const addPoint = (point) => {
    const kids = state.kids.map(k =>
      k.id === state.activeKidId
        ? { ...k, points: k.points + point }
        : k
    );

    patchState({
      kids,
      history: [
        ...state.history,
        `${activeKid.name} +${point}`
      ]
    });
  };

  // 兌換
  const redeem = (reward) => {
    if (activeKid.points < reward.cost) return;

    const kids = state.kids.map(k =>
      k.id === state.activeKidId
        ? { ...k, points: k.points - reward.cost }
        : k
    );

    patchState({
      kids,
      history: [
        ...state.history,
        `${activeKid.name} 兌換 ${reward.name}`
      ]
    });
  };

  // 排行榜
  const ranking = [...state.kids].sort((a, b) => b.points - a.points);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>好習慣存摺 ⭐</h2>

      {/* 切換人物 */}
      <div style={{ marginBottom: 10 }}>
        {state.kids.map(k => (
          <button
            key={k.id}
            onClick={() => patchState({ activeKidId: k.id })}
            style={{
              marginRight: 10,
              padding: 10,
              background: state.activeKidId === k.id ? "#000" : "#ddd",
              color: state.activeKidId === k.id ? "#fff" : "#000"
            }}
          >
            {k.name}
          </button>
        ))}
      </div>

      {/* 左右卡片 */}
      <div style={{ display: "flex", gap: 20 }}>
        {state.kids.map(k => (
          <div key={k.id} style={{
            flex: 1,
            padding: 20,
            borderRadius: 20,
            background: k.id === 1 ? "#ff8db3" : "#6dd5c7",
            color: "#fff"
          }}>
            <h3>{k.name}</h3>
            <h1>{k.points}</h1>
          </div>
        ))}
      </div>

      {/* 加點 */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => addPoint(10)}>+10</button>
        <button onClick={() => addPoint(50)}>+50</button>
      </div>

      {/* 任務 */}
      <h3>每週任務</h3>
      {state.tasks.map(t => (
        <div key={t.id}>
          {t.name} +{t.points}
          <button onClick={() => addPoint(t.points)}>完成</button>
        </div>
      ))}

      {/* 獎勵 */}
      <h3>兌換獎勵</h3>
      {state.rewards.map(r => (
        <div key={r.id}>
          {r.name} ({r.cost})
          <button onClick={() => redeem(r)}>兌換</button>
        </div>
      ))}

      {/* 排行榜 */}
      <h3>排行榜</h3>
      {ranking.map((k, i) => (
        <div key={k.id}>
          {i + 1}. {k.name} {k.points}
        </div>
      ))}

      {/* 紀錄 */}
      <h3>紀錄</h3>
      {state.history.map((h, i) => (
        <div key={i}>{h}</div>
      ))}
    </div>
  );
}
