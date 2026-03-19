// Card-game perks — chosen at the end of each level
export const PERKS = [
  {
    id: 'power_core',
    name: 'Power Core',
    desc: '+1 ATK to all cards you play',
    effect: 'atk',
    value: 1,
  },
  {
    id: 'armor_plating',
    name: 'Armor Plating',
    desc: 'Hero takes -1 damage from all attacks',
    effect: 'defense',
    value: 1,
  },
  {
    id: 'void_shield',
    name: 'Void Shield',
    desc: '+10 max hero HP',
    effect: 'max_hp',
    value: 10,
  },
  {
    id: 'vampiric',
    name: 'Vampiric',
    desc: 'Heal 1 hero HP when a friendly card destroys an enemy',
    effect: 'lifesteal',
    value: true,
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    desc: '+20 max hero HP',
    effect: 'max_hp',
    value: 20,
  },
  {
    id: 'overclock',
    name: 'Overclock',
    desc: '+2 ATK to all cards you play',
    effect: 'atk',
    value: 2,
  },
  {
    id: 'spell_power',
    name: 'Spell Power',
    desc: 'Your spells deal +2 extra damage',
    effect: 'spell_dmg',
    value: 2,
  },
  {
    id: 'titan_core',
    name: 'Titan Core',
    desc: '+30 max HP, hero takes -2 damage',
    effect: 'combo_tank',
    max_hp: 30,
    defense: 2,
  },
  {
    id: 'tactician',
    name: 'Tactician',
    desc: 'Draw 1 extra card each turn',
    effect: 'extra_draw',
    value: 1,
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    desc: '+3 ATK to all cards, -10 max HP',
    effect: 'combo_cannon',
    atk: 3,
    hp_penalty: 10,
  },
  {
    id: 'war_cry',
    name: 'War Cry',
    desc: '+1 ATK, +5 max HP',
    effect: 'combo_dmg',
    atk: 1,
    max_hp: 5,
  },
  {
    id: 'nano_repair',
    name: 'Nano Repair',
    desc: 'Heal 10 HP now',
    effect: 'heal',
    value: 10,
  },
]

export function getRandomPerks(count = 3, excludeIds = []) {
  const available = PERKS.filter(p => !excludeIds.includes(p.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
