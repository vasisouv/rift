export const PERKS = [
  {
    id: 'swift_strike',
    name: 'Swift Strike',
    desc: '+10% crit chance, +10% damage',
    critBonus: 0.10,
    damageMultiplier: 1.10,
  },
  {
    id: 'power_core',
    name: 'Power Core',
    desc: '+25% damage',
    damageMultiplier: 1.25,
  },
  {
    id: 'armor_plating',
    name: 'Armor Plating',
    desc: '+5 defense',
    defenseBonus: 5,
  },
  {
    id: 'vampiric',
    name: 'Vampiric',
    desc: '15% lifesteal on hit',
    lifeSteal: 0.15,
  },
  {
    id: 'void_shield',
    name: 'Void Shield',
    desc: '+25 max HP',
    maxHpBonus: 25,
  },
  {
    id: 'overclock',
    name: 'Overclock',
    desc: '+40% damage',
    damageMultiplier: 1.4,
  },
  {
    id: 'berserker',
    name: 'Berserker',
    desc: '+50% damage when below 50% HP',
    berserker: true,
  },
  {
    id: 'energy_surge',
    name: 'Energy Surge',
    desc: '+50% energy from kills',
    energyMultiplier: 1.5,
  },
  {
    id: 'double_shot',
    name: 'Double Shot',
    desc: 'Attack twice per action',
    doubleShot: true,
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    desc: '+30 max HP, +3 defense',
    maxHpBonus: 30,
    defenseBonus: 3,
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    desc: '+60% damage, -20 max HP',
    damageMultiplier: 1.6,
    maxHpPenalty: 20,
  },
  {
    id: 'phase_shot',
    name: 'Phase Shot',
    desc: '+15% crit chance',
    critBonus: 0.15,
  },
  {
    id: 'void_leech',
    name: 'Void Leech',
    desc: '25% lifesteal, -10% damage',
    lifeSteal: 0.25,
    damageMultiplier: 0.9,
  },
  {
    id: 'full_auto',
    name: 'Full Auto',
    desc: '+20% damage, +5% crit',
    damageMultiplier: 1.2,
    critBonus: 0.05,
  },
  {
    id: 'titan_core',
    name: 'Titan Core',
    desc: '+50 max HP, +8 defense',
    maxHpBonus: 50,
    defenseBonus: 8,
  },
]

export function getRandomPerks(count = 3, excludeIds = []) {
  const available = PERKS.filter(p => !excludeIds.includes(p.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
