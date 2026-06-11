const EMOTIONS = ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral']

const PASTEL_PALETTE = [
  { name: 'Happy',     color: '#facc15', track: 'rgba(250,204,21,0.12)' },
  { name: 'Sad',       color: '#60a5fa', track: 'rgba(96,165,250,0.12)' },
  { name: 'Angry',     color: '#f87171', track: 'rgba(248,113,113,0.12)' },
  { name: 'Surprised', color: '#c084fc', track: 'rgba(192,132,252,0.12)' },
  { name: 'Neutral',   color: '#94a3b8', track: 'rgba(148,163,184,0.12)' },
]

function randomBetween(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

function softShift(current, minShift = -8, maxShift = 8) {
  const delta = randomBetween(minShift, maxShift)
  return Math.max(0, Math.min(100, Math.round((current + delta) * 10) / 10))
}

export function getPalette() {
  return PASTEL_PALETTE
}

export function getEmotionNames() {
  return EMOTIONS
}

export function generateMockEmotions(prev) {
  if (!prev) {
    const values = EMOTIONS.map(() => randomBetween(0, 100))
    const sum = values.reduce((a, b) => a + b, 0)
    const normalized = values.map((v) => Math.round((v / sum) * 1000) / 10)
    const result = {}
    EMOTIONS.forEach((name, i) => {
      result[name] = normalized[i]
    })
    return result
  }

  const raw = EMOTIONS.map((name) => softShift(prev[name]))
  const sum = raw.reduce((a, b) => a + b, 0)
  const result = {}
  EMOTIONS.forEach((name, i) => {
    result[name] = Math.round((raw[i] / sum) * 1000) / 10
  })
  return result
}

export function getDominantEmotion(emotions) {
  if (!emotions) return { name: 'Neutral', value: 0 }
  const entries = Object.entries(emotions)
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b))
  return { name: max[0], value: max[1] }
}
