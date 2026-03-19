import { defineStore } from 'pinia'

let _ctx = null

function ac() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone({ freq = 440, type = 'sine', vol = 0.3, start = 0, dur = 0.1, freqEnd = null, dest = null }) {
  const c = ac()
  const now = c.currentTime
  const g = c.createGain()
  g.gain.setValueAtTime(vol, now + start)
  g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
  g.connect(dest ?? c.destination)
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, now + start)
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, now + start + dur)
  o.connect(g)
  o.start(now + start)
  o.stop(now + start + dur + 0.05)
}

function noise({ vol = 0.2, start = 0, dur = 0.1, bandFreq = null, q = 1, dest = null }) {
  const c = ac()
  const now = c.currentTime
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const g = c.createGain()
  g.gain.setValueAtTime(vol, now + start)
  g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
  const out = dest ?? c.destination
  if (bandFreq) {
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = bandFreq
    f.Q.value = q
    src.connect(f)
    f.connect(g)
  } else {
    src.connect(g)
  }
  g.connect(out)
  src.start(now + start)
  src.stop(now + start + dur + 0.05)
}

export const useSoundStore = defineStore('sound', {
  state: () => ({ muted: false }),

  actions: {
    play(fn) {
      if (this.muted) return
      try { fn() } catch (_) {}
    },

    // No-ops kept so combat.js calls like startMusic/stopMusic don't throw
    startMusic() {},
    stopMusic() {},

    attack() {
      this.play(() => {
        tone({ freq: 520, freqEnd: 380, type: 'sine', vol: 0.07, dur: 0.055 })
      })
    },

    crit() {
      this.play(() => {
        tone({ freq: 1400, freqEnd: 1000, type: 'sine', vol: 0.22, dur: 0.12 })
        tone({ freq: 2800, freqEnd: 2000, type: 'sine', vol: 0.08, dur: 0.1 })
      })
    },

    enemyHit() {
      this.play(() => {
        tone({ freq: 180, freqEnd: 70, type: 'sine', vol: 0.35, dur: 0.15 })
        noise({ vol: 0.12, dur: 0.08 })
      })
    },

    enemyDeath() {
      this.play(() => {
        noise({ vol: 0.28, dur: 0.18 })
        tone({ freq: 280, freqEnd: 55, type: 'sine', vol: 0.28, dur: 0.28 })
      })
    },

    bossDeath() {
      this.play(() => {
        noise({ vol: 0.35, dur: 0.35 })
        tone({ freq: 200, freqEnd: 400, type: 'sine', vol: 0.35, dur: 0.12 })
        tone({ freq: 300, freqEnd: 600, type: 'sine', vol: 0.3,  start: 0.12, dur: 0.18 })
        tone({ freq: 500, freqEnd: 900, type: 'sine', vol: 0.25, start: 0.3,  dur: 0.45 })
      })
    },

    playerDeath() {
      this.play(() => {
        tone({ freq: 440, freqEnd: 220, type: 'sine', vol: 0.38, dur: 0.35 })
        tone({ freq: 330, freqEnd: 165, type: 'sine', vol: 0.32, start: 0.3,  dur: 0.45 })
        tone({ freq: 220, freqEnd: 80,  type: 'sine', vol: 0.28, start: 0.7,  dur: 0.7  })
      })
    },

    buy() {
      this.play(() => {
        tone({ freq: 523, type: 'sine', vol: 0.18, dur: 0.1 })
        tone({ freq: 659, type: 'sine', vol: 0.15, start: 0.1, dur: 0.12 })
      })
    },

    perk() {
      this.play(() => {
        ;[261, 329, 392, 523].forEach((f, i) => {
          tone({ freq: f, type: 'sine', vol: 0.18, start: i * 0.07, dur: 0.18 })
        })
      })
    },

    cardPlay() {
      this.play(() => {
        tone({ freq: 320, freqEnd: 480, type: 'triangle', vol: 0.14, dur: 0.12 })
        noise({ vol: 0.06, dur: 0.06, bandFreq: 1800, q: 2 })
      })
    },

    spellCast() {
      this.play(() => {
        tone({ freq: 600, freqEnd: 1200, type: 'sine', vol: 0.18, dur: 0.15 })
        tone({ freq: 800, freqEnd: 400, type: 'sine', vol: 0.12, start: 0.1, dur: 0.2 })
        noise({ vol: 0.08, dur: 0.1, bandFreq: 3000, q: 2 })
      })
    },

    turnEnd() {
      this.play(() => {
        tone({ freq: 440, freqEnd: 330, type: 'sine', vol: 0.12, dur: 0.18 })
        tone({ freq: 220, type: 'sine', vol: 0.08, start: 0.15, dur: 0.12 })
      })
    },

    packOpen() {
      this.play(() => {
        noise({ vol: 0.3, dur: 0.25, bandFreq: 2000, q: 0.5 })
        tone({ freq: 300, freqEnd: 800, type: 'sine', vol: 0.25, dur: 0.3 })
        tone({ freq: 400, freqEnd: 1200, type: 'sine', vol: 0.2, start: 0.1, dur: 0.25 })
      })
    },

    cardReveal(tier = 1) {
      this.play(() => {
        const f = 400 + tier * 80
        tone({ freq: f, freqEnd: f * 1.5, type: 'sine', vol: 0.15, dur: 0.15 })
        if (tier >= 7) {
          tone({ freq: f * 1.5, type: 'sine', vol: 0.12, start: 0.1, dur: 0.25 })
          tone({ freq: f * 2, type: 'sine', vol: 0.1, start: 0.2, dur: 0.3 })
        }
      })
    },
  },
})
