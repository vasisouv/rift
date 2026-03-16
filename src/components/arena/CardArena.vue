<script setup>
import HeroBanner from './HeroBanner.vue'
import EnemyBoardRow from './EnemyBoardRow.vue'
import PlayerBoardRow from './PlayerBoardRow.vue'
import HandRow from './HandRow.vue'
import TurnControls from './TurnControls.vue'
</script>

<template>
  <div class="flex flex-col gap-3 h-full overflow-y-auto">

    <!-- Scanline overlay -->
    <div class="scanlines fixed inset-0 pointer-events-none z-0 opacity-20" />

    <!-- Mana + turn indicator -->
    <HeroBanner />

    <!-- Enemy zone: hero sprite behind cards -->
    <div class="flex-1 px-2 py-2 bg-hp/[0.03] border border-hp/10 rounded-xl">
      <EnemyBoardRow />
    </div>

    <!-- Divider -->
    <div class="w-full h-px bg-white/[0.07]" />

    <!-- Player zone: hero sprite behind cards -->
    <div class="flex-1 flex flex-col px-2 py-2 bg-energy/[0.03] border border-energy/10 rounded-xl">
      <PlayerBoardRow class="flex-1" />
    </div>

    <!-- End turn + mana number -->
    <TurnControls />

    <!-- Hand -->
    <div class="px-1">
      <HandRow />
    </div>

  </div>
</template>
