import { defineStore } from 'pinia'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    hp: 100,
    maxHp: 100,
    level: 1,
    kills: 0,
    energy: 0,
    selectedGun: null,

    // Cumulative stat bonuses (applied from perks + shop items)
    damageMultiplier: 1.0,
    defenseBonus: 0,
    lifeSteal: 0,
    energyMultiplier: 1.0,
    critBonus: 0,
    berserker: false,
    doubleShot: false,
    isGuarding: false,

    // For display / serialization
    equippedPerkIds: [],
    shopItemIds: [],
  }),

  getters: {
    totalAttack(state) {
      if (!state.selectedGun) return 0
      let dmg = state.selectedGun.damage * state.damageMultiplier
      if (state.berserker && state.hp < state.maxHp * 0.5) dmg *= 1.5
      return Math.max(1, Math.round(dmg))
    },

    isLowHp(state) {
      return state.hp < state.maxHp * 0.3
    },

    hpPercent(state) {
      return state.maxHp > 0 ? Math.round((state.hp / state.maxHp) * 100) : 0
    },
  },

  actions: {
    selectGun(gun) {
      this.selectedGun = { ...gun }
    },

    takeDamage(rawDamage) {
      let atk = rawDamage
      if (this.isGuarding) atk = Math.round(atk * 0.5)
      const dmg = Math.max(1, atk - this.defenseBonus)
      this.hp = Math.max(0, this.hp - dmg)
      return dmg
    },

    heal(amount) {
      this.hp = Math.min(this.maxHp, this.hp + amount)
    },

    gainEnergy(baseAmount) {
      this.energy += Math.round(baseAmount * this.energyMultiplier)
    },

    spendEnergy(amount) {
      if (this.energy >= amount) {
        this.energy -= amount
        return true
      }
      return false
    },

    applyPerk(perk) {
      this.equippedPerkIds.push(perk.id)
      if (perk.damageMultiplier) this.damageMultiplier *= perk.damageMultiplier
      if (perk.defenseBonus) this.defenseBonus += perk.defenseBonus
      if (perk.lifeSteal) this.lifeSteal = Math.min(0.5, this.lifeSteal + perk.lifeSteal)
      if (perk.energyMultiplier) this.energyMultiplier *= perk.energyMultiplier
      if (perk.critBonus) this.critBonus = Math.min(0.8, this.critBonus + perk.critBonus)
      if (perk.berserker) this.berserker = true
      if (perk.doubleShot) this.doubleShot = true
      if (perk.maxHpBonus) {
        this.maxHp += perk.maxHpBonus
        this.hp += perk.maxHpBonus
      }
      if (perk.maxHpPenalty) {
        this.maxHp = Math.max(10, this.maxHp - perk.maxHpPenalty)
        this.hp = Math.min(this.hp, this.maxHp)
      }
    },

    applyShopItem(item) {
      this.shopItemIds.push(item.id)
      if (item.healAmount) this.heal(item.healAmount)
      if (item.fullHeal) this.hp = this.maxHp
      if (item.damageMultiplier) this.damageMultiplier *= item.damageMultiplier
      if (item.defenseBonus) this.defenseBonus += item.defenseBonus
      if (item.critBonus) this.critBonus = Math.min(0.8, this.critBonus + item.critBonus)
      if (item.maxHpBonus) {
        this.maxHp += item.maxHpBonus
        this.hp += item.maxHpBonus
      }
      if (item.gainEnergy) this.energy += item.gainEnergy
    },

    advanceLevel() {
      this.level++
    },

    addKill() {
      this.kills++
    },

    resetForRun() {
      this.hp = 100
      this.maxHp = 100
      this.level = 1
      this.kills = 0
      this.energy = 0
      this.selectedGun = null
      this.damageMultiplier = 1.0
      this.defenseBonus = 0
      this.lifeSteal = 0
      this.energyMultiplier = 1.0
      this.critBonus = 0
      this.berserker = false
      this.doubleShot = false
      this.isGuarding = false
      this.equippedPerkIds = []
      this.shopItemIds = []
    },
  },
})
