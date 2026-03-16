import { defineStore } from 'pinia'
import { META_UPGRADES, getUpgradeCost } from '../data/metaUpgrades'
import { getRandomPerks } from '../data/perks'

export const useMetaStore = defineStore('meta', {
  state: () => ({
    voidShards: 0,
    totalShardsEarned: 0,
    purchasedLevels: {}, // { upgradeId: currentLevel }
    totalRuns: 0,
  }),

  getters: {
    getLevel: (state) => (id) => state.purchasedLevels[id] ?? 0,

    getCost: () => (upgrade, currentLevel) => getUpgradeCost(upgrade, currentLevel),

    nextCost: (state) => (id) => {
      const upgrade = META_UPGRADES.find(u => u.id === id)
      if (!upgrade) return Infinity
      const lvl = state.purchasedLevels[id] ?? 0
      if (lvl >= upgrade.maxLevel) return Infinity
      return getUpgradeCost(upgrade, lvl)
    },

    // Power strike cooldown after meta upgrades (default 3, reduced by upgrade)
    powerStrikeCooldown(state) {
      const reduction = state.purchasedLevels['power_cooldown'] ?? 0
      return Math.max(1, 3 - reduction)
    },

    // All bonus values to apply at run start (card-game keys)
    startingBonuses(state) {
      return {
        maxHp:           (state.purchasedLevels['starting_hp'] ?? 0) * 20,
        extraStartCards: (state.purchasedLevels['starting_energy'] ?? 0) > 0 ? 1 : 0,
        atkBonus:        (state.purchasedLevels['damage_boost'] ?? 0),
        defense:         (state.purchasedLevels['defense_boost'] ?? 0) * 2,
        critChance:      (state.purchasedLevels['crit_boost'] ?? 0) * 0.05,
        lifestealChance: (state.purchasedLevels['lifesteal'] ?? 0) * 0.05,
        extraTier2Card:  (state.purchasedLevels['power_cooldown'] ?? 0) >= 1,
        startingPerk:    (state.purchasedLevels['starting_perk'] ?? 0) >= 1,
      }
    },

    hasAnyUpgrade(state) {
      return Object.values(state.purchasedLevels).some(v => v > 0)
    },
  },

  actions: {
    earnShards(amount) {
      this.voidShards += amount
      this.totalShardsEarned += amount
    },

    recordRun() {
      this.totalRuns++
    },

    buyUpgrade(upgradeId) {
      const upgrade = META_UPGRADES.find(u => u.id === upgradeId)
      if (!upgrade) return false
      const currentLevel = this.purchasedLevels[upgradeId] ?? 0
      if (currentLevel >= upgrade.maxLevel) return false
      const cost = getUpgradeCost(upgrade, currentLevel)
      if (this.voidShards < cost) return false
      this.voidShards -= cost
      this.purchasedLevels = { ...this.purchasedLevels, [upgradeId]: currentLevel + 1 }
      this.save()
      return true
    },

    // Apply all meta bonuses to the character store for a new run
    applyToCharacter(char) {
      const b = this.startingBonuses
      if (b.maxHpBonus > 0) {
        char.maxHp += b.maxHpBonus
        char.hp += b.maxHpBonus
      }
      if (b.startingEnergy > 0) char.energy += b.startingEnergy
      if (b.damageMultiplier > 1) char.damageMultiplier *= b.damageMultiplier
      if (b.defenseBonus > 0) char.defenseBonus += b.defenseBonus
      if (b.critBonus > 0) char.critBonus = Math.min(0.8, char.critBonus + b.critBonus)
      if (b.lifeSteal > 0) char.lifeSteal = Math.min(0.5, char.lifeSteal + b.lifeSteal)
      if (b.startingPerk) {
        const perks = getRandomPerks(1, char.equippedPerkIds)
        if (perks.length > 0) char.applyPerk(perks[0])
      }
    },

    save() {
      localStorage.setItem('void_harvest_meta_v1', JSON.stringify({
        version: 1,
        voidShards: this.voidShards,
        totalShardsEarned: this.totalShardsEarned,
        purchasedLevels: { ...this.purchasedLevels },
        totalRuns: this.totalRuns,
      }))
    },

    load() {
      try {
        const raw = localStorage.getItem('void_harvest_meta_v1')
        if (!raw) return
        const data = JSON.parse(raw)
        if (data.version !== 1) return
        this.voidShards = data.voidShards ?? 0
        this.totalShardsEarned = data.totalShardsEarned ?? 0
        this.purchasedLevels = data.purchasedLevels ?? {}
        this.totalRuns = data.totalRuns ?? 0
      } catch (e) {
        console.error('Meta load failed:', e)
      }
    },
  },
})
