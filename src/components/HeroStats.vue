<script setup>
import { useCharacterStore } from '../stores/character'

const char = useCharacterStore()
</script>

<template>
  <div class="flex flex-col gap-3 p-3 bg-surface/60 rounded-lg border border-white/[0.07]">

    <!-- HP -->
    <div>
      <div class="flex justify-between items-center mb-1">
        <span class="text-[10px] text-dim uppercase tracking-widest">HP</span>
        <span class="text-xs font-mono" :class="char.isLowHp ? 'text-hp glow-hp' : 'text-slate-300'">
          {{ char.hp }}/{{ char.maxHp }}
        </span>
      </div>
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{
            width: char.hpPercent + '%',
            background: char.hpPercent > 50 ? '#44ff88' : char.hpPercent > 25 ? '#ffaa00' : '#ff4444',
          }"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
      <div class="text-dim">Level</div>
      <div class="text-xp font-bold text-right">{{ char.level }}</div>

      <div class="text-dim">Kills</div>
      <div class="text-slate-300 text-right">{{ char.kills }}</div>

      <div class="text-dim">Energy</div>
      <div class="text-energy glow-energy-sm text-right font-mono">{{ char.energy }}</div>

      <div class="text-dim">Gun</div>
      <div class="text-gold text-right truncate">{{ char.selectedGun?.name ?? '—' }}</div>

      <div class="text-dim">Damage</div>
      <div class="text-slate-300 text-right">{{ char.totalAttack }}</div>

      <div class="text-dim">Defense</div>
      <div class="text-slate-300 text-right">{{ char.defenseBonus }}</div>

      <div class="text-dim">Crit</div>
      <div class="text-slate-300 text-right">{{ Math.round((0.1 + char.critBonus) * 100) }}%</div>
    </div>

    <!-- Active perks -->
    <div v-if="char.equippedPerkIds.length > 0">
      <div class="text-[9px] text-dim uppercase tracking-widest mb-1">Perks</div>
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
</template>
