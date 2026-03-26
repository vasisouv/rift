<script setup>
import { useCombatStore } from '../../stores/combat.js'
import HandCard from '../HandCard.vue'

const combat = useCombatStore()
</script>

<template>
  <div class="flex flex-col gap-2 overflow-visible">
    <div class="flex items-center justify-between px-1">
      <span class="text-[10px] text-dim uppercase tracking-widest">Hand ({{ combat.playerHand.length }})</span>
      <span class="text-[10px] text-dim">Deck: {{ combat.playerDeck.length }}</span>
    </div>

    <div class="overflow-x-auto overflow-y-visible" style="scrollbar-width: thin">
    <div class="flex items-end gap-1 md:gap-2 pb-1 pt-4 pl-2 md:pl-4 min-h-[80px] md:min-h-[100px]">
      <HandCard
        v-for="card in combat.playerHand"
        :key="card.instanceId"
        :card="card"
        :selected="combat.selectedHandCardId === card.instanceId"
        :affordable="card.manaCost <= combat.playerMana && combat.currentTurn === 'player'"
        @click="combat.selectHandCard(card.instanceId)"
      />

      <div v-if="combat.playerHand.length === 0" class="text-[10px] text-dim italic self-center w-full text-center">
        No cards in hand
      </div>
    </div>
    </div>

    <!-- Instruction hint -->
    <div v-if="combat.spellTargetMode" class="text-[10px] text-rate text-center animate-pulse">
      {{ combat.spellTargetMode === 'enemy_card' ? 'Select an enemy target for your spell' : 'Select a friendly card to buff' }}
      — click spell again to cancel
    </div>
    <div v-else-if="combat.selectedHandCardId" class="text-[10px] text-energy text-center animate-pulse">
      Click your board to deploy — or click a card again to deselect
    </div>
  </div>
</template>
