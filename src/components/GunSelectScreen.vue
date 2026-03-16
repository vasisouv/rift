<script setup>
import { useCombatStore } from '../stores/combat'
import { useMetaStore } from '../stores/meta'
import { GUNS } from '../data/guns'

const combat = useCombatStore()
const meta = useMetaStore()
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8">

    <!-- Title -->
    <div class="text-center">
      <h2 class="text-3xl font-extrabold tracking-[0.3em] text-energy glow-energy uppercase mb-1">
        Choose Your Weapon
      </h2>
      <p class="text-dim text-sm">Pick a gun to begin your run. Defines how you attack.</p>
    </div>

    <!-- Shard balance + shop link -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 text-sm">
        <span>💎</span>
        <span class="text-gold font-bold font-mono">{{ meta.voidShards }}</span>
        <span class="text-dim">shards</span>
      </div>
      <button
        class="px-4 py-1.5 bg-rate/10 border border-rate/40 rounded-lg text-rate text-xs font-bold hover:bg-rate/20 transition-colors"
        @click="combat.goToMetaShop()"
      >
        💎 Void Shop
      </button>
    </div>

    <!-- Active meta bonuses -->
    <div v-if="meta.hasAnyUpgrade" class="flex flex-wrap gap-1.5 justify-center max-w-lg">
      <div class="text-[9px] text-dim uppercase tracking-widest w-full text-center mb-0.5">Active bonuses this run</div>
      <span v-if="meta.startingBonuses.maxHpBonus > 0" class="text-[10px] px-2 py-0.5 bg-hp/15 border border-hp/30 rounded text-hp">
        +{{ meta.startingBonuses.maxHpBonus }} HP
      </span>
      <span v-if="meta.startingBonuses.startingEnergy > 0" class="text-[10px] px-2 py-0.5 bg-energy/15 border border-energy/30 rounded text-energy">
        +{{ meta.startingBonuses.startingEnergy }} ⚡
      </span>
      <span v-if="meta.startingBonuses.damageMultiplier > 1" class="text-[10px] px-2 py-0.5 bg-gold/15 border border-gold/30 rounded text-gold">
        +{{ Math.round((meta.startingBonuses.damageMultiplier - 1) * 100) }}% dmg
      </span>
      <span v-if="meta.startingBonuses.defenseBonus > 0" class="text-[10px] px-2 py-0.5 bg-dim/15 border border-dim/30 rounded text-dim">
        +{{ meta.startingBonuses.defenseBonus }} def
      </span>
      <span v-if="meta.startingBonuses.critBonus > 0" class="text-[10px] px-2 py-0.5 bg-rate/15 border border-rate/30 rounded text-rate">
        +{{ Math.round(meta.startingBonuses.critBonus * 100) }}% crit
      </span>
      <span v-if="meta.startingBonuses.startingPerk" class="text-[10px] px-2 py-0.5 bg-rate/15 border border-rate/30 rounded text-rate">
        ✨ free perk
      </span>
      <span v-if="meta.powerStrikeCooldown < 3" class="text-[10px] px-2 py-0.5 bg-boss/15 border border-boss/30 rounded text-boss">
        ⚡ Power {{ meta.powerStrikeCooldown }}-turn CD
      </span>
    </div>

    <!-- Gun cards -->
    <div class="flex flex-wrap gap-5 justify-center max-w-3xl">
      <div
        v-for="gun in GUNS"
        :key="gun.id"
        class="flex flex-col gap-3 p-5 bg-surface border border-white/10 rounded-xl cursor-pointer
               transition-all duration-200 w-52
               hover:border-energy hover:bg-energy/5 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]
               active:scale-100"
        @click="combat.startRun(gun)"
      >
        <!-- Icon + name -->
        <div class="flex items-center gap-3">
          <div class="text-4xl">{{ gun.icon }}</div>
          <div>
            <div class="text-lg font-bold text-energy glow-energy-sm">{{ gun.name }}</div>
            <div class="text-[10px] text-rate">{{ gun.playstyle }}</div>
          </div>
        </div>

        <!-- Stats — only what matters in turn-based -->
        <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div class="text-dim">Dmg / action</div>
          <div class="text-slate-200 font-mono font-bold text-right">
            {{ gun.pellets > 1 ? `${gun.damage}×${gun.pellets} = ${gun.damage * gun.pellets}` : gun.damage }}
          </div>
          <div class="text-dim">Special</div>
          <div class="text-gold text-right text-[10px]">
            {{ gun.special === 'low_hp_crit' ? 'Low HP Crit' : gun.special === 'pellet_spread' ? 'AoE Power' : '—' }}
          </div>
        </div>

        <hr class="border-white/[0.06]" />

        <p class="text-[11px] text-dim leading-relaxed italic flex-1">{{ gun.description }}</p>

        <button class="w-full py-2 bg-energy/10 border border-energy/40 rounded-lg text-energy text-xs font-bold tracking-widest uppercase hover:bg-energy/20 transition-colors">
          Select
        </button>
      </div>
    </div>

  </div>
</template>
