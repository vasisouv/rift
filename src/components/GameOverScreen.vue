<script setup>
import { computed } from 'vue'
import { useCombatStore } from '../stores/combat.js'
import { useMetaStore } from '../stores/meta.js'
import { getRift } from '../data/rifts.js'

const combat = useCombatStore()
const meta = useMetaStore()
const rift = computed(() => combat.currentRiftId ? getRift(combat.currentRiftId) : null)
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8">

    <!-- Death header -->
    <div class="text-center">
      <div class="text-6xl mb-3">💀</div>
      <h2 class="text-4xl font-extrabold tracking-[0.3em] text-hp glow-hp uppercase mb-1">
        You Died
      </h2>
      <p v-if="rift" class="text-dim text-sm">
        {{ rift.emoji }} {{ rift.name }} — Battle {{ combat.battleIndex + 1 }} of {{ rift.battles + 1 }}
      </p>
      <p v-else class="text-dim text-sm">The void claims another warrior.</p>
    </div>

    <!-- Shard reward (prominent) -->
    <div class="flex items-center gap-3 px-6 py-4 bg-gold/10 border border-gold/40 rounded-xl">
      <span class="text-3xl">💎</span>
      <div>
        <div class="text-2xl font-extrabold text-gold glow-gold">+{{ combat.lastRunShards }}</div>
        <div class="text-[11px] text-dim uppercase tracking-widest">Void Shards earned</div>
      </div>
      <div class="ml-4 pl-4 border-l border-gold/20 text-sm text-dim">
        <div class="font-mono text-gold">{{ meta.voidShards }} total</div>
        <div class="text-[10px]">available to spend</div>
      </div>
    </div>

    <!-- Run stats -->
    <div class="flex flex-col gap-2 p-4 bg-surface border border-white/10 rounded-xl min-w-52">
      <div class="text-[10px] text-dim uppercase tracking-widest text-center mb-1">Run Summary</div>

      <div v-if="rift" class="flex justify-between items-center text-sm">
        <span class="text-dim">Battle Reached</span>
        <span class="text-energy font-bold glow-energy-sm">{{ combat.battleIndex + 1 }} / {{ rift.battles + 1 }}</span>
      </div>
      <div v-else class="flex justify-between items-center text-sm">
        <span class="text-dim">Level Reached</span>
        <span class="text-energy font-bold glow-energy-sm">{{ combat.level }}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Cards Destroyed</span>
        <span class="text-xp font-bold">{{ combat.cardsDestroyed }}</span>
      </div>

      <div v-if="combat.equippedPerkIds.length > 0" class="pt-2 border-t border-white/[0.06]">
        <div class="text-[9px] text-dim uppercase tracking-widest mb-1">Perks Collected</div>
        <div class="flex flex-wrap gap-1">
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

    <!-- Runs summary -->
    <div class="text-[11px] text-dim text-center">
      Run #{{ meta.totalRuns }} · {{ meta.totalShardsEarned }} shards earned lifetime
    </div>

    <!-- Action buttons -->
    <div class="flex gap-4">
      <button
        class="px-6 py-3 bg-rate/10 border-2 border-rate/50 rounded-xl
               text-rate font-bold text-sm tracking-widest uppercase
               hover:bg-rate/20 hover:scale-105 active:scale-95 transition-all duration-150"
        @click="combat.goToMetaShop()"
      >
        💎 Void Shop
      </button>

      <button
        class="px-8 py-3 bg-energy/10 border-2 border-energy rounded-xl
               text-energy font-bold text-lg tracking-widest uppercase
               hover:bg-energy/20 hover:scale-105 active:scale-95 transition-all duration-150
               glow-energy-sm"
        @click="combat.restartRift()"
      >
        Try Again
      </button>

      <button
        v-if="rift"
        class="px-6 py-3 bg-surface border-2 border-white/20 rounded-xl
               text-dim font-bold text-sm tracking-widest uppercase
               hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-150"
        @click="combat.restartRun()"
      >
        Back to Hub
      </button>
    </div>

  </div>
</template>
