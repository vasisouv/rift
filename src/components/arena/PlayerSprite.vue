<script setup>
import { useCharacterStore } from '../../stores/character'

const char = useCharacterStore()
</script>

<template>
  <div class="absolute left-[4%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
    <!-- Player icon -->
    <div
      class="text-4xl select-none transition-all duration-100"
      :class="{ 'hit-flash': char.isLowHp }"
      style="filter: drop-shadow(0 0 8px rgba(0,255,255,0.6))"
    >
      🚀
    </div>

    <!-- HP bar -->
    <div class="w-14 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
      <div
        class="h-full rounded-full transition-all duration-200"
        :style="{
          width: char.hpPercent + '%',
          background: char.hpPercent > 50 ? '#44ff88' : char.hpPercent > 25 ? '#ffaa00' : '#ff4444',
        }"
      />
    </div>

    <!-- HP text -->
    <div class="text-xs font-mono" :class="char.isLowHp ? 'text-hp glow-hp pulse-glow' : 'text-slate-300'">
      {{ char.hp }}/{{ char.maxHp }}
    </div>

    <div class="text-[10px] text-dim tracking-widest uppercase">Warrior</div>
  </div>
</template>
