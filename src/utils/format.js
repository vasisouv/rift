const SUFFIXES = [
  { value: 1e12, symbol: 'T' },
  { value: 1e9,  symbol: 'B' },
  { value: 1e6,  symbol: 'M' },
  { value: 1e3,  symbol: 'K' },
]

function formatNumber(n) {
  if (!isFinite(n) || n < 0) return '0'
  if (n >= 1e15) {
    return n.toExponential(2)
  }
  for (const { value, symbol } of SUFFIXES) {
    if (n >= value) {
      return (n / value).toFixed(2) + symbol
    }
  }
  return n.toFixed(n < 1 ? 2 : 0)
}

export function formatEnergy(n) {
  return formatNumber(n) + ' W'
}

export function formatRate(n) {
  return formatNumber(n) + ' W/s'
}

export function formatCost(n) {
  return formatNumber(n)
}
