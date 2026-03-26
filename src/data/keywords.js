// Keyword definitions for the Rift card game

export const KEYWORDS = {
  taunt: { name: 'Taunt', icon: '🛡', desc: 'Enemies must attack this card first', type: 'flag' },
  rush: { name: 'Rush', icon: '⚡', desc: 'Can attack immediately', type: 'flag' },
  shield: { name: 'Shield', icon: '🔰', desc: 'Ignores the first instance of damage', type: 'flag' },
  lifesteal: { name: 'Lifesteal', icon: '🩸', desc: 'Heals owner for damage dealt', type: 'flag' },
  battlecry: { name: 'Battlecry', icon: '📯', desc: 'Effect triggers when played', type: 'effect' },
  deathrattle: { name: 'Deathrattle', icon: '💀', desc: 'Effect triggers when destroyed', type: 'effect' },
}

export function getKeyword(id) {
  return KEYWORDS[id] || null
}
