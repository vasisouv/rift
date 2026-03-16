import { defineStore } from 'pinia'
import { getCardDef, getStartingDeck, buildEnemyDeck } from '../data/cards.js'
import { SHOP_ITEMS } from '../data/shopItems.js'
import { PERKS } from '../data/perks.js'
import { useMetaStore } from './meta.js'
import { useSoundStore } from './sound.js'

let _instanceCounter = 0
function makeInstance(defId, owner, atkBonus = 0) {
  const def = getCardDef(defId)
  if (!def) return null
  return {
    instanceId: `card_${++_instanceCounter}`,
    defId: def.id,
    name: def.name,
    emoji: def.emoji,
    atk: def.baseAtk + atkBonus,
    hp: def.baseHp,
    maxHp: def.baseHp,
    manaCost: def.manaCost,
    color: def.color,
    owner,
    hasSummoningSickness: true,
    hasAttackedThisTurn: false,
    hitFlash: false,
    attacking: false,
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n)
}

export const useCombatStore = defineStore('combat', {
  state: () => ({
    phase: 'start-run',
    level: 1,
    currentTurn: 'player',

    // Heroes
    playerHp: 50, playerMaxHp: 50,
    enemyHp: 50,  enemyMaxHp: 50,
    enemyName: 'Void Wraith', enemyEmoji: '👾',

    // Mana
    playerMana: 1, playerManaMax: 1,
    enemyMana:  1, enemyManaMax:  1,

    // Decks (arrays of def IDs, last = top of deck)
    playerDeck: [], enemyDeck: [],

    // Hands (card instances)
    playerHand: [], enemyHand: [],

    // Boards (max 5 each)
    playerBoard: [], enemyBoard: [],

    // UI selection state
    selectedHandCardId: null,
    attackingCardId: null,

    // Run tracking
    gold: 0,
    cardsDestroyed: 0,
    equippedPerkIds: [],

    // Applied bonuses from meta/perks
    _atkBonus: 0,
    _defenseBonus: 0,
    _critChance: 0,
    _lifesteal: false,
    _extraStartCard: false,
    _extraTier2Card: false,

    // Offers
    shopOffers: [], perkOffers: [],
    lastRunShards: 0,

    combatLog: [],
  }),

  actions: {
    _log(msg, type = 'info') {
      this.combatLog.push({ msg, type, id: Date.now() + Math.random() })
      if (this.combatLog.length > 30) this.combatLog.shift()
    },

    // ── Run lifecycle ────────────────────────────────────────────────────────

    startRun() {
      const meta = useMetaStore()
      const bonuses = meta.startingBonuses

      this.playerMaxHp = 50 + (bonuses.maxHp ?? 0)
      this.playerHp = this.playerMaxHp
      this.level = 1
      this.gold = 0
      this.cardsDestroyed = 0
      this.equippedPerkIds = []
      this._atkBonus = bonuses.atkBonus ?? 0
      this._defenseBonus = bonuses.defense ?? 0
      this._critChance = bonuses.critChance ?? 0
      this._lifesteal = (bonuses.lifestealChance ?? 0) > 0
      this._extraStartCard = (bonuses.extraStartCards ?? 0) > 0
      this._extraTier2Card = (bonuses.extraTier2Card ?? false)

      if (bonuses.startingPerk) {
        const perk = PERKS[Math.floor(Math.random() * PERKS.length)]
        this._applyPerk(perk)
        this._log(`Meta bonus: started with ${perk.name}`, 'perk')
      }

      this.startLevel()
    },

    startLevel() {
      const sound = useSoundStore()

      let startDeck = shuffle(getStartingDeck())
      if (this._extraTier2Card) startDeck = [...startDeck, 'specter']
      this.playerDeck = shuffle(startDeck)

      this.enemyDeck = buildEnemyDeck(this.level)

      this.playerHand = []
      this.playerBoard = []
      this.enemyHand = []
      this.enemyBoard = []

      this.playerMana = 1
      this.playerManaMax = 1
      this.enemyMana = 1
      this.enemyManaMax = 1

      const enemies = ['👾', '👻', '🌀', '☄️', '💀', '🌌', '👑']
      const names = ['Void Wraith', 'Specter Lord', 'Rift Walker', 'Stellar Horror', 'Void Lich', 'Nebula Titan', 'Void Sovereign']
      const idx = (this.level - 1) % enemies.length
      this.enemyEmoji = enemies[idx]
      this.enemyName = names[idx]
      this.enemyHp = 50
      this.enemyMaxHp = 50

      this.drawCard('player')
      this.drawCard('player')
      this.drawCard('player')
      if (this._extraStartCard) this.drawCard('player')

      this.drawCard('enemy')
      this.drawCard('enemy')
      this.drawCard('enemy')

      this.selectedHandCardId = null
      this.attackingCardId = null
      this.currentTurn = 'player'
      this.phase = 'combat'

      sound.startMusic?.(false)
      this._log(`Level ${this.level} — fight!`, 'level')
    },

    // ── Card draw ────────────────────────────────────────────────────────────

    drawCard(owner) {
      const deck = owner === 'player' ? this.playerDeck : this.enemyDeck
      const hand = owner === 'player' ? this.playerHand : this.enemyHand
      if (deck.length === 0) return
      const defId = deck.pop()
      const inst = makeInstance(defId, owner, owner === 'player' ? this._atkBonus : 0)
      if (inst) hand.push(inst)
    },

    // ── Hand / board actions ─────────────────────────────────────────────────

    selectHandCard(id) {
      if (this.currentTurn !== 'player') return
      if (this.selectedHandCardId === id) {
        this.selectedHandCardId = null
        return
      }
      const card = this.playerHand.find(c => c.instanceId === id)
      if (!card) return
      if (card.manaCost > this.playerMana) return
      this.selectedHandCardId = id
      this.attackingCardId = null
    },

    playCardToBoard() {
      if (!this.selectedHandCardId) return
      const card = this.playerHand.find(c => c.instanceId === this.selectedHandCardId)
      if (!card) { this.selectedHandCardId = null; return }
      if (card.manaCost > this.playerMana) return
      if (this.playerBoard.length >= 5) return

      const sound = useSoundStore()
      this.playerMana -= card.manaCost
      this.playerHand = this.playerHand.filter(c => c.instanceId !== card.instanceId)
      card.hasSummoningSickness = true
      card.hasAttackedThisTurn = false
      this.playerBoard.push(card)
      this.selectedHandCardId = null
      sound.cardPlay?.()
      this._log(`You played ${card.name}`, 'info')
    },

    selectBoardCard(id) {
      if (this.currentTurn !== 'player') return
      if (this.selectedHandCardId) {
        this.playCardToBoard()
        return
      }
      const card = this.playerBoard.find(c => c.instanceId === id)
      if (!card) return
      if (card.hasSummoningSickness || card.hasAttackedThisTurn) return
      this.attackingCardId = this.attackingCardId === id ? null : id
    },

    attackTarget(targetId) {
      if (!this.attackingCardId) return
      const attacker = this.playerBoard.find(c => c.instanceId === this.attackingCardId)
      if (!attacker) { this.attackingCardId = null; return }

      const sound = useSoundStore()

      if (targetId === 'enemy-hero') {
        let dmg = attacker.atk
        if (Math.random() < this._critChance) {
          dmg *= 2
          this._log(`Crit! ${attacker.name} deals ${dmg} to enemy hero`, 'crit')
          sound.crit?.()
        } else {
          this._log(`${attacker.name} attacks enemy hero for ${dmg}`, 'hit')
          sound.attack?.()
        }
        this._animateAttack(attacker)
        this.enemyHp = Math.max(0, this.enemyHp - dmg)
        attacker.hasAttackedThisTurn = true
        this._flashCard(attacker)
        this.attackingCardId = null
        this._checkVictory()
        return
      }

      const defender = this.enemyBoard.find(c => c.instanceId === targetId)
      if (!defender) { this.attackingCardId = null; return }

      this._resolveCardCombat(attacker, defender)
      this.attackingCardId = null
    },

    _resolveCardCombat(attacker, defender) {
      const sound = useSoundStore()
      let atkDmg = attacker.atk
      const defDmg = defender.atk

      if (Math.random() < this._critChance) {
        atkDmg *= 2
        sound.crit?.()
      } else {
        sound.attack?.()
      }

      this._animateAttack(attacker)
      defender.hp -= atkDmg
      attacker.hp -= defDmg

      this._flashCard(attacker)
      this._flashCard(defender)
      this._log(`${attacker.name} (${atkDmg}) vs ${defender.name} (${defDmg})`, 'hit')

      attacker.hasAttackedThisTurn = true

      if (this._lifesteal && attacker.owner === 'player' && defender.hp <= 0) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 1)
        this._log('Lifesteal: +1 HP', 'heal')
      }

      this._checkCardDeath(attacker)
      this._checkCardDeath(defender)
    },

    _checkCardDeath(card) {
      if (card.hp > 0) return
      const sound = useSoundStore()
      if (card.owner === 'player') {
        this.playerBoard = this.playerBoard.filter(c => c.instanceId !== card.instanceId)
      } else {
        this.enemyBoard = this.enemyBoard.filter(c => c.instanceId !== card.instanceId)
        this.cardsDestroyed++
      }
      sound.enemyDeath?.()
      this._log(`${card.name} was destroyed`, 'kill')
    },

    _flashCard(card) {
      card.hitFlash = true
      setTimeout(() => { card.hitFlash = false }, 300)
    },

    _animateAttack(card) {
      card.attacking = true
      setTimeout(() => { card.attacking = false }, 400)
    },

    // ── Turn management ──────────────────────────────────────────────────────

    endPlayerTurn() {
      if (this.currentTurn !== 'player') return
      const sound = useSoundStore()
      sound.turnEnd?.()
      this.selectedHandCardId = null
      this.attackingCardId = null
      this.currentTurn = 'enemy'
      this._doEnemyTurn()
    },

    async _doEnemyTurn() {
      const sound = useSoundStore()
      const delay = (ms) => new Promise(r => setTimeout(r, ms))

      this.enemyManaMax = Math.min(10, this.enemyManaMax + 1)
      this.enemyMana = this.enemyManaMax

      await delay(700)
      this.drawCard('enemy')

      let played = true
      while (played) {
        played = false
        await delay(600)
        const playable = this.enemyHand
          .filter(c => c.manaCost <= this.enemyMana && this.enemyBoard.length < 5)
          .sort((a, b) => b.manaCost - a.manaCost)
        if (playable.length > 0) {
          const card = playable[0]
          this.enemyMana -= card.manaCost
          this.enemyHand = this.enemyHand.filter(c => c.instanceId !== card.instanceId)
          card.hasSummoningSickness = true
          card.hasAttackedThisTurn = false
          this.enemyBoard.push(card)
          sound.cardPlay?.()
          this._log(`Enemy plays ${card.name}`, 'info')
          played = true
        }
      }

      await delay(700)
      const attackers = this.enemyBoard.filter(c => !c.hasSummoningSickness && !c.hasAttackedThisTurn)
      for (const attacker of attackers) {
        await delay(750)
        if (this.phase !== 'combat') return

        const playerCards = this.playerBoard.filter(c => c.hp > 0)
        if (playerCards.length > 0) {
          const target = playerCards.reduce((min, c) => c.hp < min.hp ? c : min, playerCards[0])
          this._resolveEnemyAttackCard(attacker, target)
        } else {
          const dmg = Math.max(0, attacker.atk - this._defenseBonus)
          this._log(`Enemy ${attacker.name} attacks you for ${dmg}`, 'damage')
          sound.enemyHit?.()
          this._animateAttack(attacker)
          this.playerHp = Math.max(0, this.playerHp - dmg)
          attacker.hasAttackedThisTurn = true
          this._flashCard(attacker)
          this._checkPlayerDeath()
          if (this.phase !== 'combat') return
        }
      }

      await delay(600)
      this._endEnemyTurn()
    },

    _resolveEnemyAttackCard(attacker, defender) {
      const sound = useSoundStore()
      const atkDmg = attacker.atk
      const defDmg = defender.atk

      this._animateAttack(attacker)
      defender.hp -= atkDmg
      attacker.hp -= defDmg

      this._flashCard(attacker)
      this._flashCard(defender)
      sound.enemyHit?.()
      this._log(`Enemy ${attacker.name} (${atkDmg}) vs your ${defender.name} (${defDmg})`, 'hit')

      attacker.hasAttackedThisTurn = true

      this._checkCardDeath(attacker)
      this._checkCardDeath(defender)
    },

    _endEnemyTurn() {
      if (this.phase !== 'combat') return

      this.playerManaMax = Math.min(10, this.playerManaMax + 1)
      this.playerMana = this.playerManaMax

      this.drawCard('player')

      for (const card of this.playerBoard) {
        card.hasSummoningSickness = false
        card.hasAttackedThisTurn = false
      }
      for (const card of this.enemyBoard) {
        card.hasAttackedThisTurn = false
        card.hasSummoningSickness = false
      }

      this.currentTurn = 'player'
      this._log('Your turn', 'info')
    },

    // ── Victory / Defeat ─────────────────────────────────────────────────────

    _checkVictory() {
      if (this.enemyHp <= 0) {
        const sound = useSoundStore()
        sound.bossDeath?.()
        sound.stopMusic?.()
        const goldEarned = 10 + this.level * 5
        this.gold += goldEarned
        this._log(`Enemy defeated! +${goldEarned} gold`, 'level')
        this._generateOffers()
        this.phase = 'between-level'
      }
    },

    _checkPlayerDeath() {
      if (this.playerHp <= 0) {
        const meta = useMetaStore()
        const sound = useSoundStore()
        sound.playerDeath?.()
        sound.stopMusic?.()
        const shards = this.level * 15 + this.cardsDestroyed * 3 + (this.level - 1) * 25
        this.lastRunShards = shards
        meta.earnShards(shards)
        meta.recordRun()
        meta.save()
        this._log('You were defeated!', 'death')
        this.phase = 'game-over'
      }
    },

    // ── Between-level offers ─────────────────────────────────────────────────

    _generateOffers() {
      this.shopOffers = pickRandom(SHOP_ITEMS, 4)
      const available = PERKS.filter(p => !this.equippedPerkIds.includes(p.id))
      this.perkOffers = pickRandom(available, Math.min(3, available.length))
    },

    buyShopItem(item) {
      if (this.gold < item.cost) return
      const sound = useSoundStore()
      this.gold -= item.cost
      this._applyShopItem(item)
      sound.buy?.()
      this._log(`Bought ${item.name}`, 'shop')
    },

    _applyShopItem(item) {
      if (item.effect === 'heal') {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.value)
      } else if (item.effect === 'full_heal') {
        this.playerHp = this.playerMaxHp
      } else if (item.effect === 'max_hp') {
        this.playerMaxHp += item.value
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.value)
      } else if (item.effect === 'atk_bonus') {
        this._atkBonus += item.value
      } else if (item.effect === 'add_card') {
        for (let i = 0; i < (item.count ?? 1); i++) {
          this.playerDeck.unshift(item.cardId ?? 'void_drone')
        }
      }
    },

    pickPerk(perk) {
      const sound = useSoundStore()
      this.equippedPerkIds.push(perk.id)
      this._applyPerk(perk)
      sound.perk?.()
      this._log(`Perk: ${perk.name}`, 'perk')
      this.level++
      this.startLevel()
    },

    _applyPerk(perk) {
      if (perk.effect === 'atk') this._atkBonus += perk.value
      else if (perk.effect === 'defense') this._defenseBonus += perk.value
      else if (perk.effect === 'crit') this._critChance = Math.min(1, this._critChance + perk.value)
      else if (perk.effect === 'max_hp') {
        this.playerMaxHp += perk.value
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + perk.value)
      } else if (perk.effect === 'lifesteal') this._lifesteal = true
      else if (perk.effect === 'heal') this.playerHp = Math.min(this.playerMaxHp, this.playerHp + perk.value)
      else if (perk.effect === 'combo_tank') {
        this.playerMaxHp += perk.max_hp ?? 0
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + (perk.max_hp ?? 0))
        this._defenseBonus += perk.defense ?? 0
      } else if (perk.effect === 'combo_dmg') {
        this._atkBonus += perk.atk ?? 0
        this._critChance = Math.min(1, this._critChance + (perk.crit ?? 0))
      } else if (perk.effect === 'combo_cannon') {
        this._atkBonus += perk.atk ?? 0
        const penalty = perk.hp_penalty ?? 0
        this.playerMaxHp = Math.max(1, this.playerMaxHp - penalty)
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp)
      }
    },

    // ── Navigation ───────────────────────────────────────────────────────────

    goToMetaShop() {
      const sound = useSoundStore()
      sound.stopMusic?.()
      this.phase = 'meta-shop'
    },

    restartRun() {
      const sound = useSoundStore()
      sound.stopMusic?.()
      this.phase = 'start-run'
    },

    backFromMetaShop() {
      this.phase = 'start-run'
    },

    exitMetaShop() {
      this.phase = 'start-run'
    },
  },
})
