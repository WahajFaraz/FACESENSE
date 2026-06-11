import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export default function SplashScreen({ onStart }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0e12] px-6">
      {/* Background glow orbs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60vmax] h-[60vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(34,197,94,0.06) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[50vmax] h-[50vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(6,182,212,0.05) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Grid pattern overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center max-w-xl"
      >
        {/* Icon mark */}
        <motion.div variants={item} className="mb-6">
          <svg width="56" height="56" viewBox="0 0 64 64" className="drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="#22c55e" strokeWidth="2" />
            <path d="M20 38 Q32 24 44 38" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="26" cy="30" r="2.5" fill="#22c55e" />
            <circle cx="38" cy="30" r="2.5" fill="#22c55e" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            EMOTO-SCAN
          </span>
          <span className="block text-2xl sm:text-3xl md:text-4xl mt-1 font-light tracking-[0.3em] text-slate-400">
            AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="mt-4 text-sm sm:text-base text-slate-500 tracking-wider uppercase"
        >
          Real-Time Facial Expression Analysis System
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={item}
          className="mt-6 w-16 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
          }}
        />

        {/* Tagline */}
        <motion.p
          variants={item}
          className="mt-6 text-xs text-slate-600 max-w-xs leading-relaxed"
        >
          Biometric emotion recognition powered by client-side neural networks. No data leaves your device.
        </motion.p>

        {/* Pulse button */}
        <motion.button
          variants={item}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="relative mt-10 px-10 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-[0.15em] text-[#0d0e12] bg-[#22c55e] cursor-pointer animate-pulse-glow transition-all duration-300"
        >
          <span className="relative z-10">Initialize System</span>
          <div
            className="absolute inset-0 rounded-xl opacity-20"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
            }}
          />
        </motion.button>

        {/* Status line */}
        <motion.div
          variants={item}
          className="mt-8 flex items-center gap-2 text-[10px] text-slate-700 tracking-widest uppercase"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          System Standby
        </motion.div>
      </motion.div>
    </div>
  )
}
