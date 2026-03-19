<script setup>
import { useCombatStore } from '../stores/combat.js'
import { useMetaStore } from '../stores/meta.js'
import { getRift, RIFTS } from '../data/rifts.js'

const combat = useCombatStore()
const meta = useMetaStore()

const rift = getRift(combat.currentRiftId)
const allComplete = meta.allRiftsCompleted

function nextRift() {
  const nextIndex = (rift?.index ?? 0) + 1
  if (nextIndex < RIFTS.length) {
    combat.startRun(RIFTS[nextIndex].id)
  } else {
    combat.restartRun()
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8">

    <!-- Victory header -->
    <div class="text-center">
      <div class="text-6xl mb-3">{{ rift?.emoji ?? '🏆' }}</div>
      <h2 class="text-4xl font-extrabold tracking-[0.3em] uppercase mb-1"
          :style="{ color: rift?.color ?? '#44ff88' }">
        Rift Cleared!
      </h2>
      <p class="text-lg text-slate-300 font-semibold">{{ rift?.name }}</p>
      <p class="text-sm text-dim mt-1">{{ rift?.boss?.name }} has been defeated.</p>
    </div>

    <!-- Shard reward -->
    <div class="flex items-center gap-3 px-6 py-4 bg-gold/10 border border-gold/40 rounded-xl">
      <span class="text-3xl">💎</span>
      <div>
        <div class="text-2xl font-extrabold text-gold glow-gold">+{{ combat.lastRunShards }}</div>
        <div class="text-[11px] text-dim uppercase tracking-widest">Completion Bonus</div>
      </div>
      <div class="ml-4 pl-4 border-l border-gold/20 text-sm text-dim">
        <div class="font-mono text-gold">{{ meta.voidShards }} total</div>
        <div class="text-[10px]">available to spend</div>
      </div>
    </div>

    <!-- Run stats -->
    <div class="flex flex-col gap-2 p-4 bg-surface border border-white/10 rounded-xl min-w-52">
      <div class="text-[10px] text-dim uppercase tracking-widest text-center mb-1">Run Summary</div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Battles Won</span>
        <span class="text-energy font-bold">{{ (rift?.battles ?? 4) + 1 }}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Cards Destroyed</span>
        <span class="text-xp font-bold">{{ combat.cardsDestroyed }}</span>
      </div>
    </div>

    <!-- All rifts complete message -->
    <div v-if="allComplete" class="text-center px-6 py-4 bg-energy/10 border border-energy/40 rounded-xl max-w-sm">
      <div class="text-2xl mb-2">🏆</div>
      <div class="text-energy font-extrabold text-lg uppercase tracking-widest mb-1">Campaign Complete!</div>
      <div class="text-sm text-dim">You have conquered all 6 Rifts. The void bows before you.</div>
    </div>

    <!-- Rift progress -->
    <div class="flex gap-2">
      <div
        v-for="r in RIFTS"
        :key="r.id"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm border"
        :class="meta.isRiftCompleted(r.id)
          ? 'bg-energy/20 border-energy/60'
          : 'bg-surface border-white/10 opacity-40'"
        :title="r.name"
      >
        {{ meta.isRiftCompleted(r.id) ? '✓' : r.emoji }}
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-4">
      <button
        v-if="!allComplete"
        class="px-8 py-3 bg-energy/10 border-2 border-energy rounded-xl
               text-energy font-bold text-lg tracking-widest uppercase
               hover:bg-energy/20 hover:scale-105 active:scale-95 transition-all
               duration-150 glow-energy-sm"
        @click="nextRift()"
      >
        Next Rift →
      </button>

      <button
        class="px-6 py-3 bg-surface border-2 border-white/20 rounded-xl
               text-dim font-bold text-sm tracking-widest uppercase
               hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-150"
        @click="combat.restartRun()"
      >
        Return to Hub
      </button>
    </div>

  </div>
</template>
