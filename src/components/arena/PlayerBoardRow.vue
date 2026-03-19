<script setup>
import { ref } from 'vue'
import { useCombatStore } from '../../stores/combat.js'
import BoardCard from '../BoardCard.vue'

const combat = useCombatStore()
const dragOver = ref(false)

function startAttackDrag(attackerId) {
  combat.attackingCardId = attackerId
}

function onAttackDragEnd() {
  // attackTarget already clears this on success; clear it here on cancelled drags
  combat.attackingCardId = null
}

const playerHpPct = () => Math.max(0, (combat.playerHp / combat.playerMaxHp) * 100)

function canAttack(card) {
  return !card.hasSummoningSickness && !card.hasAttackedThisTurn && combat.currentTurn === 'player'
}

function onDragOver(e) {
  if (combat.currentTurn !== 'player' || combat.playerBoard.length >= 5) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e) {
  dragOver.value = false
  const cardId = e.dataTransfer.getData('cardId')
  if (!cardId) return
  // Select then play
  combat.selectHandCard(cardId)
  combat.playCardToBoard()
}
</script>

<template>
  <div
    class="h-full flex flex-col items-center gap-2 rounded-lg transition-colors duration-150"
    :class="dragOver ? 'bg-energy/10 ring-2 ring-energy/50' : ''"
    @click="combat.selectedHandCardId && combat.playCardToBoard()"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >

    <!-- Player cards -->
    <TransitionGroup name="deploy" tag="div" class="flex items-center justify-center gap-2 min-h-[90px]">
      <BoardCard
        v-for="card in combat.playerBoard"
        :key="card.instanceId"
        :card="card"
        :selected="combat.attackingCardId === card.instanceId"
        :can-attack="canAttack(card)"
        :is-enemy="false"
        :is-spell-target="combat.spellTargetMode === 'friendly_card'"
        @click="combat.selectBoardCard(card.instanceId)"
        @drag-attack-start="startAttackDrag"
        @drag-attack-end="onAttackDragEnd"
      />
      <div v-if="combat.playerBoard.length === 0" key="empty" class="text-[10px] italic">
        <span v-if="dragOver" class="text-energy font-bold">Drop to deploy</span>
        <span v-else-if="combat.selectedHandCardId" class="text-energy/60 animate-pulse">Click to deploy</span>
        <span v-else class="text-dim/40">—</span>
      </div>
    </TransitionGroup>

    <!-- Player hero — pinned to bottom -->
    <div data-player-hero class="mt-auto flex flex-col items-center gap-1 px-4 py-2 select-none" @click.stop>
      <div class="text-5xl leading-none">🧙</div>
      <div class="text-[10px] font-bold text-energy tracking-wide">You</div>
      <div class="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="playerHpPct() > 50 ? 'bg-green-500' : playerHpPct() > 25 ? 'bg-yellow-500' : 'bg-hp'"
          :style="{ width: playerHpPct() + '%' }"
        />
      </div>
      <div class="text-[11px] font-mono font-bold text-energy">
        {{ combat.playerHp }}<span class="text-dim text-[9px]">/{{ combat.playerMaxHp }}</span>
      </div>
    </div>

  </div>
</template>
