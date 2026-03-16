// Card definitions for the Rift card game
// Each card has: id, name, emoji, baseAtk, baseHp, manaCost, color, tier, description

export const CARD_DEFS = [
  // Tier 1 — Cost 1
  {
    id: 'void_drone',
    name: 'Void Drone',
    emoji: '🤖',
    baseAtk: 1,
    baseHp: 2,
    manaCost: 1,
    color: '#00ffff',
    tier: 1,
    description: 'A weak scout unit.',
  },
  {
    id: 'glitch_imp',
    name: 'Glitch Imp',
    emoji: '👾',
    baseAtk: 2,
    baseHp: 1,
    manaCost: 1,
    color: '#aa88ff',
    tier: 1,
    description: 'Fast but fragile.',
  },

  // Tier 2 — Cost 2
  {
    id: 'specter',
    name: 'Specter',
    emoji: '👻',
    baseAtk: 2,
    baseHp: 3,
    manaCost: 2,
    color: '#cc88ff',
    tier: 2,
    description: 'A ghostly attacker.',
  },
  {
    id: 'nano_blade',
    name: 'Nano Blade',
    emoji: '🗡️',
    baseAtk: 3,
    baseHp: 2,
    manaCost: 2,
    color: '#00ddff',
    tier: 2,
    description: 'Sharp and precise.',
  },

  // Tier 3 — Cost 3
  {
    id: 'crusher',
    name: 'Crusher',
    emoji: '🦾',
    baseAtk: 3,
    baseHp: 4,
    manaCost: 3,
    color: '#ff8800',
    tier: 3,
    description: 'Heavily armored brawler.',
  },
  {
    id: 'void_mage',
    name: 'Void Mage',
    emoji: '🧙',
    baseAtk: 4,
    baseHp: 3,
    manaCost: 3,
    color: '#bb44ff',
    tier: 3,
    description: 'Channels void energy.',
  },

  // Tier 4 — Cost 4
  {
    id: 'phantom',
    name: 'Phantom',
    emoji: '🌀',
    baseAtk: 4,
    baseHp: 5,
    manaCost: 4,
    color: '#ff44bb',
    tier: 4,
    description: 'Hard to pin down.',
  },
  {
    id: 'rift_blade',
    name: 'Rift Blade',
    emoji: '⚔️',
    baseAtk: 5,
    baseHp: 4,
    manaCost: 4,
    color: '#ffcc00',
    tier: 4,
    description: 'Cuts through dimensions.',
  },

  // Tier 5 — Cost 5
  {
    id: 'sentinel',
    name: 'Sentinel',
    emoji: '🛡️',
    baseAtk: 5,
    baseHp: 6,
    manaCost: 5,
    color: '#44ff88',
    tier: 5,
    description: 'A resilient guardian.',
  },
  {
    id: 'ravager',
    name: 'Ravager',
    emoji: '🐉',
    baseAtk: 6,
    baseHp: 5,
    manaCost: 5,
    color: '#ffdd00',
    tier: 5,
    description: 'Devastating offense.',
  },

  // Tier 6 — Cost 6
  {
    id: 'nebula_titan',
    name: 'Nebula Titan',
    emoji: '🌌',
    baseAtk: 6,
    baseHp: 7,
    manaCost: 6,
    color: '#8844ff',
    tier: 6,
    description: 'Born from a dying star.',
  },
  {
    id: 'stellar_horror',
    name: 'Stellar Horror',
    emoji: '☄️',
    baseAtk: 7,
    baseHp: 5,
    manaCost: 6,
    color: '#ffaa00',
    tier: 6,
    description: 'A terror from the deep void.',
  },

  // Tier 7 — Cost 7
  {
    id: 'void_sovereign',
    name: 'Void Sovereign',
    emoji: '👑',
    baseAtk: 7,
    baseHp: 8,
    manaCost: 7,
    color: '#ff44ff',
    tier: 7,
    description: 'Ruler of the void realm.',
  },
  {
    id: 'colossus',
    name: 'Colossus',
    emoji: '🗿',
    baseAtk: 8,
    baseHp: 6,
    manaCost: 7,
    color: '#ff4444',
    tier: 7,
    description: 'Unstoppable force of destruction.',
  },
]

export function getCardDef(id) {
  return CARD_DEFS.find(c => c.id === id)
}

// Player starts with tier 1-2 cards
export function getStartingDeck() {
  return [
    'void_drone', 'void_drone', 'void_drone',
    'glitch_imp', 'glitch_imp',
    'specter', 'specter',
    'nano_blade',
  ]
}

// Enemy deck scales with level — higher levels unlock higher tier cards
export function buildEnemyDeck(level) {
  const maxTier = Math.min(7, Math.ceil(level / 2) + 1)
  const available = CARD_DEFS.filter(c => c.tier <= maxTier)

  // Build a deck of ~12 cards, weighted toward lower tiers
  const deck = []
  for (let i = 0; i < 12; i++) {
    // bias toward lower tier cards
    const roll = Math.random()
    let targetTier
    if (roll < 0.4) targetTier = 1
    else if (roll < 0.65) targetTier = Math.min(2, maxTier)
    else if (roll < 0.82) targetTier = Math.min(3, maxTier)
    else if (roll < 0.92) targetTier = Math.min(4, maxTier)
    else targetTier = maxTier

    const pool = available.filter(c => c.tier === targetTier)
    if (pool.length > 0) {
      deck.push(pool[Math.floor(Math.random() * pool.length)].id)
    } else {
      deck.push(available[Math.floor(Math.random() * available.length)].id)
    }
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  return deck
}
