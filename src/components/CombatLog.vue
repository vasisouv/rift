<script setup>
import { useCombatStore } from '../stores/combat'

const combat = useCombatStore()

const typeColors = {
  hit:    'text-slate-300',
  kill:   'text-xp',
  damage: 'text-hp',
  level:  'text-energy',
  boss:   'text-boss',
  power:  'text-gold',
  shop:   'text-rate',
  perk:   'text-rate',
  death:  'text-hp',
  info:   'text-dim',
  burn:   'text-orange-400',
}
</script>

<template>
  <div class="flex flex-col gap-1 p-2 bg-surface/40 rounded-lg border border-white/[0.05]">
    <div class="text-[9px] text-dim uppercase tracking-widest mb-1">Combat Log</div>
    <TransitionGroup name="log" tag="div" class="flex flex-col gap-0.5 overflow-hidden">
      <div
        v-for="entry in combat.combatLog"
        :key="entry.id"
        class="text-[10px] font-mono leading-tight truncate transition-all duration-200"
        :class="typeColors[entry.type] ?? 'text-dim'"
      >
        {{ entry.message }}
      </div>
    </TransitionGroup>
    <div v-if="combat.combatLog.length === 0" class="text-[10px] text-dim italic">
      No events yet.
    </div>
  </div>
</template>

<style scoped>
.log-enter-active {
  transition: all 0.2s ease;
}
.log-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
