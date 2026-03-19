import { CARD_DEFS } from './cards.js'

export const BOOSTER_PACKS = [
  {
    id: 'rift_shard',
    name: 'Rift Shard Pack',
    emoji: '📦',
    cost: 30,
    cardCount: 3,
    guarantees: [{ minTier: 2, count: 1 }],
    tierWeights: { 1: 40, 2: 30, 3: 15, 4: 10, 5: 5 },
    color: '#00ffff',
    description: '3 cards. At least 1 uncommon+.',
  },
  {
    id: 'void_core',
    name: 'Void Core Pack',
    emoji: '🔮',
    cost: 75,
    cardCount: 5,
    guarantees: [{ minTier: 4, count: 1 }, { minTier: 2, count: 2 }],
    tierWeights: { 1: 20, 2: 25, 3: 25, 4: 18, 5: 10, 6: 2 },
    color: '#bb44ff',
    description: '5 cards. Guaranteed rare+.',
  },
  {
    id: 'stellar',
    name: 'Stellar Pack',
    emoji: '🌟',
    cost: 150,
    cardCount: 5,
    guarantees: [{ minTier: 6, count: 1 }, { minTier: 4, count: 2 }],
    tierWeights: { 2: 10, 3: 20, 4: 25, 5: 22, 6: 15, 7: 6, 8: 2 },
    color: '#ffaa00',
    description: '5 cards. Guaranteed epic+.',
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    emoji: '⭐',
    cost: 300,
    cardCount: 7,
    guarantees: [{ minTier: 8, count: 1 }, { minTier: 6, count: 2 }],
    tierWeights: { 3: 8, 4: 15, 5: 20, 6: 22, 7: 18, 8: 10, 9: 5, 10: 2 },
    color: '#ff8800',
    description: '7 cards. Guaranteed legendary+.',
  },
]

function weightedRandomTier(weights) {
  const entries = Object.entries(weights).map(([t, w]) => [Number(t), w])
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = Math.random() * total
  for (const [tier, weight] of entries) {
    roll -= weight
    if (roll <= 0) return tier
  }
  return entries[entries.length - 1][0]
}

function randomCardMinTier(minTier) {
  const pool = CARD_DEFS.filter(c => c.tier >= minTier)
  if (pool.length === 0) return CARD_DEFS[Math.floor(Math.random() * CARD_DEFS.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

function randomCardFromTier(tier) {
  let pool = CARD_DEFS.filter(c => c.tier === tier)
  if (pool.length === 0) pool = CARD_DEFS.filter(c => c.tier >= tier)
  if (pool.length === 0) pool = CARD_DEFS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function rollPack(packDef) {
  const cards = []

  // Fill guaranteed slots first (highest tier requirement first)
  const guarantees = [...packDef.guarantees].sort((a, b) => b.minTier - a.minTier)
  for (const g of guarantees) {
    const needed = g.count - cards.filter(c => c.tier >= g.minTier).length
    for (let i = 0; i < needed && cards.length < packDef.cardCount; i++) {
      cards.push(randomCardMinTier(g.minTier))
    }
  }

  // Fill remaining with weighted random
  while (cards.length < packDef.cardCount) {
    const tier = weightedRandomTier(packDef.tierWeights)
    cards.push(randomCardFromTier(tier))
  }

  // Sort by tier ascending — best cards revealed last
  cards.sort((a, b) => a.tier - b.tier)

  return cards
}
