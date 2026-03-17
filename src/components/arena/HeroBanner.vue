<script setup>
import { useCombatStore } from '../../stores/combat.js'
const combat = useCombatStore()
</script>

<template>
  <div class="flex items-center justify-between gap-4 px-4 py-3 bg-surface/90 border border-white/[0.08] rounded-xl">

    <!-- Player mana -->
    <div class="flex flex-col gap-1.5 flex-1">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Mana</span>
        <span class="text-sm font-mono font-bold text-blue-300">
          {{ combat.playerMana }}<span class="text-xs text-dim">/{{ combat.playerManaMax }}</span>
        </span>
      </div>
      <div class="flex gap-0.5 h-2.5">
        <div
          v-for="i in combat.playerManaMax"
          :key="i"
          class="flex-1 rounded-sm transition-all duration-200"
          :class="i <= combat.playerMana ? 'bg-blue-500' : 'bg-white/10'"
        />
      </div>
    </div>

    <!-- Turn indicator -->
    <div class="flex flex-col items-center gap-1 px-4 shrink-0">
      <div
        class="text-xs font-extrabold uppercase tracking-[0.2em] transition-colors duration-300 whitespace-nowrap"
        :class="combat.currentTurn === 'player' ? 'text-energy' : 'text-hp'"
      >
        {{ combat.currentTurn === 'player' ? 'Your Turn' : 'Enemy…' }}
      </div>
      <div
        class="w-1.5 h-1.5 rounded-full animate-pulse"
        :class="combat.currentTurn === 'player' ? 'bg-energy' : 'bg-hp'"
      />
    </div>

    <!-- Enemy mana -->
    <div class="flex flex-col gap-1.5 flex-1 items-end">
      <div class="flex items-center justify-between w-full">
        <span class="text-sm font-mono font-bold text-purple-300">
          {{ combat.enemyMana }}<span class="text-xs text-dim">/{{ combat.enemyManaMax }}</span>
        </span>
        <span class="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Mana</span>
      </div>
      <div class="flex gap-0.5 h-2.5 w-full">
        <div
          v-for="i in combat.enemyManaMax"
          :key="i"
          class="flex-1 rounded-sm transition-all duration-200"
          :class="i <= combat.enemyMana ? 'bg-purple-500' : 'bg-white/10'"
        />
      </div>
    </div>

  </div>
</template>
