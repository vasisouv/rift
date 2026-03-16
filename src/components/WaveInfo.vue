<script setup>
import { useCharacterStore } from '../stores/character'
import { useCombatStore } from '../stores/combat'

const char = useCharacterStore()
const combat = useCombatStore()
</script>

<template>
  <div class="flex flex-col gap-3 p-3 bg-surface/60 rounded-lg border border-white/[0.07]">

    <!-- Level -->
    <div class="text-center">
      <div class="text-[10px] text-dim uppercase tracking-widest">Level</div>
      <div class="text-3xl font-extrabold text-energy glow-energy-sm">{{ char.level }}</div>
    </div>

    <!-- Phase: combat -->
    <template v-if="combat.phase === 'combat'">
      <div class="text-center">
        <div class="text-[10px] text-dim uppercase tracking-widest mb-0.5">Encounter</div>
        <div class="text-xl font-bold text-slate-200">
          {{ combat.encounterProgress.current }}
          <span class="text-sm text-dim font-normal">/ {{ combat.encounterProgress.total }}</span>
        </div>
      </div>

      <!-- Overall enemy progress bar -->
      <div>
        <div class="flex justify-between text-[10px] text-dim mb-1">
          <span>Enemies</span>
          <span>{{ combat.encounterProgress.defeated }}/{{ combat.encounterProgress.totalEnemies }}</span>
        </div>
        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-energy rounded-full transition-all duration-300"
            :style="{
              width: combat.encounterProgress.totalEnemies > 0
                ? (combat.encounterProgress.defeated / combat.encounterProgress.totalEnemies * 100) + '%'
                : '0%'
            }"
          />
        </div>
      </div>

      <!-- Current encounter enemies -->
      <div class="flex flex-col gap-1.5">
        <div class="text-[9px] text-dim uppercase tracking-widest">In this fight</div>
        <div
          v-for="enemy in combat.enemies"
          :key="enemy.id"
          class="flex flex-col gap-0.5 text-[10px] transition-opacity duration-200"
          :class="enemy.isDead ? 'opacity-30' : ''"
        >
          <div class="flex justify-between">
            <span :style="{ color: enemy.color }" class="font-semibold">{{ enemy.emoji }} {{ enemy.name }}</span>
            <span class="font-mono text-dim">{{ enemy.hp }}</span>
          </div>
          <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-200"
              :style="{
                width: Math.round(enemy.hp / enemy.maxHp * 100) + '%',
                background: enemy.color,
              }"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Phase: boss -->
    <template v-else-if="combat.phase === 'boss' && combat.enemies.length > 0">
      <div class="text-center text-[10px] text-boss glow-boss uppercase tracking-widest pulse-glow font-bold">
        Boss Fight
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-[11px]">
          <span :style="{ color: combat.enemies[0].color }" class="font-bold">
            {{ combat.enemies[0].emoji }} {{ combat.enemies[0].name }}
          </span>
          <span class="font-mono text-dim">{{ combat.enemies[0].hp }}</span>
        </div>
        <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-200"
            style="background: #ff8800;"
            :style="{ width: Math.round(combat.enemies[0].hp / combat.enemies[0].maxHp * 100) + '%' }"
          />
        </div>
        <div class="text-[10px] text-dim text-center font-mono">
          {{ combat.enemies[0].hp }} / {{ combat.enemies[0].maxHp }}
        </div>
      </div>
    </template>

    <!-- Kills -->
    <div class="flex justify-between items-center text-[11px] pt-1 border-t border-white/[0.06]">
      <span class="text-dim">Kills</span>
      <span class="text-slate-300 font-mono">{{ char.kills }}</span>
    </div>

  </div>
</template>
