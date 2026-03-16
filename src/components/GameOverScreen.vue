<script setup>
import { useCharacterStore } from '../stores/character'
import { useCombatStore } from '../stores/combat'
import { useMetaStore } from '../stores/meta'

const char = useCharacterStore()
const combat = useCombatStore()
const meta = useMetaStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8">

    <!-- Death header -->
    <div class="text-center">
      <div class="text-6xl mb-3">💀</div>
      <h2 class="text-4xl font-extrabold tracking-[0.3em] text-hp glow-hp uppercase mb-1">
        You Died
      </h2>
      <p class="text-dim text-sm">The void claims another warrior.</p>
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

      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Level Reached</span>
        <span class="text-energy font-bold glow-energy-sm">{{ char.level }}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Enemies Killed</span>
        <span class="text-xp font-bold">{{ char.kills }}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-dim">Gun Used</span>
        <span class="text-gold">{{ char.selectedGun?.name ?? '—' }}</span>
      </div>

      <div v-if="char.equippedPerkIds.length > 0" class="pt-2 border-t border-white/[0.06]">
        <div class="text-[9px] text-dim uppercase tracking-widest mb-1">Perks Collected</div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="id in char.equippedPerkIds"
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
        @click="combat.restartRun()"
      >
        Try Again
      </button>
    </div>

  </div>
</template>
