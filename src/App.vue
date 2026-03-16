<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game.js'
import { useCombatStore } from './stores/combat.js'
import GunSelectScreen from './components/GunSelectScreen.vue'
import GameArena from './components/arena/GameArena.vue'
import HeroStats from './components/HeroStats.vue'
import WaveInfo from './components/WaveInfo.vue'
import CombatLog from './components/CombatLog.vue'
import BetweenLevelScreen from './components/BetweenLevelScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import MetaShop from './components/MetaShop.vue'

const game = useGameStore()
const combat = useCombatStore()

let saveInterval = null

onMounted(() => {
  game.load()
  saveInterval = setInterval(() => game.save(), 30_000)
})

onUnmounted(() => {
  clearInterval(saveInterval)
})
</script>

<template>
  <div class="starfield fixed inset-0 pointer-events-none z-0" />

  <div class="relative z-10 flex flex-col min-h-screen">

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-white/[0.08]">
      <div class="flex items-center justify-between px-5 py-2.5 max-w-6xl mx-auto w-full">
        <h1 class="text-base font-extrabold tracking-[0.25em] text-energy glow-energy-sm uppercase">
          Rift
        </h1>
        <div class="flex gap-2">
          <button
            class="px-3 py-1 text-xs border border-white/10 text-dim rounded hover:border-energy hover:text-energy transition-colors"
            @click="game.save()"
          >
            Save
          </button>
          <button
            class="px-3 py-1 text-xs border border-white/10 text-dim rounded hover:border-red-500 hover:text-red-400 transition-colors"
            @click="game.hardReset()"
          >
            Restart
          </button>
        </div>
      </div>
    </header>

    <!-- GUN SELECT -->
    <template v-if="combat.phase === 'gun-select'">
      <GunSelectScreen />
    </template>

    <!-- COMBAT / BOSS -->
    <template v-else-if="combat.phase === 'combat' || combat.phase === 'boss'">
      <main
        class="flex-1 flex gap-0 max-w-6xl mx-auto w-full px-2 py-3"
        style="height: calc(100vh - 52px)"
      >
        <aside class="w-48 shrink-0 flex flex-col gap-3 pr-3 border-r border-white/[0.07]">
          <HeroStats />
        </aside>

        <section class="flex-1 px-3">
          <GameArena />
        </section>

        <aside class="w-48 shrink-0 flex flex-col gap-3 pl-3 border-l border-white/[0.07]">
          <WaveInfo />
          <CombatLog />
        </aside>
      </main>
    </template>

    <!-- BETWEEN LEVEL -->
    <template v-else-if="combat.phase === 'between-level'">
      <BetweenLevelScreen />
    </template>

    <!-- GAME OVER -->
    <template v-else-if="combat.phase === 'game-over'">
      <GameOverScreen />
    </template>

    <!-- META SHOP (accessible from game-over and gun-select) -->
    <template v-else-if="combat.phase === 'meta-shop'">
      <MetaShop />
    </template>

  </div>
</template>
