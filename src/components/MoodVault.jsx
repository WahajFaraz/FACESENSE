import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiTrash2, FiBarChart2, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { getEmotionNames, getPalette } from '../utils/mockData'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getColor(name) {
  return getPalette().find((p) => p.name === name)?.color ?? '#94a3b8'
}

/* ── Mini SVG bar chart ── */
function MiniBarChart({ snapshot, dominant }) {
  const names = getEmotionNames()
  const maxVal = Math.max(...names.map((n) => snapshot?.[n] ?? 0), 1)

  return (
    <div className="flex items-end justify-between gap-1 h-16 pt-2">
      {names.map((name) => {
        const v = snapshot?.[name] ?? 0
        const h = (v / maxVal) * 100
        const isDom = dominant === name
        return (
          <div key={name} className="flex-1 flex flex-col items-center gap-0.5">
            <motion.div
              className="w-full rounded-t-sm"
              style={{
                backgroundColor: getColor(name),
                opacity: isDom ? 1 : 0.5,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(h, 4)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
            <span
              className="text-[6px] font-bold uppercase tracking-wider"
              style={{ color: getColor(name), opacity: isDom ? 1 : 0.4 }}
            >
              {name[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Animated trend line graph ── */
function TrendGraph({ sessions }) {
  const sorted = [...sessions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const names = getEmotionNames()

  const { chartWidth, chartHeight, points, yMax } = useMemo(() => {
    const w = 600
    const h = 180
    const pad = 4
    const max = Math.max(...sorted.flatMap((s) => names.map((n) => s.snapshot?.[n] ?? 0)), 10)
    const pts = sorted.map((s, i) => {
      const x = (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2) + pad
      const y = {}
      names.forEach((n) => {
        const val = s.snapshot?.[n] ?? 0
        y[n] = h - pad - (val / max) * (h - pad * 2)
      })
      return { x, y, label: formatDate(s.timestamp), dom: s.dominant }
    })
    return { chartWidth: w, chartHeight: h, points: pts, yMax: max }
  }, [sorted])

  if (sorted.length < 2) {
    return (
      <div className="flex items-center justify-center h-[180px] text-slate-600 text-xs">
        Log at least 2 sessions to see trends
      </div>
    )
  }

  const lineColors = names.reduce((acc, n) => ({ ...acc, [n]: getColor(n) }), {})

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="4"
            y1={4 + (1 - f) * (chartHeight - 8)}
            x2={chartWidth - 4}
            y2={4 + (1 - f) * (chartHeight - 8)}
            stroke="#1e293b"
            strokeWidth="0.5"
          />
        ))}

        {/* Lines */}
        {names.map((name) => {
          const pts = points.map((p) => `${p.x},${p.y[name]}`).join(' ')
          return (
            <motion.path
              key={name}
              d={`M ${pts}`}
              fill="none"
              stroke={lineColors[name]}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          )
        })}

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y[p.dom]} r="3" fill={getColor(p.dom)} stroke="#0d0e12" strokeWidth="1" />
            <text x={p.x} y={chartHeight + 14} textAnchor="middle" fill="#475569" fontSize="7">
              {p.label.length > 8 ? p.label.slice(0, 6) + '..' : p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function MoodVault({ sessions, onClear, onBack }) {
  const [tab, setTab] = useState('cards')

  const stats = useMemo(() => {
    if (!sessions.length) return null
    const counts = {}
    sessions.forEach((s) => {
      counts[s.dominant] = (counts[s.dominant] ?? 0) + 1
    })
    const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return {
      total: sessions.length,
      topEmotion: topEmotion[0],
      topCount: topEmotion[1],
      topPct: Math.round((topEmotion[1] / sessions.length) * 100),
    }
  }, [sessions])

  return (
    <div className="relative min-h-screen bg-[#0d0e12] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 glass-strong px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </motion.button>
          <div>
            <h1 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
              Mood Vault
            </h1>
            <p className="text-[10px] text-slate-600">{sessions.length} recorded session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-800 text-[10px]">
            <button
              onClick={() => setTab('cards')}
              className={`px-3 py-1.5 font-medium cursor-pointer transition-colors ${
                tab === 'cards' ? 'bg-slate-800 text-slate-200' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <FiBarChart2 size={13} className="inline mr-1" />Cards
            </button>
            <button
              onClick={() => setTab('trends')}
              className={`px-3 py-1.5 font-medium cursor-pointer transition-colors ${
                tab === 'trends' ? 'bg-slate-800 text-slate-200' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <FiTrendingUp size={13} className="inline mr-1" />Trends
            </button>
          </div>

          {sessions.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <FiTrash2 size={15} />
            </motion.button>
          )}
        </div>
      </header>

      {/* ── Stats bar ── */}
      {stats && (
        <div className="px-4 py-3 flex gap-3 overflow-x-auto">
          <div className="glass rounded-lg px-3.5 py-2 flex items-center gap-2 shrink-0">
            <FiCalendar size={13} className="text-slate-500" />
            <span className="text-xs text-slate-400">
              <strong className="text-slate-200">{stats.total}</strong> total
            </span>
          </div>
          <div className="glass rounded-lg px-3.5 py-2 flex items-center gap-2 shrink-0">
            <FiTrendingUp size={13} className="text-slate-500" />
            <span className="text-xs text-slate-400">
              Top:{' '}
              <strong style={{ color: getColor(stats.topEmotion) }}>
                {stats.topEmotion}
              </strong>{' '}
              <span className="text-slate-600">({stats.topPct}%)</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {sessions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <FiBarChart2 size={24} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No sessions recorded yet</p>
            <p className="text-xs text-slate-700 mt-1 max-w-xs">
              Start the emotion engine and log sessions to see your mood analytics here.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="mt-5 px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer glass text-slate-300 hover:bg-slate-800 transition-all"
            >
              Go to Scanner
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── Cards view ── */}
      {sessions.length > 0 && tab === 'cards' && (
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...sessions].reverse().map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 hover:border-[#22c55e]/20 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-600 tracking-wider">
                    {formatDate(session.timestamp)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${getColor(session.dominant)}22`,
                      color: getColor(session.dominant),
                    }}
                  >
                    {session.dominant}
                  </span>
                </div>
                {/* Mini chart */}
                {session.snapshot && (
                  <MiniBarChart snapshot={session.snapshot} dominant={session.dominant} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trends view ── */}
      {sessions.length > 0 && tab === 'trends' && (
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp size={14} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Emotional Trend Line
              </span>
            </div>
            <TrendGraph sessions={sessions} />
          </div>
        </div>
      )}
    </div>
  )
}
