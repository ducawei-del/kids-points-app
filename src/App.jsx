import React, { useState } from "react";

const initialKids = [
  { id: "yoi", name: "Yoi", points: 0 },
  { id: "sunny", name: "Sunny", points: 0 }
];

export default function App() {
  const [kids, setKids] = useState(initialKids);
  const [activeKidId, setActiveKidId] = useState("yoi");

  return (
    <div className="p-4">

      {/* 上面選人 */}
      <div className="flex gap-3 overflow-x-auto whitespace-nowrap bg-slate-100 p-2 rounded-full mb-4">
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => setActiveKidId(kid.id)}
            className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-full font-bold ${
              kid.id === activeKidId
                ? "bg-white text-black shadow"
                : "text-gray-400"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            {kid.name}
          </button>
        ))}
      </div>

      {/* 左右卡片 */}
      <div className="grid grid-cols-2 gap-3">
        {kids.map((kid) => (
          <div key={kid.id} className="p-3 bg-white rounded-xl shadow">
            <div className="text-lg font-bold">{kid.name}</div>
            <div className="text-3xl font-black">{kid.points}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
