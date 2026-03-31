import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Gift, Minus, Plus, Share2, Star, Trash2 } from 'lucide-react'

const initialKids = [
  {
    id: 'yoi',
    name: 'Yoi',
    role: '姊姊',
    hair: 'middle-part-braids',
    themeClass: 'theme-pink',
    points: 0,
    avatar: null,
    history: [],
  },
  {
    id: 'sunny',
    name: 'Sunny',
    role: '妹妹',
    hair: 'bangs-braids',
    themeClass: 'theme-cyan',
    points: 0,
    avatar: null,
    history: [],
  },
]

const initialRewards = [
  { id: 'r1', name: '看卡通 30 分鐘', cost: 10 },
  { id: 'r2', name: '小點心一份', cost: 15 },
  { id: 'r3', name: '週末小禮物', cost: 30 },
]

const STORAGE_KEYS = {
  kids: 'kids-points-app-kids',
  activeKidId: 'kids-points-app-activeKidId',
  recorder: 'kids-points-app-recorder',
  rewards: 'kids-points-app-rewards',
}

function encodeShareState(data) {
  try {
    return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(data)))))
  } catch {
    return ''
  }
}

function decodeShareState(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(value)))))
  } catch {
    return null
  }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function KidAvatar({ hair, large = false }) {
  const className = large ? 'kid-avatar-large' : 'kid-avatar-small'

  if (hair === 'middle-part-braids') {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
        <rect width="120" height="120" rx="60" fill="#f5d0c5" />
        <path d="M18 55c0-28 20-42 42-42s42 14 42 42v45H18z" fill="#2f2f3a" />
        <path d="M60 16c-10 0-20 4-28 12" stroke="#2f2f3a" strokeWidth="10" strokeLinecap="round" />
        <path d="M60 16c10 0 20 4 28 12" stroke="#2f2f3a" strokeWidth="10" strokeLinecap="round" />
        <circle cx="60" cy="65" r="28" fill="#ffd8b8" />
        <circle cx="50" cy="65" r="3" fill="#222" />
        <circle cx="70" cy="65" r="3" fill="#222" />
        <circle cx="42" cy="72" r="4" fill="#ff9aa2" />
        <circle cx="78" cy="72" r="4" fill="#ff9aa2" />
        <path d="M55 78c3 3 7 3 10 0" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect width="120" height="120" rx="60" fill="#f5d0c5" />
      <path d="M18 55c0-28 20-42 42-42s42 14 42 42v45H18z" fill="#2f2f3a" />
      <path d="M32 42h56c-6 10-18 14-28 14s-22-4-28-14z" fill="#1f1f26" />
      <path d="M22 65c0 14 8 24 14 30" stroke="#2f2f3a" strokeWidth="8" strokeLinecap="round" />
      <path d="M98 65c0 14-8 24-14 30" stroke="#2f2f3a" strokeWidth="8" strokeLinecap="round" />
      <circle cx="60" cy="65" r="28" fill="#ffd8b8" />
      <circle cx="50" cy="65" r="3" fill="#222" />
      <circle cx="70" cy="65" r="3" fill="#222" />
      <circle cx="42" cy="72" r="4" fill="#ff9aa2" />
      <circle cx="78" cy="72" r="4" fill="#ff9aa2" />
      <path d="M55 78c3 3 7 3 10 0" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function StatCard({ kid, active, onClick, rank, onUpload }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className={`kid-card ${kid.themeClass} ${active ? 'is-active' : ''}`}
    >
      <div onClick={onClick} className="kid-card-clickable">
        <div className="rank-badge">第 {rank} 名</div>
        <div className="avatar-shell">
          {kid.avatar ? (
            <img src={kid.avatar} alt={`${kid.name} 頭像`} className="avatar-image" />
          ) : (
            <KidAvatar hair={kid.hair} large />
          )}
        </div>
        <div className="kid-name">{kid.name}</div>
        <div className="kid-role">{kid.role}</div>
        <div className="kid-points">{kid.points}</div>
        <div className="kid-points-label">累積點數</div>
      </div>

      <label className="upload-link">
        更換頭像
        <input type="file" accept="image/*" className="hidden-input" onChange={(e) => onUpload(e, kid.id)} />
      </label>
    </motion.div>
  )
}

function AppButton({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

function AppInput(props) {
  return <input className="app-input" {...props} />
}

export default function App() {
  const [kids, setKids] = useState(() => {
    if (typeof window === 'undefined') return initialKids
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.kids)
      return saved ? JSON.parse(saved) : initialKids
    } catch {
      return initialKids
    }
  })

  const [activeKidId, setActiveKidId] = useState(() => {
    if (typeof window === 'undefined') return 'yoi'
    return window.localStorage.getItem(STORAGE_KEYS.activeKidId) || 'yoi'
  })

  const [recorder, setRecorder] = useState(() => {
    if (typeof window === 'undefined') return '媽媽'
    return window.localStorage.getItem(STORAGE_KEYS.recorder) || '媽媽'
  })

  const [activeTab, setActiveTab] = useState('add')
  const [addPoints, setAddPoints] = useState('1')
  const [addReason, setAddReason] = useState('')
  const [minusPoints, setMinusPoints] = useState('1')
  const [minusReason, setMinusReason] = useState('')
  const [rewards, setRewards] = useState(() => {
    if (typeof window === 'undefined') return initialRewards
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.rewards)
      return saved ? JSON.parse(saved) : initialRewards
    } catch {
      return initialRewards
    }
  })
  const [rewardName, setRewardName] = useState('')
  const [rewardCost, setRewardCost] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.kids, JSON.stringify(kids))
  }, [kids])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activeKidId, activeKidId)
  }, [activeKidId])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.recorder, recorder)
  }, [recorder])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.rewards, JSON.stringify(rewards))
  }, [rewards])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash.startsWith('#share=')) return
    const shared = decodeShareState(hash.replace('#share=', ''))
    if (!shared) return

    if (shared.kids) setKids(shared.kids)
    if (shared.activeKidId) setActiveKidId(shared.activeKidId)
    if (shared.recorder) setRecorder(shared.recorder)
    if (shared.rewards) setRewards(shared.rewards)
    setShareMessage('已載入分享內容')
  }, [])

  const activeKid = useMemo(() => kids.find((kid) => kid.id === activeKidId) || kids[0], [kids, activeKidId])
  const rankedKids = useMemo(() => [...kids].sort((a, b) => b.points - a.points), [kids])

  const updateKid = (kidId, updater) => {
    setKids((prev) => prev.map((kid) => (kid.id === kidId ? updater(kid) : kid)))
  }

  const handleUpload = (e, kidId) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateKid(kidId, (kid) => ({ ...kid, avatar: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    const amount = Number(addPoints)
    if (!amount || amount < 1 || !addReason.trim()) return

    updateKid(activeKidId, (kid) => ({
      ...kid,
      points: kid.points + amount,
      history: [
        {
          id: uid(),
          type: 'add',
          amount,
          reason: addReason.trim(),
          recorder,
          createdAt: new Date().toLocaleString('zh-TW'),
        },
        ...kid.history,
      ],
    }))

    setAddReason('')
    setAddPoints('1')
  }

  const handleMinus = () => {
    const amount = Number(minusPoints)
    if (!amount || amount < 1 || !minusReason.trim()) return

    updateKid(activeKidId, (kid) => ({
      ...kid,
      points: Math.max(0, kid.points - amount),
      history: [
        {
          id: uid(),
          type: 'minus',
          amount,
          reason: minusReason.trim(),
          recorder,
          createdAt: new Date().toLocaleString('zh-TW'),
        },
        ...kid.history,
      ],
    }))

    setMinusReason('')
    setMinusPoints('1')
  }

  const handleRedeem = (reward) => {
    if (activeKid.points < reward.cost) return
    updateKid(activeKidId, (kid) => ({
      ...kid,
      points: kid.points - reward.cost,
      history: [
        {
          id: uid(),
          type: 'redeem',
          amount: reward.cost,
          reason: `兌換：${reward.name}`,
          recorder,
          createdAt: new Date().toLocaleString('zh-TW'),
        },
        ...kid.history,
      ],
    }))
  }

  const addReward = () => {
    const cost = Number(rewardCost)
    if (!rewardName.trim() || !cost || cost < 1) return
    setRewards((prev) => [...prev, { id: uid(), name: rewardName.trim(), cost }])
    setRewardName('')
    setRewardCost('')
  }

  const deleteHistory = (historyId) => {
    updateKid(activeKidId, (kid) => ({
      ...kid,
      history: kid.history.filter((item) => item.id !== historyId),
    }))
  }

  const resetAllData = () => {
    setKids(initialKids)
    setActiveKidId('yoi')
    setRecorder('媽媽')
    setRewards(initialRewards)
    setActiveTab('add')
    setAddPoints('1')
    setAddReason('')
    setMinusPoints('1')
    setMinusReason('')
    setRewardName('')
    setRewardCost('')
    setShareMessage('')

    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const createShareLink = async () => {
    if (typeof window === 'undefined') return

    const payload = {
      kids: kids.map((kid) => ({ ...kid, avatar: null })),
      activeKidId,
      recorder,
      rewards,
    }

    const encoded = encodeShareState(payload)
    if (!encoded) {
      setShareMessage('分享失敗，請稍後再試')
      return
    }

    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('分享連結已複製，可直接傳給爸爸')
    } catch {
      setShareMessage(url)
    }
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel hero-panel">
          <div className="center">
            <div className="hero-title">📒 好習慣存摺挑戰 ⭐</div>
            <div className="hero-subtitle">每天進步一點點，存滿滿的好習慣！</div>
          </div>

          <div className="toolbar">
            <div className="toolbar-label">記錄者：</div>
            {['爸爸', '媽媽'].map((item) => (
              <AppButton
                key={item}
                variant={recorder === item ? 'dark' : 'secondary'}
                onClick={() => setRecorder(item)}
              >
                {item === '爸爸' ? '👨 爸爸' : '👩 媽媽'}
              </AppButton>
            ))}
            <AppButton variant="secondary" onClick={createShareLink}>
              <Share2 size={16} /> 分享目前內容
            </AppButton>
            <AppButton variant="secondary" onClick={resetAllData}>清空資料</AppButton>
          </div>

          {shareMessage && (
            <div className="share-message">
              <div>{shareMessage}</div>
              <div className="share-hint">目前可分享點數、獎勵、紀錄與選擇狀態；已上傳的大頭照不會跟著連結走。</div>
            </div>
          )}
        </motion.div>

        <div className="kids-grid">
          {kids.map((kid) => {
            const rank = rankedKids.findIndex((item) => item.id === kid.id) + 1
            return (
              <StatCard
                key={kid.id}
                kid={kid}
                rank={rank}
                active={kid.id === activeKidId}
                onClick={() => setActiveKidId(kid.id)}
                onUpload={handleUpload}
              />
            )
          })}
        </div>

        <div className="panel">
          <div className="kid-tabs-wrap">
            {kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => setActiveKidId(kid.id)}
                className={`kid-tab ${kid.id === activeKidId ? `kid-tab-active ${kid.themeClass}` : ''}`}
              >
                <div className="kid-tab-avatar">
                  {kid.avatar ? <img src={kid.avatar} alt={`${kid.name} 頭像`} className="avatar-image" /> : <KidAvatar hair={kid.hair} />}
                </div>
                {kid.name}
              </button>
            ))}
          </div>

          <div className="action-tabs">
            {[
              ['add', <Plus size={18} />, '加點'],
              ['minus', <Minus size={18} />, '扣點'],
              ['reward', <Gift size={18} />, '兌換獎勵'],
            ].map(([key, icon, label]) => (
              <button key={key} className={`action-tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                {icon} {label}
              </button>
            ))}
          </div>

          {activeTab === 'add' && (
            <div className="form-stack">
              <div>
                <div className="field-label">加幾點</div>
                <AppInput value={addPoints} onChange={(e) => setAddPoints(e.target.value)} />
              </div>
              <div>
                <div className="field-label">加點原因</div>
                <AppInput value={addReason} onChange={(e) => setAddReason(e.target.value)} placeholder="例：主動完成作業 📚、幫忙洗碗 🍽️、考了 100 分 🎉" />
              </div>
              <AppButton className="full-width" onClick={handleAdd}>幫 {activeKid.name} 加點</AppButton>
            </div>
          )}

          {activeTab === 'minus' && (
            <div className="form-stack">
              <div>
                <div className="field-label">扣幾點</div>
                <AppInput value={minusPoints} onChange={(e) => setMinusPoints(e.target.value)} />
              </div>
              <div>
                <div className="field-label">扣點原因</div>
                <AppInput value={minusReason} onChange={(e) => setMinusReason(e.target.value)} placeholder="例：沒收玩具、拖延刷牙、沒整理書包" />
              </div>
              <AppButton className="full-width" variant="secondary" onClick={handleMinus}>幫 {activeKid.name} 扣點</AppButton>
            </div>
          )}

          {activeTab === 'reward' && (
            <div className="form-stack reward-stack">
              <div className="reward-grid">
                {rewards.map((reward) => {
                  const canRedeem = activeKid.points >= reward.cost
                  return (
                    <div key={reward.id} className="reward-card">
                      <div className="reward-title">{reward.name}</div>
                      <div className="reward-cost">需要 {reward.cost} 點</div>
                      <AppButton className="full-width" onClick={() => handleRedeem(reward)} disabled={!canRedeem}>
                        {canRedeem ? '立即兌換' : '點數不足'}
                      </AppButton>
                    </div>
                  )
                })}
              </div>

              <div className="new-reward-box">
                <div className="new-reward-title">新增獎勵</div>
                <div className="new-reward-grid">
                  <AppInput value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder="獎勵名稱" />
                  <AppInput value={rewardCost} onChange={(e) => setRewardCost(e.target.value)} placeholder="點數" />
                  <AppButton onClick={addReward}>新增</AppButton>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bottom-grid">
          <div className="panel">
            <div className="panel-title"><BookOpen size={22} /> {activeKid.name} 的點數紀錄</div>
            <div className="history-list">
              {activeKid.history.length === 0 ? (
                <div className="empty-state">還沒有紀錄，今天開始累積第一筆好習慣吧！</div>
              ) : (
                activeKid.history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-left">
                      <div className={`history-icon ${item.type}`}>
                        {item.type === 'add' ? '+' : item.type === 'minus' ? '-' : '🎁'}
                      </div>
                      <div>
                        <div className="history-reason">{item.reason}</div>
                        <div className="history-meta">{item.createdAt}｜{item.recorder}記錄</div>
                      </div>
                    </div>
                    <div className="history-right">
                      <div className={`history-amount ${item.type}`}>
                        {item.type === 'minus' || item.type === 'redeem' ? '-' : '+'}
                        {item.amount}
                      </div>
                      <button className="icon-btn" onClick={() => deleteHistory(item.id)} aria-label="刪除紀錄">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title"><Star size={22} /> 目前點數排行與每週小目標</div>
            <div className="ranking-box">
              <div className="ranking-title">目前點數排行</div>
              <div className="ranking-list">
                {rankedKids.map((kid, index) => (
                  <div key={kid.id} className="ranking-item">
                    <div className="ranking-left">
                      <div className="ranking-index">{index + 1}</div>
                      <div>
                        <div className="ranking-name">{kid.name}</div>
                        <div className="ranking-role">{kid.role}</div>
                      </div>
                    </div>
                    <div className="ranking-points">{kid.points} 點</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="goal-card pink-goal">
              <div className="goal-name">Yoi</div>
              <div className="goal-text">閱讀一本書、讀書分享心得</div>
            </div>
            <div className="goal-card cyan-goal">
              <div className="goal-name">Sunny</div>
              <div className="goal-text">閱讀一本書、讀書分享心得</div>
            </div>

            <AppButton className="full-width" onClick={() => setShowDialog(true)}>查看可擴充功能</AppButton>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">下一步可以加的功能</div>
            <div className="dialog-list">
              <div>1. 家長登入與權限管理</div>
              <div>2. 每日任務清單與打卡</div>
              <div>3. 月報表與排行榜</div>
              <div>4. 雲端同步與手機版 PWA</div>
              <div>5. 獎勵圖片、音效、動畫</div>
            </div>
            <AppButton className="full-width" onClick={() => setShowDialog(false)}>關閉</AppButton>
          </div>
        </div>
      )}
    </div>
  )
}
