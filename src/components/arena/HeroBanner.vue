<script setup>
import { useCombatStore } from '../../stores/combat.js'
const combat = useCombatStore()
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-3 py-1.5 bg-surface/80 border border-white/[0.08] rounded-xl text-[11px]">

    <!-- Player mana -->
    <div class="flex items-center gap-1.5">
      <span class="text-dim uppercase tracking-wide">Mana</span>
      <div class="flex gap-0.5">
        <span
          v-for="i in combat.playerManaMax"
          :key="i"
          class="w-3 h-3 rounded-full border border-blue-400/60 transition-colors duration-150"
          :class="i <= combat.playerMana ? 'bg-blue-500' : 'bg-white/10'"
        />
      </div>
      <span class="font-mono font-bold text-blue-400">{{ combat.playerMana }}/{{ combat.playerManaMax }}</span>
    </div>

    <!-- Turn indicator -->
    <div class="flex items-center gap-1.5">
      <div
        class="w-1.5 h-1.5 rounded-full"
        :class="combat.currentTurn === 'player' ? 'bg-energy animate-pulse' : 'bg-hp animate-pulse'"
      />
      <span
        class="font-bold uppercase tracking-widest"
        :class="combat.currentTurn === 'player' ? 'text-energy' : 'text-hp'"
      >
        {{ combat.currentTurn === 'player' ? 'Your Turn' : 'Enemy…' }}
      </span>
    </div>

    <!-- Enemy mana -->
    <div class="flex items-center gap-1.5 flex-row-reverse">
      <span class="text-dim uppercase tracking-wide">Mana</span>
      <div class="flex gap-0.5 flex-row-reverse">
        <span
          v-for="i in combat.enemyManaMax"
          :key="i"
          class="w-3 h-3 rounded-full border border-purple-400/60 transition-colors duration-150"
          :class="i <= combat.enemyMana ? 'bg-purple-500' : 'bg-white/10'"
        />
      </div>
      <span class="font-mono font-bold text-purple-400">{{ combat.enemyMana }}/{{ combat.enemyManaMax }}</span>
    </div>

  </div>
</template>
