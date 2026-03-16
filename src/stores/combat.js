import { defineStore } from 'pinia'
import { useCharacterStore } from './character'
import { useMetaStore } from './meta'
import { getEnemyTypesForLevel } from '../data/enemyTypes'
import { getBossForLevel } from '../data/bossTypes'
import { getRandomPerks } from '../data/perks'
import { SHOP_ITEMS } from '../data/shopItems'

let _enemyIdCounter = 0

function pickNextAction(isBoss = false) {
  const r = Math.random()
  if (isBoss) {
    if (r < 0.55) return 'attack'
    if (r < 0.77) return 'charge'
    if (r < 0.92) return 'shield'
    return 'regen'
  }
  if (r < 0.65) return 'attack'
  if (r < 0.80) return 'charge'
  if (r < 0.92) return 'shield'
  return 'regen'
}

function createEnemy(type, level) {
  const hpScale = Math.pow(1.15, level - 1)
  const atkScale = Math.pow(1.10, level - 1)
  return {
    id: ++_enemyIdCounter,
    typeId: type.id,
    name: type.name,
    emoji: type.emoji,
    hp: Math.round(type.baseHp * hpScale),
    maxHp: Math.round(type.baseHp * hpScale),
    atk: Math.round(type.baseAtk * atkScale),
    energyReward: type.energyReward,
    color: type.color,
    x: 0,
    y: 0,
    isBoss: false,
    isDead: false,
    hitFlash: false,
    nextAction: 'attack',
    burnTurns: 0,
  }
}

function createBoss(bossType, level) {
  const hpScale = Math.pow(1.15, level - 1)
  const atkScale = Math.pow(1.10, level - 1)
  return {
    id: ++_enemyIdCounter,
    typeId: bossType.id,
    name: bossType.name,
    emoji: bossType.emoji,
    hp: Math.round(60 * hpScale * bossType.hpMultiplier),
    maxHp: Math.round(60 * hpScale * bossType.hpMultiplier),
    atk: Math.round(8 * atkScale * bossType.atkMultiplier),
    energyReward: bossType.energyReward,
    color: bossType.color,
    x: 65,
    y: 38,
    isBoss: true,
    isDead: false,
    hitFlash: false,
    nextAction: 'attack',
    burnTurns: 0,
  }
}

function buildEncounterSizes(totalEnemies) {
  const sizes = []
  let remaining = totalEnemies
  while (remaining > 0) {
    const maxGroup = Math.min(3, remaining)
    const size = Math.floor(Math.random() * maxGroup) + 1
    sizes.push(size)
    remaining -= size
  }
  return sizes
}

function positionEnemies(enemies) {
  const n = enemies.length
  if (n === 1) {
    enemies[0].x = 65; enemies[0].y = 38
  } else if (n === 2) {
    enemies[0].x = 58; enemies[0].y = 28
    enemies[1].x = 72; enemies[1].y = 52
  } else {
    enemies[0].x = 55; enemies[0].y = 22
    enemies[1].x = 68; enemies[1].y = 42
    enemies[2].x = 55; enemies[2].y = 60
  }
}

