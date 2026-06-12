import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiLock } from 'react-icons/fi'
import { useLocalStorage } from './hooks/useLocalStorage'
import SplashScreen from './components/SplashScreen'
import CalibrationScreen from './components/CalibrationScreen'
import EmotionEngine from './components/EmotionEngine'
import MoodVault from './components/MoodVault'
import AdminPanel from './components/AdminPanel'

const SCREENS = ['splash', 'calibration', 'engine', 'vault', 'admin']

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.01, filter: 'blur(4px)' },
}

const pageTransition = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1],
}

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [sessions, setSessions] = useLocalStorage('emoto-sessions', [])

  const navigate = useCallback((s) => setScreen(s), [])
  const goToSplash = useCallback(() => navigate('splash'), [navigate])
  const goToCalibration = useCallback(() => navigate('calibration'), [navigate])
  const goToEngine = useCallback(() => navigate('engine'), [navigate])
  const goToVault = useCallback(() => navigate('vault'), [navigate])
  const goToAdmin = useCallback(() => navigate('admin'), [navigate])

  const handleLogSession = useCallback(
    (entry) => setSessions((prev) => [...prev, entry]),
    [setSessions],
  )

  const handleClearSessions = useCallback(() => setSessions([]), [setSessions])

  return (
    <div className="relative min-h-screen bg-[#0d0e12]">
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div
            key="splash"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SplashScreen onStart={goToCalibration} onAdmin={goToAdmin} />
          </motion.div>
        )}

        {screen === 'calibration' && (
          <motion.div
            key="calibration"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <CalibrationScreen onComplete={goToEngine} />
          </motion.div>
        )}

        {screen === 'engine' && (
          <motion.div
            key="engine"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <EmotionEngine
              onLogSession={handleLogSession}
              onNavigateVault={goToVault}
              sessions={sessions}
            />
          </motion.div>
        )}

        {screen === 'vault' && (
          <motion.div
            key="vault"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <MoodVault
              sessions={sessions}
              onClear={handleClearSessions}
              onBack={goToEngine}
            />
          </motion.div>
        )}

        {screen === 'admin' && (
          <motion.div
            key="admin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AdminPanel onBack={goToSplash} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
