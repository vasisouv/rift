<script setup>
import { ref } from 'vue'
import { useCombatStore } from '../../stores/combat.js'
import BoardCard from '../BoardCard.vue'

const combat = useCombatStore()

const enemyHpPct = () => Math.max(0, (combat.enemyHp / combat.enemyMaxHp) * 100)

const heroDropOver = ref(false)
const cardDropOver = ref(null) // instanceId of card being hovered

function startAttackDrag(attackerId) {
  combat.attackingCardId = attackerId
}

// ── Hero drop zone ────────────────────────────────────────────────────────────

const isTargeting = () => !!(combat.attackingCardId || combat.spellTargetMode === 'enemy_card')

function onHeroDragOver(e) {
  if (!combat.attackingCardId) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  heroDropOver.value = true
}

function onHeroDragLeave() {
  heroDropOver.value = false
}

function onHeroDrop(e) {
  heroDropOver.value = false
  const attackerId = e.dataTransfer.getData('attackerId')
  if (!attackerId) return
  combat.attackingCardId = attackerId
  combat.attackTarget('enemy-hero')
}

// ── Enemy card drop zones ─────────────────────────────────────────────────────

function onCardDragOver(e, cardId) {
  if (!isTargeting()) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  cardDropOver.value = cardId
}

function onCardDragLeave() {
  cardDropOver.value = null
}

function onCardDrop(e, cardId) {
  cardDropOver.value = null
  const attackerId = e.dataTransfer.getData('attackerId')
  if (!attackerId) return
  combat.attackingCardId = attackerId
  combat.attackTarget(cardId)
}

function handleCardClick(cardId) {
  if (isTargeting()) combat.attackTarget(cardId)
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">

    <!-- Enemy hand (face-down cards) -->
    <div class="flex justify-center gap-1 min-h-[44px]">
      <div
        v-for="(_, i) in combat.enemyHand"
        :key="i"
        class="w-8 h-11 rounded bg-gradient-to-br from-hp/30 to-hp/10 border border-hp/20
               flex items-center justify-center text-[10px] text-hp/40"
      >
        ?
      </div>
    </div>

    <!-- Enemy mana -->
    <div class="text-xs text-center font-bold font-mono text-purple-300">
      {{ combat.enemyMana }}/{{ combat.enemyManaMax }} mana
    </div>

    <!-- Enemy hero (drop target) -->
    <div
      data-enemy-hero
      class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border transition-all duration-150 select-none"
      :class="heroDropOver
        ? 'border-hp bg-hp/20 ring-2 ring-hp/60 scale-105'
        : isTargeting()
          ? 'cursor-pointer border-hp/60 bg-hp/10 hover:bg-hp/20 ring-1 ring-hp/40'
          : 'border-transparent'"
      @click="isTargeting() && combat.attackTarget('enemy-hero')"
      @dragover="onHeroDragOver"
      @dragleave="onHeroDragLeave"
      @drop="onHeroDrop"
    >
      <div class="text-5xl leading-none">{{ combat.enemyEmoji }}</div>
      <div class="text-[10px] font-bold text-hp tracking-wide">{{ combat.enemyName }}</div>
      <div class="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="enemyHpPct() > 50 ? 'bg-red-500' : enemyHpPct() > 25 ? 'bg-orange-500' : 'bg-hp'"
          :style="{ width: enemyHpPct() + '%' }"
        />
      </div>
      <div class="text-[11px] font-mono font-bold text-hp">
        {{ combat.enemyHp }}<span class="text-dim text-[9px]">/{{ combat.enemyMaxHp }}</span>
      </div>
      <div v-if="heroDropOver" class="text-[9px] text-hp font-bold">⚔ Drop to attack</div>
      <div v-else-if="combat.spellTargetMode === 'enemy_card'" class="text-[9px] text-rate font-bold animate-pulse">✦ Cast here</div>
      <div v-else-if="combat.attackingCardId" class="text-[9px] text-hp font-bold animate-pulse">⚔ Attack Hero</div>
    </div>

    <!-- Enemy cards (each is a drop target) -->
    <TransitionGroup name="deploy" tag="div" class="flex items-center justify-center gap-2 min-h-[90px]">
      <div
        v-for="card in combat.enemyBoard"
        :key="card.instanceId"
        class="rounded-lg transition-all duration-100"
        :class="cardDropOver === card.instanceId ? 'ring-2 ring-hp scale-105' : ''"
        @dragover="onCardDragOver($event, card.instanceId)"
        @dragleave="onCardDragLeave"
        @drop="onCardDrop($event, card.instanceId)"
      >
        <BoardCard
          :card="card"
          :is-enemy="true"
          :is-attack-target="isTargeting()"
          @click="handleCardClick(card.instanceId)"
          @drag-attack-start="startAttackDrag"
        />
      </div>
      <div v-if="combat.enemyBoard.length === 0" key="empty" class="text-[10px] text-dim/40 italic">—</div>
    </TransitionGroup>

  </div>
</template>
