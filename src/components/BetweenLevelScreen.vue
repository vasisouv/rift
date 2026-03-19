<script setup>
import { ref, computed } from 'vue'
import { useCombatStore } from '../stores/combat.js'
import { getRift } from '../data/rifts.js'

const combat = useCombatStore()
const selectedPerk = ref(null)
const rift = computed(() => combat.currentRiftId ? getRift(combat.currentRiftId) : null)
const battleNum = computed(() => combat.battleIndex + 1)
const totalBattles = computed(() => rift.value ? rift.value.battles + 1 : null)
const bossNext = computed(() => rift.value && combat.battleIndex + 1 >= rift.value.battles)

function selectPerk(perk) {
  selectedPerk.value = perk
}

function advance() {
  if (!selectedPerk.value) return
  combat.pickPerk(selectedPerk.value)
  selectedPerk.value = null
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 px-6 py-6 flex-1 overflow-y-auto">

    <!-- Header -->
    <div class="text-center">
      <div v-if="rift" class="text-xs text-xp uppercase tracking-[0.3em] mb-1">
        {{ rift.emoji }} {{ rift.name }} — Battle {{ battleNum }} of {{ totalBattles }} cleared!
      </div>
      <div v-else class="text-xs text-xp uppercase tracking-[0.3em] mb-1">Level {{ combat.level }} cleared!</div>
      <h2 class="text-xl font-extrabold text-energy glow-energy tracking-widest uppercase">
        Upgrade your deck
      </h2>
      <div v-if="bossNext" class="mt-2 text-sm font-bold text-hp animate-pulse">
        ⚠ Boss fight next!
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="flex gap-6 w-full max-w-3xl items-start">

      <!-- LEFT: Shop (4 items, optional) -->
      <div class="flex flex-col gap-3 flex-1">
        <div class="flex items-center justify-between">
          <h3 class="text-xs text-dim uppercase tracking-widest">Shop</h3>
          <span class="text-gold font-bold font-mono text-sm">{{ combat.gold }} 🪙</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="item in combat.shopOffers"
            :key="item.id"
            class="flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-100"
            :class="[
              combat.gold >= item.cost
                ? 'bg-surface border-white/15 cursor-pointer hover:border-energy hover:bg-energy/5 active:scale-95'
                : 'bg-surface/50 border-white/[0.06] opacity-45 cursor-not-allowed',
            ]"
            @click="combat.gold >= item.cost && combat.buyShopItem(item)"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ item.emoji }}</span>
              <span class="text-xs font-semibold text-slate-200">{{ item.name }}</span>
            </div>
            <div class="text-[10px] text-dim">{{ item.desc }}</div>
            <div class="text-xs font-bold font-mono mt-auto" :class="combat.gold >= item.cost ? 'text-gold' : 'text-hp'">
              {{ item.cost }} 🪙
            </div>
          </div>
        </div>

        <div class="text-[10px] text-dim text-center mt-1">
          Buy as many as you can afford. Optional.
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px self-stretch bg-white/[0.07]" />

      <!-- RIGHT: Perk pick (required) -->
      <div class="flex flex-col gap-3 w-52">
        <h3 class="text-xs text-dim uppercase tracking-widest">
          Choose a Perk <span class="text-hp">*</span>
        </h3>

        <div class="flex flex-col gap-2">
          <div
            v-for="perk in combat.perkOffers"
            :key="perk.id"
            class="flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all duration-100 active:scale-95"
            :class="[
              selectedPerk?.id === perk.id
                ? 'bg-rate/15 border-rate ring-1 ring-rate/50'
                : 'bg-surface border-white/15 hover:border-rate/60 hover:bg-rate/5',
            ]"
            @click="selectPerk(perk)"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rate">{{ perk.name }}</span>
              <span v-if="selectedPerk?.id === perk.id" class="text-rate text-xs">✓</span>
            </div>
            <div class="text-[10px] text-dim leading-relaxed">{{ perk.desc }}</div>
          </div>

          <div v-if="combat.perkOffers.length === 0" class="text-[11px] text-dim italic text-center py-2">
            All perks collected.
          </div>
        </div>
      </div>

    </div>

    <!-- Continue button -->
    <button
      class="px-10 py-2.5 rounded-lg font-bold text-sm tracking-widest uppercase border-2 transition-all duration-150"
      :class="[
        selectedPerk || combat.perkOffers.length === 0
          ? 'bg-energy/10 border-energy text-energy hover:bg-energy/20 hover:scale-105 active:scale-95 cursor-pointer'
          : 'bg-surface border-white/10 text-dim cursor-not-allowed opacity-50',
      ]"
      :disabled="!selectedPerk && combat.perkOffers.length > 0"
      @click="advance()"
    >
      {{ selectedPerk ? `Take ${selectedPerk.name} & Continue →` : 'Pick a perk to continue' }}
    </button>

  </div>
</template>
