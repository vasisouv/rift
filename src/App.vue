<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game.js'
import { useCombatStore } from './stores/combat.js'
import { useSoundStore } from './stores/sound.js'
import StartRunScreen from './components/StartRunScreen.vue'
import CardArena from './components/arena/CardArena.vue'
import LevelInfo from './components/LevelInfo.vue'
import CombatLog from './components/CombatLog.vue'
import BetweenLevelScreen from './components/BetweenLevelScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import RiftClearedScreen from './components/RiftClearedScreen.vue'
import MetaShop from './components/MetaShop.vue'
import DeckBuilder from './components/DeckBuilder.vue'

const game = useGameStore()
const combat = useCombatStore()
const sound = useSoundStore()

const showSidebar = ref(false)

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

  <div class="relative z-10 flex flex-col min-h-screen select-none">

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-white/[0.08]">
      <div class="flex items-center justify-between px-3 md:px-5 py-2 md:py-2.5 max-w-6xl mx-auto w-full">
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
            class="px-3 py-1 text-xs border border-white/10 text-dim rounded hover:border-energy hover:text-energy transition-colors"
            @click="sound.muted = !sound.muted"
          >
            {{ sound.muted ? 'Unmute' : 'Mute' }}
          </button>
          <button
            class="px-3 py-1 text-xs border border-white/10 text-dim rounded hover:border-red-500 hover:text-red-400 transition-colors"
            @click="game.hardReset()"
          >
            Reset
          </button>
        </div>
      </div>
    </header>

    <!-- START RUN -->
    <template v-if="combat.phase === 'start-run'">
      <StartRunScreen />
    </template>

    <!-- COMBAT -->
    <template v-else-if="combat.phase === 'combat'">
      <main
        class="flex gap-0 max-w-6xl mx-auto w-full px-2 py-3 overflow-hidden relative"
        style="height: calc(100vh - 52px)"
      >
        <section class="flex-1 px-1 md:px-3 overflow-hidden">
          <CardArena />
        </section>

        <!-- Sidebar toggle (mobile only) -->
        <button
          class="md:hidden fixed bottom-3 right-3 z-40 w-10 h-10 rounded-full bg-surface border border-white/20 flex items-center justify-center text-lg text-dim hover:text-energy hover:border-energy transition-colors shadow-lg"
          @click="showSidebar = !showSidebar"
        >
          {{ showSidebar ? '✕' : '☰' }}
        </button>

        <!-- Sidebar backdrop (mobile only) -->
        <div
          v-if="showSidebar"
          class="md:hidden fixed inset-0 bg-black/60 z-30"
          @click="showSidebar = false"
        />

        <!-- Sidebar -->
        <aside
          class="shrink-0 flex flex-col gap-3 pl-3 border-l border-white/[0.07] min-h-0 overflow-y-auto
                 fixed inset-y-0 right-0 z-30 w-64 bg-void/95 backdrop-blur pt-16 pb-4 pr-3 transition-transform duration-200
                 md:static md:w-64 md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 md:pr-0 md:translate-x-0"
          :class="showSidebar ? 'translate-x-0' : 'translate-x-full'"
        >
          <LevelInfo />
          <CombatLog class="flex-1 min-h-0" />
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

    <!-- RIFT CLEARED -->
    <template v-else-if="combat.phase === 'rift-cleared'">
      <RiftClearedScreen />
    </template>

    <!-- META SHOP -->
    <template v-else-if="combat.phase === 'meta-shop'">
      <MetaShop />
    </template>

    <!-- DECK BUILDER -->
    <template v-else-if="combat.phase === 'deck-builder'">
      <DeckBuilder />
    </template>

  </div>
</template>
