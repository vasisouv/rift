<script setup>
import { useCombatStore } from '../stores/combat.js'
const combat = useCombatStore()
</script>

<template>
  <div class="flex flex-col gap-2.5">

    <!-- Level badge -->
    <div class="relative flex flex-col items-center py-3 bg-surface border border-energy/20 rounded-xl overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-energy to-transparent opacity-70" />
      <div class="text-[11px] font-bold text-energy/50 uppercase tracking-[0.35em]">Level</div>
      <div class="text-5xl font-extrabold text-energy glow-energy leading-none mt-0.5">{{ combat.level }}</div>
    </div>

    <!-- Deck sizes -->
    <div class="p-3 bg-surface border border-white/[0.08] rounded-xl">
      <div class="text-[11px] font-bold text-dim/80 uppercase tracking-widest mb-2.5">Decks</div>
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Your deck</span>
          <span class="text-sm font-bold font-mono text-energy">{{ combat.playerDeck.length }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Your hand</span>
          <span class="text-sm font-bold font-mono text-energy">{{ combat.playerHand.length }}</span>
        </div>
        <div class="w-full h-px bg-white/[0.07] my-0.5" />
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Enemy deck</span>
          <span class="text-sm font-bold font-mono text-hp">{{ combat.enemyDeck.length }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Enemy hand</span>
          <span class="text-sm font-bold font-mono text-hp">{{ combat.enemyHand.length }}</span>
        </div>
      </div>
    </div>

    <!-- Gold -->
    <div class="flex justify-between items-center px-3 py-2.5 bg-surface border border-white/[0.08] rounded-xl">
      <span class="text-[11px] font-bold text-dim/80 uppercase tracking-widest">Gold</span>
      <span class="text-base font-bold text-gold font-mono tracking-wide">{{ combat.gold }} 🪙</span>
    </div>

    <!-- Equipped perks -->
    <div v-if="combat.equippedPerkIds.length > 0" class="p-3 bg-surface border border-rate/20 rounded-xl">
      <div class="text-[11px] font-bold text-dim/80 uppercase tracking-widest mb-2">Perks</div>
      <div class="flex flex-col gap-1.5">
        <span
          v-for="id in combat.equippedPerkIds"
          :key="id"
          class="text-xs px-2 py-1 bg-rate/10 border border-rate/25 rounded-md text-rate capitalize"
        >
          {{ id.replace(/_/g, ' ') }}
        </span>
      </div>
    </div>

  </div>
</template>