export const useCombatStore = defineStore('combat', {
  state: () => ({
    encounterSizes: [],
    currentEncounterIdx: 0,
    totalEnemyCount: 0,
    enemiesDefeated: 0,

    enemies: [],
    phase: 'gun-select', // 'gun-select'|'combat'|'boss'|'between-level'|'game-over'|'meta-shop'
    bossSpawned: false,
    targetedEnemyId: null,

    currentTurn: 'player',
    powerStrikeCooldownTurns: 0,

    combatLog: [],
    shopOffers: [],
    perkOffers: [],

    // Game over stats
    lastRunShards: 0,
  }),

  getters: {
    activeEnemies(state) {
      return state.enemies.filter(e => !e.isDead)
    },

    currentTarget(state) {
      const active = state.enemies.filter(e => !e.isDead)
      if (state.targetedEnemyId) {
        const t = active.find(e => e.id === state.targetedEnemyId)
        if (t) return t
      }
      return active[0] || null
    },

    encounterProgress(state) {
      return {
        current: state.currentEncounterIdx + 1,
        total: state.encounterSizes.length,
        defeated: state.enemiesDefeated,
        totalEnemies: state.totalEnemyCount,
      }
    },

    isPowerReady(state) {
      return state.powerStrikeCooldownTurns === 0
    },
  },

  actions: {
    addLog(message, type = 'info') {
      this.combatLog.unshift({ message, type, id: Date.now() + Math.random() })
      if (this.combatLog.length > 6) this.combatLog.pop()
    },

    // ── Start / Spawn ─────────────────────────────────────────────────────────

    startRun(gun) {
      const char = useCharacterStore()
      const meta = useMetaStore()
      char.selectGun(gun)
      meta.applyToCharacter(char)   // apply persistent meta bonuses
      this.startLevel()
    },

    startLevel() {
      const char = useCharacterStore()
      const level = char.level
      const totalEnemies = 3 + level
      this.encounterSizes = buildEncounterSizes(totalEnemies)
      this.totalEnemyCount = totalEnemies
      this.currentEncounterIdx = 0
      this.enemiesDefeated = 0
      this.bossSpawned = false
      this.shopPhaseComplete = false
      this.phase = 'combat'
      this.currentTurn = 'player'
      this.powerStrikeCooldownTurns = 0
      this.enemies = []
      this.targetedEnemyId = null
      this._spawnCurrentEncounter()
      this.addLog(`Level ${level} — ${this.encounterSizes.length} encounters + boss!`, 'level')
    },

    _spawnCurrentEncounter() {
      const char = useCharacterStore()
      const level = char.level
      const count = this.encounterSizes[this.currentEncounterIdx]
      const availableTypes = getEnemyTypesForLevel(level)

      const spawned = []
      for (let i = 0; i < count; i++) {
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        spawned.push(createEnemy(type, level))
      }
      positionEnemies(spawned)

      this.enemies = spawned
      this.targetedEnemyId = spawned[0].id

      const encNum = this.currentEncounterIdx + 1
      const total = this.encounterSizes.length
      const label = count > 1 ? `${count} enemies` : `1 enemy`
      this.addLog(`Encounter ${encNum}/${total}: ${label}!`, 'level')
    },

    spawnBoss() {
      const char = useCharacterStore()
      const bossType = getBossForLevel(char.level)
      const boss = createBoss(bossType, char.level)
      this.enemies = [boss]
      this.bossSpawned = true
      this.phase = 'boss'
      this.targetedEnemyId = boss.id
      this.currentTurn = 'player'
      this.addLog(`⚠️ BOSS: ${bossType.name}!`, 'boss')
    },

    setTarget(enemyId) {
      const enemy = this.enemies.find(e => e.id === enemyId && !e.isDead)
      if (enemy) this.targetedEnemyId = enemyId
    },

    cycleTarget() {
      const alive = this.enemies.filter(e => !e.isDead)
      if (alive.length <= 1) return
      const currentIdx = alive.findIndex(e => e.id === this.targetedEnemyId)
      const next = alive[(currentIdx + 1) % alive.length]
      this.targetedEnemyId = next.id
    },

    // ── Player Actions ────────────────────────────────────────────────────────

    playerAttack() {
      if (this.currentTurn !== 'player') return
      if (this.phase !== 'combat' && this.phase !== 'boss') return
      const target = this.currentTarget
      if (!target) return

      this.currentTurn = 'enemy'
      this._performAttack(target)

      const char = useCharacterStore()
      if (char.doubleShot) {
        const t2 = this.currentTarget
        if (t2) this._performAttack(t2)
      }

      this._afterPlayerAction()
    },

    playerPowerAttack() {
      if (this.currentTurn !== 'player') return
      if (this.powerStrikeCooldownTurns > 0) return
      if (this.phase !== 'combat' && this.phase !== 'boss') return

      const meta = useMetaStore()
      this.powerStrikeCooldownTurns = meta.powerStrikeCooldown
      this.currentTurn = 'enemy'

      const char = useCharacterStore()
      const gun = char.selectedGun
      const targets = gun.special === 'pellet_spread'
        ? [...this.activeEnemies]
        : (this.currentTarget ? [this.currentTarget] : [])

      for (const target of targets) {
        if (target.isDead) continue
        const dmg = Math.round(char.totalAttack * 3)
        target.hp = Math.max(0, target.hp - dmg)
        target.hitFlash = true
        setTimeout(() => { if (target) target.hitFlash = false }, 250)
        this.addLog(`⚡ POWER → ${target.name}: -${dmg}!`, 'power')
        if (target.hp <= 0) {
          target.isDead = true
          this._onEnemyDeath(target)
        } else if (target.nextAction !== 'stunned' && Math.random() < 0.50) {
          target.nextAction = 'stunned'
          this.addLog(`💫 ${target.name} stunned!`, 'info')
        }
      }

      this._afterPlayerAction()
    },

    playerGuard() {
      if (this.currentTurn !== 'player') return
      if (this.phase !== 'combat' && this.phase !== 'boss') return
      const char = useCharacterStore()
      char.isGuarding = true
      this.currentTurn = 'enemy'
      this.addLog('🛡 Guard! Bracing for impact...', 'info')
      this._doEnemyTurn()
    },

    _performAttack(target) {
      if (!target || target.isDead) return
      const char = useCharacterStore()
      const gun = char.selectedGun

      for (let p = 0; p < gun.pellets; p++) {
        if (target.isDead) break

        let dmg = char.totalAttack
        let critChance = 0.10 + char.critBonus
        if (gun.special === 'low_hp_crit' && char.isLowHp) critChance += 0.15
        const isCrit = Math.random() < critChance
        if (isCrit) dmg = Math.round(dmg * 2)

        if (target.nextAction === 'shield') dmg = Math.round(dmg * 0.5)

        const actualDmg = Math.max(1, dmg)
        target.hp = Math.max(0, target.hp - actualDmg)
        target.hitFlash = true
        setTimeout(() => { if (target) target.hitFlash = false }, 250)

        const critText = isCrit ? ' CRIT!' : ''
        if (gun.pellets > 1) {
          this.addLog(`Pellet → ${target.name}: -${actualDmg}${critText}`, 'hit')
        } else {
          this.addLog(`${gun.name} → ${target.name}: -${actualDmg}${critText}`, 'hit')
        }

        if (isCrit && Math.random() < 0.30) {
          target.burnTurns = Math.max(target.burnTurns, 2)
          this.addLog(`🔥 ${target.name} ignites!`, 'burn')
        }

        if (char.lifeSteal > 0) {
          char.heal(Math.max(1, Math.round(actualDmg * char.lifeSteal)))
        }

        if (target.hp <= 0) {
          target.isDead = true
          this._onEnemyDeath(target)
        }
      }
    },

    _onEnemyDeath(enemy) {
      const char = useCharacterStore()
      char.addKill()
      char.gainEnergy(enemy.energyReward)
      this.enemiesDefeated++
      if (this.targetedEnemyId === enemy.id) this.targetedEnemyId = null
      this.addLog(`${enemy.name} defeated! +${Math.round(enemy.energyReward * char.energyMultiplier)} ⚡`, 'kill')
    },

    // ── Turn Resolution ───────────────────────────────────────────────────────

    _afterPlayerAction() {
      if (this._checkClear()) return
      this._doEnemyTurn()
    },

    _checkClear() {
      const alive = this.enemies.filter(e => !e.isDead)
      if (alive.length > 0) return false

      if (this.phase === 'boss') {
        this._onBossKill()
        return true
      }

      this.currentEncounterIdx++
      if (this.currentEncounterIdx >= this.encounterSizes.length) {
        this.addLog('All encounters cleared! BOSS incoming!', 'level')
        this.spawnBoss()
      } else {
        this._spawnCurrentEncounter()
        this.currentTurn = 'player'
      }
      return true
    },

    _doEnemyTurn() {
      const char = useCharacterStore()

      // Reset guard at start of enemy turn
      char.isGuarding = false

      // Process burn on all living enemies
      for (const enemy of this.enemies) {
        if (enemy.isDead || enemy.burnTurns <= 0) continue
        const burnDmg = Math.round(enemy.maxHp * 0.08)
        enemy.hp = Math.max(0, enemy.hp - burnDmg)
        enemy.burnTurns--
        this.addLog(`🔥 ${enemy.name} burns for -${burnDmg}!`, 'burn')
        if (enemy.hp <= 0) {
          enemy.isDead = true
          this._onEnemyDeath(enemy)
        }
      }

      // Enemy attacks
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue

        if (enemy.nextAction === 'stunned') {
          this.addLog(`💫 ${enemy.name} is stunned!`, 'info')
        } else if (enemy.nextAction === 'regen') {
          const healAmt = Math.round(enemy.maxHp * 0.10)
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt)
          this.addLog(`💚 ${enemy.name} regens ${healAmt} HP!`, 'info')
        } else {
          let atkDmg = enemy.atk
          if (enemy.nextAction === 'charge') atkDmg = Math.round(atkDmg * 2)
          const dmg = char.takeDamage(atkDmg)
          this.addLog(`${enemy.name}: -${dmg} HP`, 'damage')
          if (char.hp <= 0) {
            // Assign next actions before returning so we don't get stale state
            for (const e of this.enemies) {
              if (!e.isDead) e.nextAction = pickNextAction(e.isBoss)
            }
            if (this.powerStrikeCooldownTurns > 0) this.powerStrikeCooldownTurns--
            this._onPlayerDeath()
            return
          }
        }
      }

      // Assign next actions for all living enemies
      for (const enemy of this.enemies) {
        if (!enemy.isDead) {
          enemy.nextAction = pickNextAction(enemy.isBoss)
        }
      }

      if (this.powerStrikeCooldownTurns > 0) this.powerStrikeCooldownTurns--
      this.currentTurn = 'player'
    },

    // ── Phase Transitions ─────────────────────────────────────────────────────

    _onBossKill() {
      const char = useCharacterStore()
      this.addLog(`🏆 Boss defeated! Level ${char.level} cleared!`, 'level')
      this.phase = 'between-level'
      // Show 4 randomly picked shop items each time
      this.shopOffers = [...SHOP_ITEMS].sort(() => Math.random() - 0.5).slice(0, 4)
      this.perkOffers = getRandomPerks(3, char.equippedPerkIds)
    },

    _onPlayerDeath() {
      const char = useCharacterStore()
      const meta = useMetaStore()

      // Calculate and award void shards
      const shards = Math.floor(char.level * 15 + char.kills * 3 + (char.level - 1) * 25)
      this.lastRunShards = shards
      meta.earnShards(shards)
      meta.recordRun()
      meta.save()

      this.phase = 'game-over'
      this.addLog(`💀 Fell at level ${char.level}. +${shards} shards`, 'death')
    },

    // ── Meta Shop Navigation ──────────────────────────────────────────────────

    goToMetaShop() {
      this.phase = 'meta-shop'
    },

    exitMetaShop() {
      this.restartRun() // resets char + sets phase = 'gun-select'
    },

    // ── Shop / Perk ───────────────────────────────────────────────────────────

    buyShopItem(item) {
      const char = useCharacterStore()
      if (char.spendEnergy(item.cost)) {
        char.applyShopItem(item)
        this.addLog(`Bought: ${item.name}`, 'shop')
        return true
      }
      return false
    },

    pickPerk(perk) {
      const char = useCharacterStore()
      char.applyPerk(perk)
      this.addLog(`Perk acquired: ${perk.name}`, 'perk')
      char.advanceLevel()
      this.startLevel()
    },

    // ── Reset ─────────────────────────────────────────────────────────────────

    restartRun() {
      const char = useCharacterStore()
      char.resetForRun()
      this.encounterSizes = []
      this.currentEncounterIdx = 0
      this.totalEnemyCount = 0
      this.enemiesDefeated = 0
      this.enemies = []
      this.phase = 'gun-select'
      this.bossSpawned = false
      this.targetedEnemyId = null
      this.currentTurn = 'player'
      this.powerStrikeCooldownTurns = 0
      this.combatLog = []
      this.shopOffers = []
      this.perkOffers = []
    },
  },
})
