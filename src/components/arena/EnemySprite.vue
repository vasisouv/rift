<script setup>
import { computed } from 'vue'
import { useCombatStore } from '../../stores/combat'

const props = defineProps({
  enemy: {
    type: Object,
    required: true,
  },
})

const combat = useCombatStore()

const hpPercent = computed(() =>
  props.enemy.maxHp > 0 ? Math.round((props.enemy.hp / props.enemy.maxHp) * 100) : 0
)

const isTargeted = computed(() => combat.targetedEnemyId === props.enemy.id)
</script>

<template>
  <div
    v-if="!enemy.isDead"
    class="absolute flex flex-col items-center gap-0.5 cursor-pointer select-none transition-all duration-150 z-10"
    :class="[
      enemy.hitFlash ? 'hit-flash' : '',
      isTargeted ? 'scale-110' : 'hover:scale-105',
    ]"
    :style="{
      left: enemy.x + '%',
      top: enemy.y + '%',
      transform: 'translate(-50%, -50%)',
    }"
    @click="combat.setTarget(enemy.id)"
  >
    <!-- Boss glow ring -->
    <div v-if="enemy.isBoss" class="absolute inset-0 rounded-full pointer-events-none"
      style="box-shadow: 0 0 20px rgba(255,136,0,0.5), 0 0 40px rgba(255,136,0,0.2); border-radius: 50%; width: 52px; height: 52px; top: -4px; left: -4px;"
    />

    <!-- Taunt badge -->
    <div v-if="enemy.taunt && !enemy.isDead"
         class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400 tracking-wider whitespace-nowrap">
      🛡 TAUNTING
    </div>

    <!-- Target indicator -->
    <div
      v-if="isTargeted"
      class="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-energy glow-energy-sm font-bold tracking-widest"
    >
      ▼
    </div>

    <!-- Emoji -->
    <div
      class="text-2xl leading-none"
      :style="enemy.isBoss ? 'font-size: 2.5rem' : ''"
    >
      {{ enemy.emoji }}
    </div>

    <!-- Next action badge -->
    <div v-if="enemy.nextAction !== 'attack'" class="text-[8px] font-bold px-1 py-0.5 rounded leading-none">
      <span v-if="enemy.nextAction === 'charge'" class="text-orange-400">⚡ CHARGE</span>
      <span v-else-if="enemy.nextAction === 'shield'" class="text-blue-400">🛡 SHIELD</span>
      <span v-else-if="enemy.nextAction === 'regen'" class="text-green-400">💚 REGEN</span>
      <span v-else-if="enemy.nextAction === 'stunned'" class="text-purple-400">💫 STUNNED</span>
    </div>

    <!-- HP bar -->
    <div class="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
      <div
        class="h-full rounded-full transition-all duration-100"
        :style="{
          width: hpPercent + '%',
          background: enemy.isBoss ? '#ff8800' : enemy.color,
        }"
      />
    </div>

    <!-- Name + HP -->
    <div
      class="text-[9px] font-mono whitespace-nowrap"
      :style="{ color: enemy.color }"
    >
      {{ enemy.name }} {{ enemy.hp }}<span v-if="enemy.burnTurns > 0" class="text-orange-400"> 🔥</span>
    </div>
  </div>
</template>
