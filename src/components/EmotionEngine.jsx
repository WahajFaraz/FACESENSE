import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCamera, FiCameraOff, FiClock, FiBarChart2, FiZap } from 'react-icons/fi'
import EmotionGauge from './EmotionGauge'
import ScannerOverlay from './ScannerOverlay'
import { generateMockEmotions, getDominantEmotion, getPalette } from '../utils/mockData'

export default function EmotionEngine({ onLogSession, onNavigateVault, sessions }) {
  const [emotions, setEmotions] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [fps] = useState(0)
  const [logMessage, setLogMessage] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const palette = getPalette()
  const dominant = getDominantEmotion(emotions)
  const sessionCount = sessions?.length ?? 0

  /* ──────────────────────────────────────
   *  MOCK DATA LOOP
   *  Runs continuously when camera is
   *  inactive / loading, so the UI is
   *  always demoable out-of-the-box.
   * ────────────────────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setEmotions((prev) => generateMockEmotions(prev))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  /* ──────────────────────────────────────
   *  CAMERA ACTIVATION
   * ────────────────────────────────────── */
  const startCamera = useCallback(async () => {
    if (cameraActive) return
    setCameraError('')
    setCameraLoading(true)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = s
      if (videoRef.current) videoRef.current.srcObject = s
      setCameraActive(true)
    } catch (err) {
      setCameraError(err.message || 'Camera access denied')
    } finally {
      setCameraLoading(false)
    }
  }, [cameraActive])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  /* ──────────────────────────────────────
   *  REAL face-api.js INTEGRATION POINT
   *
   *  When the camera is active and models
   *  are loaded, swap the mock loop above
   *  for something like:
   *
   *  const detection = await faceapi
   *    .detectAllFaces(videoRef.current)
   *    .withFaceExpressions()
   *
   *  if (detection.length) {
   *    const { expressions } = detection[0]
   *    setEmotions({
   *      Happy:     (expressions.happy     ?? 0) * 100,
   *      Sad:       (expressions.sad       ?? 0) * 100,
   *      Angry:     (expressions.angry     ?? 0) * 100,
   *      Surprised: (expressions.surprised ?? 0) * 100,
   *      Neutral:   (expressions.neutral   ?? 0) * 100,
   *    })
   *  }
   *
   *  Run that inside a requestAnimationFrame
   *  loop or a setInterval(~100ms) while
   *  cameraActive === true.
   * ────────────────────────────────────── */

  /* ── Log session ── */
  const handleLog = () => {
    if (!emotions) return
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      dominant: dominant.name,
      dominantValue: dominant.value,
      snapshot: { ...emotions },
    }
    onLogSession(entry)
    setLogMessage(`${dominant.name} logged`)
    setTimeout(() => setLogMessage(''), 2000)
  }

  return (
    <div className="relative min-h-screen bg-[#0d0e12] flex flex-col lg:flex-row overflow-hidden">
      {/* ── LEFT: Camera panel ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden glass-strong">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`}
          />
          {!cameraActive && (
            <ScannerOverlay>
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0e12]/90">
                <motion.svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  className="opacity-25"
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <circle cx="36" cy="36" r="34" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" />
                  <ellipse cx="36" cy="38" rx="20" ry="18" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                  <circle cx="28" cy="32" r="1.5" fill="#22c55e" />
                  <circle cx="44" cy="32" r="1.5" fill="#22c55e" />
                  <path d="M27 44 Q36 50 45 44" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </motion.svg>
              </div>
            </ScannerOverlay>
          )}

          {/* Top-left status badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                cameraActive ? 'bg-[#22c55e]' : 'bg-[#facc15]'
              }`}
              style={{
                boxShadow: cameraActive
                  ? '0 0 6px rgba(34,197,94,0.6)'
                  : '0 0 6px rgba(250,204,21,0.4)',
              }}
            />
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">
              {cameraActive ? 'Live' : 'Demo Mode'}
            </span>
          </div>

          {/* FPS counter */}
          <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <span className="text-[10px] text-slate-500 tabular-nums">
              {fps} FPS
            </span>
          </div>
        </div>

          {/* Camera error */}
          {cameraError && (
            <div className="mt-3 text-[11px] text-red-400 text-center max-w-xs">
              {cameraError}
            </div>
          )}

          {/* Camera controls */}
        <div className="flex items-center gap-3 mt-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cameraActive ? stopCamera : startCamera}
            disabled={cameraLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all ${
              cameraActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'glass text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cameraLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <FiZap size={14} />
              </motion.span>
            ) : cameraActive ? (
              <FiCameraOff size={14} />
            ) : (
              <FiCamera size={14} />
            )}
            {cameraLoading ? 'Starting...' : cameraActive ? 'Stop Camera' : 'Enable Camera'}
          </motion.button>
        </div>
      </div>

      {/* ── RIGHT: Emotion panel ── */}
      <div className="relative w-full lg:w-[420px] xl:w-[480px] flex flex-col p-4 lg:p-6 lg:pt-8 lg:overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
              Emotion Matrix
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5">Real-time expression analysis</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <FiBarChart2 size={12} />
            <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Emotion gauges */}
        <div className="flex-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {palette.map(({ name, color, track }) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmotionGauge
                  label={name}
                  value={emotions?.[name] ?? 0}
                  color={color}
                  track={track}
                  isDominant={dominant.name === name}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 space-y-3">
          {/* Dominant emotion badge */}
          {emotions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between glass rounded-lg px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiClock size={12} />
                <span>Dominant emotion</span>
              </div>
              <span className="text-sm font-bold" style={{ color: palette.find((p) => p.name === dominant.name)?.color }}>
                {dominant.name}
              </span>
            </motion.div>
          )}

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLog}
              disabled={!emotions}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Log Session
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateVault}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer glass text-slate-300 hover:bg-slate-800 transition-all"
            >
              Mood Vault
            </motion.button>
          </div>

          {/* Toast message */}
          <AnimatePresence>
            {logMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] text-[#22c55e]/80 text-center"
              >
                {logMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
