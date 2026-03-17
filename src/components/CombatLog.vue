<script setup>
import { useCombatStore } from '../stores/combat'

const combat = useCombatStore()

const typeColors = {
  hit:    'text-slate-300',
  crit:   'text-yellow-300',
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
  <div class="flex flex-col min-h-0 h-full p-3 bg-surface/40 rounded-xl border border-white/[0.05]">
    <div class="text-[11px] font-bold text-dim/80 uppercase tracking-widest mb-2 shrink-0">
      Combat Log
    </div>
    <div class="flex-1 overflow-y-auto flex flex-col-reverse min-h-0">
      <TransitionGroup name="log" tag="div" class="flex flex-col gap-1.5">
        <div
          v-for="entry in combat.combatLog"
          :key="entry.id"
          class="text-xs font-mono leading-snug"
          :class="typeColors[entry.type] ?? 'text-dim'"
        >
          {{ entry.message }}
        </div>
      </TransitionGroup>
      <div v-if="combat.combatLog.length === 0" class="text-xs text-dim italic">
        No events yet.
      </div>
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
