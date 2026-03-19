/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}',
  ],
  theme: {
    extend: {
      colors: {
        void:    '#04060f',
        surface: '#080d1c',
        energy:  '#00ffff',
        rate:    '#b464ff',
        gold:    '#ffc832',
        dim:     '#5a6080',
        hp:      '#ff4444',
        xp:      '#44ff88',
        boss:    '#ff8800',
        'r-common':    '#aaaaaa',
        'r-uncommon':  '#44ff88',
        'r-rare':      '#4488ff',
        'r-epic':      '#bb44ff',
        'r-legendary': '#ff8800',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
