import { defineStore } from 'pinia'
import { getCardDef, getStartingDeck, buildEnemyDeck, buildRiftEnemyDeck } from '../data/cards.js'
import { getRift } from '../data/rifts.js'
import { SHOP_ITEMS } from '../data/shopItems.js'
import { PERKS } from '../data/perks.js'
import { useMetaStore } from './meta.js'
import { useSoundStore } from './sound.js'

let _instanceCounter = 0
let _animResolve = null
function makeInstance(defId, owner, atkBonus = 0) {
  const def = getCardDef(defId)
  if (!def) return null

  if (def.type === 'spell') {
    return {
      instanceId: `card_${++_instanceCounter}`,
      defId: def.id,
      name: def.name,
      emoji: def.emoji,
      type: 'spell',
      manaCost: def.manaCost,
      color: def.color,
      owner,
    }
  }

  return {
    instanceId: `card_${++_instanceCounter}`,
    defId: def.id,
    name: def.name,
    emoji: def.emoji,
    type: 'minion',
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
    victoryAnimating: false,
    attackAnimation: null, // { attackerId, targetId, id }
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
    pendingSpellId: null,
    spellTargetMode: null, // 'enemy_card' | 'friendly_card' | null

    // Rift / campaign state
    currentRiftId: null,
    battleIndex: 0,
    isBossFight: false,
    bossPassive: null,
    bossPassiveDesc: null,
    bossPassiveCounter: 0,

    // Run tracking
    gold: 0,
    cardsDestroyed: 0,
    equippedPerkIds: [],

    // Applied bonuses from meta/perks
    _atkBonus: 0,
    _defenseBonus: 0,
    _spellDmgBonus: 0,
    _extraDraw: 0,
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

    startRun(riftId = null) {
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
      this._spellDmgBonus = bonuses.spellDmgBonus ?? 0
      this._extraDraw = 0
      this._lifesteal = (bonuses.lifestealChance ?? 0) > 0
      this._extraStartCard = (bonuses.extraStartCards ?? 0) > 0
      this._extraTier2Card = (bonuses.extraTier2Card ?? false)

      // Campaign rift state
      this.currentRiftId = riftId
      this.battleIndex = riftId ? meta.getRiftBattle(riftId) : 0
      this.isBossFight = false
      this.bossPassive = null
      this.bossPassiveDesc = null
      this.bossPassiveCounter = 0

      if (bonuses.startingPerk) {
        const perk = PERKS[Math.floor(Math.random() * PERKS.length)]
        this._applyPerk(perk)
        this._log(`Meta bonus: started with ${perk.name}`, 'perk')
      }

      this.startLevel()
    },

    startLevel() {
      const sound = useSoundStore()

      const meta = useMetaStore()
      let startDeck = shuffle(meta.getActiveDeck)
      if (this._extraTier2Card) startDeck = [...startDeck, 'specter']
      this.playerDeck = shuffle(startDeck)

      const rift = this.currentRiftId ? getRift(this.currentRiftId) : null

      if (rift) {
        // Campaign mode — rift-aware setup
        const isBoss = this.battleIndex >= rift.battles
        this.isBossFight = isBoss

        if (isBoss) {
          this.enemyDeck = buildRiftEnemyDeck(rift.boss.tierRange)
          this.enemyName = rift.boss.name
          this.enemyEmoji = rift.boss.emoji
          this.enemyHp = rift.boss.hp
          this.enemyMaxHp = rift.boss.hp
          this.bossPassive = rift.boss.passive
          this.bossPassiveDesc = rift.boss.passiveDesc
          this.bossPassiveCounter = 0
          this._log(`⚠ BOSS: ${rift.boss.name} — ${rift.boss.passiveDesc}`, 'boss')
        } else {
          this.enemyDeck = buildRiftEnemyDeck(rift.tierRange)
          const enemy = rift.enemies[this.battleIndex % rift.enemies.length]
          this.enemyName = enemy.name
          this.enemyEmoji = enemy.emoji
          this.enemyHp = rift.baseEnemyHp + rift.hpPerBattle * this.battleIndex
          this.enemyMaxHp = this.enemyHp
          this.bossPassive = null
          this.bossPassiveDesc = null
          this.bossPassiveCounter = 0
        }
      } else {
        // Endless mode (legacy)
        this.enemyDeck = buildEnemyDeck(this.level)
        const enemies = ['👾', '👻', '🌀', '☄️', '💀', '🌌', '👑']
        const names = ['Void Wraith', 'Specter Lord', 'Rift Walker', 'Stellar Horror', 'Void Lich', 'Nebula Titan', 'Void Sovereign']
        const idx = (this.level - 1) % enemies.length
        this.enemyEmoji = enemies[idx]
        this.enemyName = names[idx]
        this.enemyHp = 50
        this.enemyMaxHp = 50
        this.isBossFight = false
        this.bossPassive = null
        this.bossPassiveDesc = null
      }

      this.playerHand = []
      this.playerBoard = []
      this.enemyHand = []
      this.enemyBoard = []

      this.playerMana = 1
      this.playerManaMax = 1
      this.enemyMana = 1
      this.enemyManaMax = 1

      this.drawCard('player')
      this.drawCard('player')
      this.drawCard('player')
      if (this._extraStartCard) this.drawCard('player')

      this.drawCard('enemy')
      this.drawCard('enemy')
      this.drawCard('enemy')

      this.selectedHandCardId = null
      this.attackingCardId = null
      this.pendingSpellId = null
      this.spellTargetMode = null
      this.currentTurn = 'player'
      this.phase = 'combat'

      sound.startMusic?.(false)
      if (rift) {
        const battleNum = this.battleIndex + 1
        const totalBattles = rift.battles + 1
        this._log(`${rift.name} — Battle ${battleNum}/${totalBattles}`, 'level')
      } else {
        this._log(`Level ${this.level} — fight!`, 'level')
      }
    },

    // ── Card draw ────────────────────────────────────────────────────────────

    drawCard(owner) {
      const MAX_HAND = 10
      const deck = owner === 'player' ? this.playerDeck : this.enemyDeck
      const hand = owner === 'player' ? this.playerHand : this.enemyHand
      if (deck.length === 0) return
      const defId = deck.pop()
      const inst = makeInstance(defId, owner, owner === 'player' ? this._atkBonus : 0)
      if (!inst) return
      if (hand.length >= MAX_HAND) {
        this._log(`${inst.name} burned (hand full)`, 'damage')
        return
      }
      hand.push(inst)
    },

    // ── Hand / board actions ─────────────────────────────────────────────────

    selectHandCard(id) {
      if (this.currentTurn !== 'player') return
      if (this.selectedHandCardId === id) {
        this.selectedHandCardId = null
        this.pendingSpellId = null
        this.spellTargetMode = null
        return
      }
      const card = this.playerHand.find(c => c.instanceId === id)
      if (!card) return
      if (card.manaCost > this.playerMana) return

      this.attackingCardId = null

      if (card.type === 'spell') {
        const def = getCardDef(card.defId)
        if (!def) return
        if (def.spellTarget === 'no_target' || def.spellTarget === 'all_enemies' || def.spellTarget === 'all_friendly') {
          this._castSpell(card)
          return
        }
        this.selectedHandCardId = id
        this.pendingSpellId = id
        this.spellTargetMode = def.spellTarget
      } else {
        this.selectedHandCardId = id
        this.pendingSpellId = null
        this.spellTargetMode = null
      }
    },

    playCardToBoard() {
      if (!this.selectedHandCardId) return
      const card = this.playerHand.find(c => c.instanceId === this.selectedHandCardId)
      if (!card) { this.selectedHandCardId = null; return }
      if (card.type === 'spell') return // spells don't go on board
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

      // Spell targeting on friendly card
      if (this.pendingSpellId && this.spellTargetMode === 'friendly_card') {
        const spell = this.playerHand.find(c => c.instanceId === this.pendingSpellId)
        if (spell) this._castSpell(spell, id)
        return
      }

      if (this.selectedHandCardId) {
        this.playCardToBoard()
        return
      }
      const card = this.playerBoard.find(c => c.instanceId === id)
      if (!card) return
      if (card.hasSummoningSickness || card.hasAttackedThisTurn) return
      this.attackingCardId = this.attackingCardId === id ? null : id
    },

    async attackTarget(targetId) {
      // Spell targeting on enemy card/hero
      if (this.pendingSpellId && this.spellTargetMode === 'enemy_card') {
        const spell = this.playerHand.find(c => c.instanceId === this.pendingSpellId)
        if (spell) this._castSpell(spell, targetId)
        return
      }

      if (!this.attackingCardId) return
      const attacker = this.playerBoard.find(c => c.instanceId === this.attackingCardId)
      if (!attacker) { this.attackingCardId = null; return }

      // Trigger travel animation and wait for it to finish
      this.attackAnimation = { attackerId: this.attackingCardId, targetId, id: Date.now() }
      this.attackingCardId = null
      await this._waitForAnimation()

      const sound = useSoundStore()

      if (targetId === 'enemy-hero') {
        const dmg = attacker.atk
        this._log(`${attacker.name} attacks enemy hero for ${dmg}`, 'hit')
        sound.attack?.()
        this.enemyHp = Math.max(0, this.enemyHp - dmg)
        attacker.hasAttackedThisTurn = true
        this._flashCard(attacker)
        this._checkVictory()
        return
      }

      const defender = this.enemyBoard.find(c => c.instanceId === targetId)
      if (!defender) return

      this._resolveCardCombat(attacker, defender)
    },

    _resolveCardCombat(attacker, defender) {
      const sound = useSoundStore()
      const atkDmg = attacker.atk
      const defDmg = defender.atk
      sound.attack?.()

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
        // Boss passive: heal_on_kill
        if (this.bossPassive === 'heal_on_kill') {
          this.enemyHp = Math.min(this.enemyMaxHp, this.enemyHp + 5)
          this._log(`${this.enemyName} heals 5 HP (passive)`, 'boss')
        }
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

    _waitForAnimation() {
      return new Promise(resolve => {
        _animResolve = resolve
        // Fallback timeout in case animation doesn't fire
        setTimeout(() => { if (_animResolve === resolve) { resolve(); _animResolve = null } }, 1200)
      })
    },

    onAnimationDone() {
      if (_animResolve) { _animResolve(); _animResolve = null }
    },

    // ── Spell casting ──────────────────────────────────────────────────────

    _castSpell(spell, targetId = null) {
      const sound = useSoundStore()
      const def = getCardDef(spell.defId)
      if (!def) return

      this.playerMana -= spell.manaCost
      this.playerHand = this.playerHand.filter(c => c.instanceId !== spell.instanceId)
      sound.spellCast?.()

      const bonus = this._spellDmgBonus

      switch (def.spellEffect) {
        case 'damage': {
          const dmg = def.spellValue + bonus
          if (targetId === 'enemy-hero') {
            this.enemyHp = Math.max(0, this.enemyHp - dmg)
            this._log(`${spell.name} deals ${dmg} to enemy hero`, 'spell')
            this._checkVictory()
          } else {
            const target = this.enemyBoard.find(c => c.instanceId === targetId)
            if (target) {
              target.hp -= dmg
              this._flashCard(target)
              this._log(`${spell.name} deals ${dmg} to ${target.name}`, 'spell')
              this._checkCardDeath(target)
            }
          }
          break
        }
        case 'buff': {
          const target = this.playerBoard.find(c => c.instanceId === targetId)
          if (target) {
            target.atk += def.spellValue.atk
            target.hp += def.spellValue.hp
            target.maxHp += def.spellValue.hp
            this._flashCard(target)
            this._log(`${spell.name} buffs ${target.name} +${def.spellValue.atk}/+${def.spellValue.hp}`, 'spell')
          }
          break
        }
        case 'heal_hero': {
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + def.spellValue)
          this._log(`${spell.name} heals you for ${def.spellValue}`, 'spell')
          break
        }
        case 'damage_all': {
          const aoeDmg = def.spellValue + bonus
          const targets = [...this.enemyBoard]
          for (const card of targets) {
            card.hp -= aoeDmg
            this._flashCard(card)
          }
          this._log(`${spell.name} hits all enemies for ${aoeDmg}`, 'spell')
          for (const card of targets) this._checkCardDeath(card)
          break
        }
        case 'draw': {
          for (let i = 0; i < def.spellValue; i++) this.drawCard('player')
          this._log(`${spell.name}: drew ${def.spellValue} cards`, 'spell')
          break
        }
        case 'draw_mana': {
          for (let i = 0; i < def.spellValue.draw; i++) this.drawCard('player')
          this.playerMana += def.spellValue.mana
          this._log(`${spell.name}: drew ${def.spellValue.draw}, +${def.spellValue.mana} mana`, 'spell')
          break
        }
        case 'damage_heal': {
          const dhDmg = def.spellValue.damage + bonus
          if (targetId === 'enemy-hero') {
            this.enemyHp = Math.max(0, this.enemyHp - dhDmg)
            this._log(`${spell.name} deals ${dhDmg} to enemy hero`, 'spell')
            this._checkVictory()
          } else {
            const target = this.enemyBoard.find(c => c.instanceId === targetId)
            if (target) {
              target.hp -= dhDmg
              this._flashCard(target)
              this._log(`${spell.name} deals ${dhDmg} to ${target.name}`, 'spell')
              this._checkCardDeath(target)
            }
          }
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + def.spellValue.heal)
          this._log(`Healed for ${def.spellValue.heal}`, 'heal')
          break
        }
        case 'full_heal_buff': {
          for (const card of this.playerBoard) {
            card.hp = card.maxHp
            card.atk += def.spellValue.atk
            this._flashCard(card)
          }
          this._log(`${spell.name}: all cards restored, +${def.spellValue.atk} ATK`, 'spell')
          break
        }
      }

      this.selectedHandCardId = null
      this.pendingSpellId = null
      this.spellTargetMode = null
    },

    _resolveEnemySpell(spell) {
      const def = getCardDef(spell.defId)
      if (!def) return

      switch (def.spellEffect) {
        case 'damage': {
          const targets = this.playerBoard.filter(c => c.hp > 0)
          if (targets.length > 0) {
            const target = targets.reduce((min, c) => c.hp < min.hp ? c : min, targets[0])
            target.hp -= def.spellValue
            this._flashCard(target)
            this._log(`Enemy ${spell.name} deals ${def.spellValue} to ${target.name}`, 'spell')
            this._checkCardDeath(target)
          } else {
            this.playerHp = Math.max(0, this.playerHp - def.spellValue)
            this._log(`Enemy ${spell.name} deals ${def.spellValue} to you`, 'damage')
            this._checkPlayerDeath()
          }
          break
        }
        case 'buff': {
          const targets = this.enemyBoard.filter(c => c.hp > 0)
          if (targets.length > 0) {
            const target = targets.reduce((max, c) => c.atk > max.atk ? c : max, targets[0])
            target.atk += def.spellValue.atk
            target.hp += def.spellValue.hp
            target.maxHp += def.spellValue.hp
            this._flashCard(target)
            this._log(`Enemy ${spell.name} buffs ${target.name}`, 'spell')
          }
          break
        }
        case 'heal_hero': {
          this.enemyHp = Math.min(this.enemyMaxHp, this.enemyHp + def.spellValue)
          this._log(`Enemy ${spell.name} heals for ${def.spellValue}`, 'spell')
          break
        }
        case 'damage_all': {
          const targets = [...this.playerBoard]
          for (const card of targets) {
            card.hp -= def.spellValue
            this._flashCard(card)
          }
          this._log(`Enemy ${spell.name} hits all your cards for ${def.spellValue}`, 'spell')
          for (const card of targets) this._checkCardDeath(card)
          this._checkPlayerDeath()
          break
        }
        case 'draw': {
          for (let i = 0; i < def.spellValue; i++) this.drawCard('enemy')
          this._log(`Enemy ${spell.name}: draws cards`, 'spell')
          break
        }
        case 'draw_mana': {
          for (let i = 0; i < def.spellValue.draw; i++) this.drawCard('enemy')
          this.enemyMana += def.spellValue.mana
          this._log(`Enemy ${spell.name}: draws and gains mana`, 'spell')
          break
        }
        case 'damage_heal': {
          const targets = this.playerBoard.filter(c => c.hp > 0)
          if (targets.length > 0) {
            const target = targets.reduce((min, c) => c.hp < min.hp ? c : min, targets[0])
            target.hp -= def.spellValue.damage
            this._flashCard(target)
            this._log(`Enemy ${spell.name} deals ${def.spellValue.damage} to ${target.name}`, 'spell')
            this._checkCardDeath(target)
          } else {
            this.playerHp = Math.max(0, this.playerHp - def.spellValue.damage)
            this._log(`Enemy ${spell.name} deals ${def.spellValue.damage} to you`, 'damage')
            this._checkPlayerDeath()
          }
          this.enemyHp = Math.min(this.enemyMaxHp, this.enemyHp + def.spellValue.heal)
          break
        }
        case 'full_heal_buff': {
          for (const card of this.enemyBoard) {
            card.hp = card.maxHp
            card.atk += def.spellValue.atk
            this._flashCard(card)
          }
          this._log(`Enemy ${spell.name} restores all cards`, 'spell')
          break
        }
      }
    },

    // ── Turn management ──────────────────────────────────────────────────────

    endPlayerTurn() {
      if (this.currentTurn !== 'player') return
      const sound = useSoundStore()
      sound.turnEnd?.()
      this.selectedHandCardId = null
      this.attackingCardId = null
      this.pendingSpellId = null
      this.spellTargetMode = null
      this.currentTurn = 'enemy'
      this._doEnemyTurn()
    },

    _applyBossPassive() {
      if (!this.bossPassive) return
      this.bossPassiveCounter++

      switch (this.bossPassive) {
        case 'spawn_drone': {
          if (this.enemyBoard.length < 5) {
            const drone = makeInstance('void_drone', 'enemy')
            if (drone) {
              drone.atk = 1
              drone.hp = 1
              drone.maxHp = 1
              drone.hasSummoningSickness = true
              this.enemyBoard.push(drone)
              this._log(`${this.enemyName} spawns a 1/1 drone`, 'boss')
            }
          }
          break
        }
        case 'ramping_atk': {
          for (const card of this.enemyBoard) {
            card.atk += 1
          }
          if (this.enemyBoard.length > 0) {
            this._log(`${this.enemyName}: all cards gain +1 ATK`, 'boss')
          }
          break
        }
        case 'aoe_pulse': {
          if (this.bossPassiveCounter % 2 === 0) {
            const targets = [...this.playerBoard]
            for (const card of targets) {
              card.hp -= 1
              this._flashCard(card)
            }
            if (targets.length > 0) {
              this._log(`${this.enemyName}: 1 dmg to all your cards`, 'boss')
              for (const card of targets) this._checkCardDeath(card)
            }
          }
          break
        }
        case 'escalate': {
          if (this.bossPassiveCounter % 3 === 0) {
            const n = Math.floor(this.bossPassiveCounter / 3)
            const targets = [...this.playerBoard]
            for (const card of targets) {
              card.hp -= n
              this._flashCard(card)
            }
            this.playerHp = Math.max(0, this.playerHp - n)
            this.enemyHp = Math.min(this.enemyMaxHp, this.enemyHp + n)
            this._log(`${this.enemyName}: deals ${n} to all + heals ${n}`, 'boss')
            for (const card of targets) this._checkCardDeath(card)
            this._checkPlayerDeath()
          }
          break
        }
      }
    },

    async _doEnemyTurn() {
      const sound = useSoundStore()
      const delay = (ms) => new Promise(r => setTimeout(r, ms))

      this.enemyManaMax = Math.min(10, this.enemyManaMax + 1)
      this.enemyMana = this.enemyManaMax

      // Boss passive triggers at start of enemy turn
      this._applyBossPassive()
      if (this.phase !== 'combat') return

      await delay(700)
      this.drawCard('enemy')

      let played = true
      while (played) {
        played = false
        await delay(600)
        if (this.phase !== 'combat') return
        const playable = this.enemyHand
          .filter(c => c.manaCost <= this.enemyMana && (c.type === 'spell' || this.enemyBoard.length < 5))
          .sort((a, b) => b.manaCost - a.manaCost)
        if (playable.length > 0) {
          const card = playable[0]
          this.enemyMana -= card.manaCost
          this.enemyHand = this.enemyHand.filter(c => c.instanceId !== card.instanceId)
          if (card.type === 'spell') {
            this._resolveEnemySpell(card)
            sound.spellCast?.()
          } else {
            card.hasSummoningSickness = true
            card.hasAttackedThisTurn = false
            this.enemyBoard.push(card)
            // Boss passive: buff_on_play
            if (this.bossPassive === 'buff_on_play') {
              card.atk += 1
              card.hp += 1
              card.maxHp += 1
              this._log(`${card.name} gets +1/+1 (boss passive)`, 'boss')
            }
            sound.cardPlay?.()
            this._log(`Enemy plays ${card.name}`, 'info')
          }
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
          await this._resolveEnemyAttackCard(attacker, target)
        } else {
          this.attackAnimation = { attackerId: attacker.instanceId, targetId: 'player-hero', id: Date.now() }
          await this._waitForAnimation()
          const dmg = Math.max(0, attacker.atk - this._defenseBonus)
          this._log(`Enemy ${attacker.name} attacks you for ${dmg}`, 'damage')
          sound.enemyHit?.()
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

    async _resolveEnemyAttackCard(attacker, defender) {
      const sound = useSoundStore()
      const atkDmg = attacker.atk
      const defDmg = defender.atk

      this.attackAnimation = { attackerId: attacker.instanceId, targetId: defender.instanceId, id: Date.now() }
      await this._waitForAnimation()

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
      for (let i = 0; i < this._extraDraw; i++) this.drawCard('player')

      for (const card of this.playerBoard) {
        card.hasSummoningSickness = false
        card.hasAttackedThisTurn = false
      }
      for (const card of this.enemyBoard) {
        card.hasAttackedThisTurn = false
        card.hasSummoningSickness = false
      }

      this.currentTurn = 'player'
    },

    // ── Victory / Defeat ─────────────────────────────────────────────────────

    _checkVictory() {
      if (this.enemyHp <= 0) {
        const sound = useSoundStore()
        sound.bossDeath?.()
        sound.stopMusic?.()

        const rift = this.currentRiftId ? getRift(this.currentRiftId) : null

        if (rift && this.isBossFight) {
          // Boss defeated — rift cleared!
          const meta = useMetaStore()
          const shards = rift.completionShards
          meta.markRiftCompleted(rift.id)
          meta.unlockNextRift()
          meta.earnShards(shards)
          meta.recordRun()
          meta.save()
          this.lastRunShards = shards
          this._log(`${rift.boss.name} defeated! Rift cleared!`, 'boss')
          this.victoryAnimating = true
          setTimeout(() => {
            this.victoryAnimating = false
            this.phase = 'rift-cleared'
          }, 2800)
        } else if (rift) {
          // Campaign non-boss battle — standalone mission, return to hub
          const meta = useMetaStore()
          const shards = (this.battleIndex + 1) * 10 * (rift.index + 1)
          meta.advanceRiftBattle(rift.id)
          meta.earnShards(shards)
          meta.save()
          this.lastRunShards = shards
          this._log(`Battle won! +${shards} shards`, 'level')
          this.victoryAnimating = true
          setTimeout(() => {
            this.victoryAnimating = false
            this.phase = 'start-run'
          }, 2800)
        } else {
          // Endless mode — between-level shop/perks
          const goldEarned = 10 + this.level * 5
          this.gold += goldEarned
          this._log(`Enemy defeated! +${goldEarned} gold`, 'level')
          this._generateOffers()
          this.victoryAnimating = true
          setTimeout(() => {
            this.victoryAnimating = false
            this.phase = 'between-level'
          }, 2800)
        }
      }
    },

    _checkPlayerDeath() {
      if (this.playerHp <= 0) {
        const meta = useMetaStore()
        const sound = useSoundStore()
        sound.playerDeath?.()
        sound.stopMusic?.()

        let shards
        const rift = this.currentRiftId ? getRift(this.currentRiftId) : null
        if (rift) {
          shards = (this.battleIndex + 1) * 15 * (rift.index + 1) + this.cardsDestroyed * 3
        } else {
          shards = this.level * 15 + this.cardsDestroyed * 3 + (this.level - 1) * 25
        }

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
      else if (perk.effect === 'spell_dmg') this._spellDmgBonus += perk.value
      else if (perk.effect === 'extra_draw') this._extraDraw += perk.value
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
        if (perk.max_hp) {
          this.playerMaxHp += perk.max_hp
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + perk.max_hp)
        }
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

    restartRift() {
      if (this.currentRiftId) {
        this.startRun(this.currentRiftId)
      } else {
        this.startRun()
      }
    },

    backFromMetaShop() {
      this.phase = 'start-run'
    },

    exitMetaShop() {
      this.phase = 'start-run'
    },
  },
})
