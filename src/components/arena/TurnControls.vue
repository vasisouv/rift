<script setup>
import { useCombatStore } from '../../stores/combat.js'
const combat = useCombatStore()
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-2 bg-surface/80 border border-white/[0.08] rounded-xl">

    <!-- Turn indicator -->
    <div class="flex items-center gap-2">
      <div
        class="w-2 h-2 rounded-full transition-colors duration-300"
        :class="combat.currentTurn === 'player' ? 'bg-energy animate-pulse' : 'bg-hp animate-pulse'"
      />
      <span
        class="text-xs font-bold uppercase tracking-widest"
        :class="combat.currentTurn === 'player' ? 'text-energy' : 'text-hp'"
      >
        {{ combat.currentTurn === 'player' ? 'Your Turn' : 'Enemy Turn…' }}
      </span>
    </div>

    <!-- Player mana -->
    <div class="flex items-center gap-2 flex-1 mx-4">
      <span class="text-sm font-bold text-blue-400 uppercase tracking-widest shrink-0">Mana</span>
      <div class="flex gap-1 flex-1">
        <div
          v-for="i in combat.playerManaMax"
          :key="i"
          class="flex-1 h-4 rounded-sm transition-all duration-200"
          :class="i <= combat.playerMana ? 'bg-blue-500' : 'bg-white/10'"
        />
      </div>
      <span class="text-lg font-extrabold font-mono text-blue-300 shrink-0">
        {{ combat.playerMana }}<span class="text-sm text-dim">/{{ combat.playerManaMax }}</span>
      </span>
    </div>

    <!-- End Turn button -->
    <button
      class="px-5 py-1.5 rounded-lg font-bold text-xs tracking-widest uppercase border-2 transition-all duration-150"
      :class="combat.currentTurn === 'player'
        ? 'bg-energy/10 border-energy text-energy hover:bg-energy/20 hover:scale-105 active:scale-95 cursor-pointer'
        : 'bg-surface border-white/10 text-dim cursor-not-allowed opacity-50'"
      :disabled="combat.currentTurn !== 'player'"
      @click="combat.currentTurn === 'player' && combat.endPlayerTurn()"
    >
      End Turn
    </button>
  </div>
</template>
