export default function ScannerOverlay({ children }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Holographic corner brackets */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Top-left */}
        <path d="M8 4 H4 V12" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M4 8 V4 H8" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3" />
        {/* Top-right */}
        <path d="M92 4 H96 V12" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M96 8 V4 H92" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3" />
        {/* Bottom-left */}
        <path d="M8 96 H4 V88" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M4 92 V96 H8" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3" />
        {/* Bottom-right */}
        <path d="M92 96 H96 V88" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M96 92 V96 H92" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3" />
        {/* Crosshair lines */}
        <line x1="50" y1="35" x2="50" y2="65" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />
        <line x1="35" y1="50" x2="65" y2="50" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />
        {/* Outer ring glow */}
        <circle cx="50" cy="50" r="28" stroke="#22c55e" strokeWidth="0.8" fill="none" opacity="0.15" />
        <circle cx="50" cy="50" r="30" stroke="#22c55e" strokeWidth="0.3" fill="none" opacity="0.08" />
      </svg>

      {/* Scanning laser line */}
      <div className="absolute left-[10%] right-[10%] h-[2px] pointer-events-none animate-scan z-10">
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.8) 30%, #22c55e 50%, rgba(34,197,94,0.8) 70%, transparent 100%)',
            boxShadow: '0 0 12px rgba(34,197,94,0.6), 0 0 24px rgba(34,197,94,0.3)',
          }}
        />
      </div>

      {/* Children (webcam placeholder, etc.) */}
      {children}
    </div>
  )
}
