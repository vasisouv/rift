<script setup>
import { useMetaStore } from '../stores/meta'
import { useCombatStore } from '../stores/combat'
import { META_UPGRADES, getUpgradeCost } from '../data/metaUpgrades'

const meta = useMetaStore()
const combat = useCombatStore()

function buy(upgrade) {
  meta.buyUpgrade(upgrade.id)
}

function level(id) {
  return meta.purchasedLevels[id] ?? 0
}

function cost(upgrade) {
  const lvl = level(upgrade.id)
  if (lvl >= upgrade.maxLevel) return null
  return getUpgradeCost(upgrade, lvl)
}

function canAfford(upgrade) {
  const c = cost(upgrade)
  return c !== null && meta.voidShards >= c
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 px-4 py-8 flex-1 overflow-y-auto">

    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-extrabold tracking-[0.3em] text-rate glow-rate uppercase">
        Void Shop
      </h2>
      <p class="text-dim text-sm mt-1">Permanent upgrades that carry into every future run.</p>
    </div>

    <!-- Shard count -->
    <div class="flex items-center gap-3 px-6 py-3 bg-surface border border-white/10 rounded-xl">
      <span class="text-2xl">💎</span>
      <div>
        <div class="text-xl font-extrabold text-gold glow-gold">{{ meta.voidShards }}</div>
        <div class="text-[10px] text-dim uppercase tracking-widest">Void Shards available</div>
      </div>
      <div class="ml-6 pl-6 border-l border-white/10">
        <div class="text-sm text-dim font-mono">{{ meta.totalRuns }} runs</div>
        <div class="text-[10px] text-dim">{{ meta.totalShardsEarned }} total earned</div>
      </div>
    </div>

    <!-- Upgrade grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
      <div
        v-for="upgrade in META_UPGRADES"
        :key="upgrade.id"
        class="flex flex-col gap-2 p-3 rounded-xl border transition-all duration-150"
        :class="[
          level(upgrade.id) >= upgrade.maxLevel
            ? 'bg-xp/5 border-xp/30 opacity-75'
            : canAfford(upgrade)
              ? 'bg-surface border-rate/40 hover:border-rate hover:bg-rate/5 cursor-pointer'
              : 'bg-surface border-white/10 opacity-60 cursor-not-allowed',
        ]"
        @click="canAfford(upgrade) && buy(upgrade)"
      >
        <!-- Icon + name -->
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ upgrade.icon }}</span>
          <div class="text-xs font-bold text-slate-200 leading-tight">{{ upgrade.name }}</div>
        </div>

        <!-- Level bar -->
        <div class="flex gap-0.5">
          <div
            v-for="i in upgrade.maxLevel"
            :key="i"
            class="h-1 flex-1 rounded-full transition-all duration-200"
            :class="i <= level(upgrade.id) ? 'bg-rate' : 'bg-white/10'"
          />
        </div>

        <!-- Description -->
        <div class="text-[10px] text-dim leading-relaxed flex-1">
          {{ upgrade.desc }}
          <span v-if="upgrade.maxLevel > 1" class="text-white/40">
            ({{ level(upgrade.id) }}/{{ upgrade.maxLevel }})
          </span>
        </div>

        <!-- Cost / status -->
        <div class="text-center mt-auto">
          <div v-if="level(upgrade.id) >= upgrade.maxLevel" class="text-[10px] text-xp font-bold tracking-widest uppercase">
            MAX
          </div>
          <div v-else class="text-xs font-bold font-mono" :class="canAfford(upgrade) ? 'text-gold' : 'text-hp'">
            💎 {{ cost(upgrade) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Hint -->
    <p class="text-[10px] text-dim text-center">Click an upgrade to purchase. Upgrades apply automatically next run.</p>

    <!-- Back button -->
    <button
      class="px-8 py-2.5 bg-surface border border-white/20 rounded-lg text-dim text-sm
             hover:border-energy hover:text-energy transition-colors"
      @click="combat.exitMetaShop()"
    >
      ← Back to Arsenal
    </button>

  </div>
</template>
