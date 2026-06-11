import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScannerOverlay from './ScannerOverlay'

export default function CalibrationScreen({ onComplete }) {
  const [stage, setStage] = useState('scanning')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (stage !== 'scanning') return
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setStage('ready')
          return 100
        }
        return p + 1
      })
    }, 40)
    return () => clearInterval(t)
  }, [stage])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0e12] px-6 overflow-hidden">
      {/* Subtle radial glow behind scanner */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center w-full max-w-lg"
        >
          {/* Scanner frame */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass-strong mb-8">
            <ScannerOverlay>
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0e12] bg-opacity-80">
                {/* Pulsing face silhouette placeholder */}
                <motion.svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  className="opacity-30"
                  animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <circle cx="40" cy="40" r="38" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
                  <ellipse cx="40" cy="42" rx="24" ry="22" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                  <circle cx="31" cy="35" r="2" fill="#22c55e" />
                  <circle cx="49" cy="35" r="2" fill="#22c55e" />
                  <path d="M30 48 Q40 56 50 48" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </motion.svg>

                {/* Instructional text */}
                <p className="mt-4 text-xs text-slate-600 tracking-widest uppercase">
                  Center your face inside the scanner
                </p>
              </div>
            </ScannerOverlay>
          </div>

          {/* Scan progress */}
          <div className="w-full max-w-xs mb-6">
            <div className="flex justify-between text-[10px] text-slate-600 tracking-wider mb-1.5">
              <span>BIOMETRIC CALIBRATION</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, #22c55e, #06b6d4)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Status card */}
          <div className="glass rounded-xl px-5 py-3 flex items-center gap-3 mb-6">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                stage === 'ready' ? 'bg-[#22c55e]' : 'bg-[#facc15]'
              }`}
              style={{
                boxShadow:
                  stage === 'ready'
                    ? '0 0 8px rgba(34,197,94,0.6)'
                    : '0 0 8px rgba(250,204,21,0.4)',
              }}
            />
            <span className="text-xs text-slate-400 tracking-wide">
              {stage === 'scanning'
                ? 'Initializing neural interface...'
                : 'Calibration complete. AI engine ready.'}
            </span>
          </div>

          {/* Action button */}
          <motion.button
            whileHover={stage === 'ready' ? { scale: 1.03 } : {}}
            whileTap={stage === 'ready' ? { scale: 0.97 } : {}}
            onClick={stage === 'ready' ? onComplete : undefined}
            disabled={stage !== 'ready'}
            className={`relative px-10 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 ${
              stage === 'ready'
                ? 'text-[#0d0e12] bg-[#22c55e] animate-pulse-glow'
                : 'text-slate-600 bg-slate-800 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10">
              {stage === 'ready' ? 'Start AI Engine' : 'Calibrating...'}
            </span>
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
