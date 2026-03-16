<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCombatStore } from '../stores/combat'
import { useCharacterStore } from '../stores/character'

const combat = useCombatStore()
const char = useCharacterStore()

function onKeyDown(e) {
  // Ignore if typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (combat.currentTurn !== 'player') return
  if (combat.phase !== 'combat' && combat.phase !== 'boss') return

  if (e.code === 'KeyA' || e.code === 'Space') {
    e.preventDefault()
    combat.playerAttack()
  } else if (e.code === 'KeyS' || e.code === 'KeyE') {
    e.preventDefault()
    combat.playerPowerAttack()
  } else if (e.code === 'KeyD') {
    e.preventDefault()
    combat.playerGuard()
  } else if (e.code === 'Tab') {
    e.preventDefault()
    combat.cycleTarget()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-3 bg-surface/90 border-t border-white/[0.08]">

    <!-- Turn indicator -->
    <div class="w-28 text-center shrink-0">
      <div
        v-if="combat.currentTurn === 'player'"
        class="text-xs font-bold text-energy tracking-widest uppercase"
        style="animation: pulseGlow 1.5s ease-in-out infinite"
      >
        ▶ YOUR TURN
      </div>
      <div v-else class="text-xs font-bold text-hp tracking-widest uppercase opacity-60">
        ⏳ ENEMY...
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 items-center justify-center flex-1">

      <!-- Attack [A / Space] -->
      <button
        :disabled="combat.currentTurn !== 'player'"
        class="relative px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide border transition-all duration-100
               active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed select-none
               bg-energy/10 border-energy/50 text-energy hover:bg-energy/25 hover:border-energy"
        @click="combat.playerAttack()"
      >
        ⚔️ Attack
        <kbd class="absolute -top-2 -right-2 text-[9px] px-1 py-0.5 bg-void border border-white/20 rounded text-dim font-mono leading-none">A</kbd>
      </button>

      <!-- Power Strike [S / E] -->
      <button
        :disabled="combat.currentTurn !== 'player' || !combat.isPowerReady"
        class="relative px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide border transition-all duration-100
               active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed select-none
               bg-boss/10 border-boss/50 text-boss hover:bg-boss/25 hover:border-boss"
        @click="combat.playerPowerAttack()"
      >
        ⚡ Power Strike
        <span v-if="!combat.isPowerReady" class="text-xs ml-1 opacity-70">
          ({{ combat.powerStrikeCooldownTurns }})
        </span>
        <kbd class="absolute -top-2 -right-2 text-[9px] px-1 py-0.5 bg-void border border-white/20 rounded text-dim font-mono leading-none">S</kbd>
      </button>

      <!-- Guard [D] -->
      <button
        :disabled="combat.currentTurn !== 'player'"
        class="relative px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide border transition-all duration-100
               active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed select-none
               bg-slate-500/10 border-slate-500/50 text-slate-300 hover:bg-slate-500/25 hover:border-slate-400"
        @click="combat.playerGuard()"
      >
        🛡 Guard
        <kbd class="absolute -top-2 -right-2 text-[9px] px-1 py-0.5 bg-void border border-white/20 rounded text-dim font-mono leading-none">D</kbd>
      </button>

    </div>

    <!-- Target info + Tab hint -->
    <div class="w-28 text-center shrink-0">
      <template v-if="combat.currentTarget">
        <div class="text-[9px] text-dim uppercase tracking-widest mb-0.5">
          Target
          <span v-if="combat.activeEnemies.length > 1" class="text-dim/60 normal-case">
            [<kbd class="text-[9px] font-mono">Tab</kbd>]
          </span>
        </div>
        <div class="text-xs font-bold truncate" :style="{ color: combat.currentTarget.color }">
          {{ combat.currentTarget.name }}
        </div>
        <div class="text-[10px] font-mono text-dim">
          {{ combat.currentTarget.hp }} HP
        </div>
      </template>
      <div v-else class="text-[10px] text-dim">—</div>
    </div>

  </div>
</template>
