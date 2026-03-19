import { defineStore } from 'pinia'
import { META_UPGRADES, getUpgradeCost } from '../data/metaUpgrades'
import { getRandomPerks } from '../data/perks'
import { getStartingDeck } from '../data/cards'
import { BOOSTER_PACKS, rollPack } from '../data/boosterPacks'

export const useMetaStore = defineStore('meta', {
  state: () => ({
    voidShards: 0,
    totalShardsEarned: 0,
    purchasedLevels: {}, // { upgradeId: currentLevel }
    totalRuns: 0,

    // Collection & deck building
    collection: {},      // { [cardId]: count }
    customDeck: null,    // array of card IDs or null (uses default)
    totalPacksOpened: 0,

    // Campaign progress
    campaignProgress: {
      highestUnlockedRift: 0,
      completedRifts: [],
    },
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
        spellDmgBonus:   (state.purchasedLevels['spell_amp'] ?? 0),
        lifestealChance: (state.purchasedLevels['lifesteal'] ?? 0) * 0.05,
        extraTier2Card:  (state.purchasedLevels['power_cooldown'] ?? 0) >= 1,
        startingPerk:    (state.purchasedLevels['starting_perk'] ?? 0) >= 1,
      }
    },

    hasAnyUpgrade(state) {
      return Object.values(state.purchasedLevels).some(v => v > 0)
    },

    getActiveDeck(state) {
      if (!state.customDeck || state.customDeck.length < 20) return getStartingDeck()
      return [...state.customDeck]
    },

    collectionSize(state) {
      return Object.keys(state.collection).length
    },

    deckLabel(state) {
      if (!state.customDeck) return 'Default (30)'
      return `Custom (${state.customDeck.length})`
    },

    isRiftUnlocked: (state) => (index) => index <= state.campaignProgress.highestUnlockedRift,

    isRiftCompleted: (state) => (id) => state.campaignProgress.completedRifts.includes(id),

    allRiftsCompleted(state) {
      return state.campaignProgress.completedRifts.length >= 6
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

    seedStarterCollection() {
      if (Object.keys(this.collection).length > 0) return
      const deck = getStartingDeck()
      const coll = {}
      for (const id of deck) {
        coll[id] = (coll[id] ?? 0) + 1
      }
      this.collection = coll
    },

    addCardsToCollection(cardIds) {
      const coll = { ...this.collection }
      for (const id of cardIds) {
        coll[id] = (coll[id] ?? 0) + 1
      }
      this.collection = coll
    },

    buyBoosterPack(packId) {
      const pack = BOOSTER_PACKS.find(p => p.id === packId)
      if (!pack) return null
      if (this.voidShards < pack.cost) return null
      this.voidShards -= pack.cost
      const cards = rollPack(pack)
      this.addCardsToCollection(cards.map(c => c.id))
      this.totalPacksOpened++
      this.save()
      return cards
    },

    setCustomDeck(cardIds) {
      this.customDeck = [...cardIds]
      this.save()
    },

    clearCustomDeck() {
      this.customDeck = null
      this.save()
    },

    markRiftCompleted(id) {
      if (!this.campaignProgress.completedRifts.includes(id)) {
        this.campaignProgress.completedRifts = [...this.campaignProgress.completedRifts, id]
      }
    },

    unlockNextRift() {
      if (this.campaignProgress.highestUnlockedRift < 5) {
        this.campaignProgress.highestUnlockedRift++
      }
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
      localStorage.setItem('void_harvest_meta_v2', JSON.stringify({
        version: 2,
        voidShards: this.voidShards,
        totalShardsEarned: this.totalShardsEarned,
        purchasedLevels: { ...this.purchasedLevels },
        totalRuns: this.totalRuns,
        collection: { ...this.collection },
        customDeck: this.customDeck ? [...this.customDeck] : null,
        totalPacksOpened: this.totalPacksOpened,
        campaignProgress: {
          highestUnlockedRift: this.campaignProgress.highestUnlockedRift,
          completedRifts: [...this.campaignProgress.completedRifts],
        },
      }))
    },

    load() {
      try {
        // Try v2 first
        let raw = localStorage.getItem('void_harvest_meta_v2')
        if (raw) {
          const data = JSON.parse(raw)
          if (data.version === 2) {
            this.voidShards = data.voidShards ?? 0
            this.totalShardsEarned = data.totalShardsEarned ?? 0
            this.purchasedLevels = data.purchasedLevels ?? {}
            this.totalRuns = data.totalRuns ?? 0
            this.collection = data.collection ?? {}
            this.customDeck = data.customDeck ?? null
            this.totalPacksOpened = data.totalPacksOpened ?? 0
            this.campaignProgress = {
              highestUnlockedRift: data.campaignProgress?.highestUnlockedRift ?? 0,
              completedRifts: data.campaignProgress?.completedRifts ?? [],
            }
            if (Object.keys(this.collection).length === 0) this.seedStarterCollection()
            return
          }
        }

        // Migrate from v1
        raw = localStorage.getItem('void_harvest_meta_v1')
        if (raw) {
          const data = JSON.parse(raw)
          if (data.version === 1) {
            this.voidShards = data.voidShards ?? 0
            this.totalShardsEarned = data.totalShardsEarned ?? 0
            this.purchasedLevels = data.purchasedLevels ?? {}
            this.totalRuns = data.totalRuns ?? 0
            this.seedStarterCollection()
            this.customDeck = null
            this.totalPacksOpened = 0
            this.save()
            localStorage.removeItem('void_harvest_meta_v1')
            return
          }
        }

        // Brand new player
        this.seedStarterCollection()
      } catch (e) {
        console.error('Meta load failed:', e)
        this.seedStarterCollection()
      }
    },
  },
})
