import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLogOut, FiArrowLeft, FiTrash2, FiImage, FiUser, FiCalendar } from 'react-icons/fi'
import { supabase } from '../lib/supabase'

export default function AdminPanel({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) setSession(s)
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) {
      setError(authError.message)
    } else {
      setSession(data.session)
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setSessions([])
  }

  const fetchSessions = async () => {
    if (!session) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSessions(data || [])
      data?.forEach((s) => {
        if (s.image_url) {
          const fileName = s.image_url.split('/').pop()
          supabase.storage
            .from('session-images')
            .createSignedUrl(fileName, 3600)
            .then(({ data: signed }) => {
              if (signed?.signedUrl) {
                setImageUrls((prev) => ({ ...prev, [s.id]: signed.signedUrl }))
              }
            })
        }
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (session) fetchSessions()
  }, [session])

  const handleDelete = async (id) => {
    const { error: delError } = await supabase.from('sessions').delete().eq('id', id)
    if (delError) {
      setError(delError.message)
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="text-center">
              <h1 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">
                Admin Login
              </h1>
              <p className="text-[10px] text-slate-600 mt-1">
                Sign in to view session data
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/60 border border-slate-700/50 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#22c55e]/40 transition-colors"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/60 border border-slate-700/50 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[#22c55e]/40 transition-colors"
              />

              {error && (
                <p className="text-[11px] text-red-400 text-center">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={authLoading}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/30 transition-all disabled:opacity-30"
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <button
              onClick={onBack}
              className="w-full text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Back to app
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0e12]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0d0e12]/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-300 transition-colors">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-slate-500 tracking-wider uppercase">
            {loading ? 'Loading...' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
          </h2>
          <button
            onClick={fetchSessions}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-wider"
          >
            Refresh
          </button>
        </div>

        {sessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xs text-slate-600">No sessions yet</p>
          </div>
        )}

        <AnimatePresence>
          {sessions.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass rounded-xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-40 h-40 bg-slate-800/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {imageUrls[s.id] ? (
                    <img
                      src={imageUrls[s.id]}
                      alt="Session"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiImage size={24} className="text-slate-700" />
                  )}
                </div>

                {/* Data */}
                <div className="flex-1 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiUser size={12} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-300">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={12} className="text-slate-600" />
                    <span className="text-[11px] text-slate-500">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#22c55e]/10 text-[11px] text-[#22c55e]">
                    {s.dominant_emotion}
                    <span className="text-[10px] text-slate-600">
                      {Math.round(s.dominant_value)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.emotions_snapshot &&
                      Object.entries(s.emotions_snapshot).map(([key, val]) => (
                        <span
                          key={key}
                          className="text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded"
                        >
                          {key}: {Math.round(val)}%
                        </span>
                      ))}
                  </div>
                </div>

                {/* Delete */}
                <div className="p-2 flex sm:flex-col items-start sm:justify-start">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
