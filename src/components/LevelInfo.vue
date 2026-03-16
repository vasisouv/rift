<script setup>
import { useCombatStore } from '../stores/combat.js'
const combat = useCombatStore()
</script>

<template>
  <div class="flex flex-col gap-3">

    <!-- Level -->
    <div class="text-center">
      <div class="text-[10px] text-dim uppercase tracking-widest">Level</div>
      <div class="text-3xl font-extrabold text-energy glow-energy">{{ combat.level }}</div>
    </div>

    <!-- Deck sizes -->
    <div class="flex flex-col gap-1.5 p-3 bg-surface border border-white/[0.08] rounded-lg">
      <div class="text-[10px] text-dim uppercase tracking-widest mb-1">Decks</div>
      <div class="flex justify-between text-xs">
        <span class="text-dim">Your deck</span>
        <span class="font-mono text-energy">{{ combat.playerDeck.length }}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-dim">Your hand</span>
        <span class="font-mono text-energy">{{ combat.playerHand.length }}</span>
      </div>
      <div class="w-full h-px bg-white/[0.06] my-1" />
      <div class="flex justify-between text-xs">
        <span class="text-dim">Enemy deck</span>
        <span class="font-mono text-hp">{{ combat.enemyDeck.length }}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-dim">Enemy hand</span>
        <span class="font-mono text-hp">{{ combat.enemyHand.length }}</span>
      </div>
    </div>

    <!-- Gold -->
    <div class="flex justify-between items-center p-2 bg-surface border border-white/[0.08] rounded-lg">
      <span class="text-[10px] text-dim uppercase tracking-wide">Gold</span>
      <span class="font-bold text-gold font-mono">{{ combat.gold }} 🪙</span>
    </div>

    <!-- Equipped perks -->
    <div v-if="combat.equippedPerkIds.length > 0" class="p-2 bg-surface border border-white/[0.08] rounded-lg">
      <div class="text-[10px] text-dim uppercase tracking-widest mb-1.5">Perks</div>
      <div class="flex flex-col gap-1">
        <span
          v-for="id in combat.equippedPerkIds"
          :key="id"
          class="text-[9px] px-1.5 py-0.5 bg-rate/20 border border-rate/30 rounded text-rate"
        >
          {{ id.replace(/_/g, ' ') }}
        </span>
      </div>
    </div>

  </div>
</template>
