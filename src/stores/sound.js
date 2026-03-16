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

// ── Music ─────────────────────────────────────────────────────────────────────

const BPM     = 85
const BEAT    = 60 / BPM          // ~0.706s
const PATTERN = BEAT * 32         // 32-beat loop (~22s)
const AHEAD   = 0.1               // schedule 100ms before loop end

// A minor pentatonic: A2 C3 D3 E3 G3 A3
const SCALE = [110, 130.8, 146.8, 164.8, 196, 220]

let _masterGain = null
let _scheduler  = null
let _bossMode   = false

// Schedule a single bass note
function bassNote(t, freq, out, vol = 0.2) {
  const c   = ac()
  const dur = BEAT * 0.75
  const g   = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  g.connect(out)
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  o.connect(g)
  o.start(t)
  o.stop(t + dur + 0.05)
}

// Schedule a pad chord
function padChord(t, freqs, out, vol = 0.035, cutoff = 650) {
  const c   = ac()
  const dur = BEAT * 3.6
  freqs.forEach(freq => {
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.15)
    g.gain.setValueAtTime(vol, t + dur - 0.2)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    const filt = c.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.value = cutoff
    filt.Q.value = 0.8
    g.connect(filt)
    filt.connect(out)
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = freq
    o.connect(g)
    o.start(t)
    o.stop(t + dur + 0.05)
  })
}

// Schedule a triangle arp note
function arpNote(t, freq, out, vol = 0.055, durBeats = 0.55) {
  const c   = ac()
  const dur = BEAT * durBeats
  const g   = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  g.connect(out)
  const o = c.createOscillator()
  o.type = 'triangle'
  o.frequency.value = freq
  o.connect(g)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function schedulePattern(startTime, out, boss) {
  const bv = boss ? 0.28 : 0.2   // bass vol
  const pv = boss ? 0.05 : 0.035 // pad vol
  const pc = boss ? 900  : 650   // pad cutoff

  // 32-beat loop split into four 8-beat sections (A B A' C)
  for (let section = 0; section < 4; section++) {
    const s = startTime + section * 8 * BEAT

    // ── Bass line ────────────────────────────────────────────────────────────
    // Section A (0,2): root heavy pattern
    // Section B (1):   lower movement
    // Section C (3):   building tension
    const bassPatterns = [
      [55, null, 55, 41.2, null, 55, 49,   null],  // A
      [41.2, null, 49, 41.2, null, 36.7, 41.2, null], // B — lower
      [55, null, 55, 41.2, null, 55, 49,   null],  // A'
      [55, 49, null, 55, 41.2, 49, null,   55],    // C — busier
    ]
    bassPatterns[section].forEach((freq, i) => {
      if (!freq) return
      bassNote(s + i * BEAT, freq, out, bv)
    })

    // ── Pad chords (one per 4 beats, two per section) ────────────────────────
    const padSequence = [
      [[SCALE[0], SCALE[2], SCALE[5]], [SCALE[0], SCALE[2], SCALE[5]]],           // Am Am
      [[SCALE[0], SCALE[1], SCALE[4]], [SCALE[0], SCALE[2], SCALE[4]]],           // Am(add9) Am
      [[SCALE[0], SCALE[2], SCALE[5]], [SCALE[0], SCALE[3], SCALE[5]]],           // Am Am(add4)
      [[SCALE[0], SCALE[2], SCALE[4], SCALE[5]], [SCALE[0], SCALE[2], SCALE[5]]], // Am7 Am
    ]
    padSequence[section].forEach((chord, ci) => {
      const fullChord = boss ? [...chord, chord[chord.length - 1] * 2] : chord
      padChord(s + ci * 4 * BEAT, fullChord, out, pv, pc)
    })

    // ── Arp ──────────────────────────────────────────────────────────────────
    if (boss) {
      // 16th-note arp, pattern shifts each section
      const arpSeqs = [
        [220, 261.6, 293.7, 329.6, 392,   329.6, 293.7, 261.6],
        [196, 220,   261.6, 293.7, 329.6, 293.7, 261.6, 220  ],
        [220, 293.7, 329.6, 392,   440,   392,   329.6, 293.7],
        [261.6, 329.6, 392, 440, 392, 329.6, 261.6, 220      ],
      ]
      arpSeqs[section].forEach((freq, i) => {
        arpNote(s + i * (BEAT / 2), freq, out, 0.07, 0.38)
      })
    } else {
      // Sparse arp — different notes/beats per section
      const arpSeqs = [
        [[2, SCALE[5]], [5, SCALE[3]], [7, SCALE[4]]],
        [[1, SCALE[4]], [4, SCALE[5]], [6, SCALE[3]]],
        [[2, SCALE[5]], [5, SCALE[4]], [7, SCALE[3]]],
        [[0, SCALE[3]], [3, SCALE[5]], [5, SCALE[4]], [7, SCALE[5]]],
      ]
      arpSeqs[section].forEach(([beat, freq]) => {
        arpNote(s + beat * BEAT, freq, out)
      })
    }
  }
}

function _startMusicLoop(boss) {
  _stopMusicLoop()
  _bossMode = boss

  const c       = ac()
  _masterGain   = c.createGain()
  _masterGain.gain.setValueAtTime(0, c.currentTime)
  _masterGain.gain.linearRampToValueAtTime(1, c.currentTime + 1.5)
  _masterGain.connect(c.destination)

  const loop = () => {
    schedulePattern(ac().currentTime, _masterGain, _bossMode)
    _scheduler = setTimeout(loop, (PATTERN - AHEAD) * 1000)
  }
  loop()
}

function _stopMusicLoop() {
  if (_scheduler) { clearTimeout(_scheduler); _scheduler = null }
  if (_masterGain) {
    const g = _masterGain
    try {
      g.gain.setValueAtTime(g.gain.value, ac().currentTime)
      g.gain.linearRampToValueAtTime(0, ac().currentTime + 1.2)
    } catch (_) {}
    _masterGain = null
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSoundStore = defineStore('sound', {
  state: () => ({ muted: false }),

  actions: {
    play(fn) {
      if (this.muted) return
      try { fn() } catch (_) {}
    },

    // ── Music ────────────────────────────────────────────────────────────────

    startMusic(boss = false) {
      if (this.muted) return
      try { _startMusicLoop(boss) } catch (_) {}
    },

    stopMusic() {
      try { _stopMusicLoop() } catch (_) {}
    },

    // ── SFX ──────────────────────────────────────────────────────────────────

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

    power() {
      this.play(() => {
        tone({ freq: 120, freqEnd: 40, type: 'sine', vol: 0.45, dur: 0.35 })
        noise({ vol: 0.25, dur: 0.25, bandFreq: 250, q: 0.5 })
        tone({ freq: 600, freqEnd: 200, type: 'sawtooth', vol: 0.15, dur: 0.2 })
      })
    },

    guard() {
      this.play(() => {
        noise({ vol: 0.2, dur: 0.12, bandFreq: 1200, q: 6 })
        tone({ freq: 380, freqEnd: 460, type: 'triangle', vol: 0.18, dur: 0.2 })
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

    bossSpawn() {
      this.play(() => {
        tone({ freq: 80, freqEnd: 130, type: 'sawtooth', vol: 0.28, dur: 0.5 })
        noise({ vol: 0.18, dur: 0.5, bandFreq: 120, q: 0.5 })
      })
    },

    burn() {
      this.play(() => {
        noise({ vol: 0.1, dur: 0.08, bandFreq: 2500, q: 1.5 })
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
  },
})
