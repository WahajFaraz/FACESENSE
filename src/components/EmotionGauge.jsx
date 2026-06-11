import { motion } from 'framer-motion'
import { getDominantEmotion } from '../utils/mockData'

const HIGH_THRESHOLD = 40

export default function EmotionGauge({ label, value, color, track, isDominant }) {
  const isHigh = value >= HIGH_THRESHOLD

  return (
    <motion.div
      layout
      className={`relative rounded-xl p-4 transition-colors duration-300 ${
        isHigh ? 'glass-strong' : 'glass'
      }`}
      style={{
        borderColor: isHigh ? `${color}66` : undefined,
        boxShadow: isHigh ? `0 0 12px ${color}33, inset 0 0 8px ${color}11` : undefined,
      }}
      animate={
        isHigh
          ? {
              borderColor: [`${color}44`, `${color}88`, `${color}44`],
              transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            }
          : {}
      }
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <motion.span
          key={Math.round(value)}
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {value.toFixed(1)}%
        </motion.span>
      </div>

      {/* Progress track */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: track }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          layout
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(value, 0.5)}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, mass: 1 }}
        />
      </div>

      {/* Dominant badge */}
      {isDominant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: color, color: '#0d0e12' }}
        >
          DOMINANT
        </motion.div>
      )}
    </motion.div>
  )
}
