<script setup>
import { useCombatStore } from '../../stores/combat'
import PlayerSprite from './PlayerSprite.vue'
import EnemySprite from './EnemySprite.vue'
import ActionBar from '../ActionBar.vue'

const combat = useCombatStore()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Battle field -->
    <div class="relative flex-1 arena-grid rounded-t-lg border border-b-0 border-white/[0.06] overflow-hidden bg-void/60">
      <!-- Scanline overlay -->
      <div class="absolute inset-0 pointer-events-none"
        style="background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px);"
      />

      <!-- Player -->
      <PlayerSprite />

      <!-- VS divider line -->
      <div class="absolute top-0 bottom-0 left-[42%] border-l border-white/[0.04] pointer-events-none" />

      <!-- Enemies -->
      <EnemySprite
        v-for="enemy in combat.enemies"
        :key="enemy.id"
        :enemy="enemy"
      />

      <!-- Boss banner -->
      <Transition name="fade">
        <div
          v-if="combat.phase === 'boss'"
          class="absolute top-2 left-1/2 -translate-x-1/2 text-boss glow-boss text-[11px] font-bold tracking-[0.3em] uppercase pulse-glow px-3 py-1 bg-void/80 rounded border border-boss/30"
        >
          ⚠ BOSS FIGHT ⚠
        </div>
      </Transition>

      <!-- Empty state -->
      <div
        v-if="combat.enemies.length === 0"
        class="absolute inset-0 flex items-center justify-center text-dim text-xs tracking-widest"
      >
        NEXT ENCOUNTER INCOMING...
      </div>
    </div>

    <!-- Action bar docked below arena -->
    <ActionBar />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
