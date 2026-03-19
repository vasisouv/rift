<script setup>
import { useCombatStore } from '../stores/combat.js'
import { useMetaStore } from '../stores/meta.js'

const combat = useCombatStore()
const meta = useMetaStore()

const b = () => meta.startingBonuses
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8">

    <!-- Title -->
    <div class="text-center">
      <div class="text-5xl mb-3">🃏</div>
      <h2 class="text-3xl font-extrabold tracking-[0.3em] text-energy glow-energy uppercase mb-1">
        Rift
      </h2>
      <p class="text-dim text-sm">A card combat roguelike. Reduce the enemy hero to 0 HP.</p>
    </div>

    <!-- Shard balance + navigation -->
    <div class="flex items-center gap-3">
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
      <button
        class="px-4 py-1.5 bg-energy/10 border border-energy/40 rounded-lg text-energy text-xs font-bold hover:bg-energy/20 transition-colors"
        @click="combat.phase = 'deck-builder'"
      >
        🃏 Deck Builder
      </button>
    </div>

    <!-- Deck info -->
    <div class="flex items-center gap-3 text-[11px] text-dim">
      <span>Deck: <span class="text-white/70 font-mono">{{ meta.deckLabel }}</span></span>
      <span>·</span>
      <span>Collection: <span class="text-white/70 font-mono">{{ meta.collectionSize }}</span> unique cards</span>
    </div>

    <!-- Active meta bonuses -->
    <div v-if="meta.hasAnyUpgrade" class="flex flex-wrap gap-1.5 justify-center max-w-lg">
      <div class="text-[9px] text-dim uppercase tracking-widest w-full text-center mb-0.5">Active bonuses this run</div>
      <span v-if="b().maxHp > 0" class="text-[10px] px-2 py-0.5 bg-hp/15 border border-hp/30 rounded text-hp">
        +{{ b().maxHp }} max HP
      </span>
      <span v-if="b().extraStartCards > 0" class="text-[10px] px-2 py-0.5 bg-energy/15 border border-energy/30 rounded text-energy">
        +{{ b().extraStartCards }} starting card
      </span>
      <span v-if="b().atkBonus > 0" class="text-[10px] px-2 py-0.5 bg-gold/15 border border-gold/30 rounded text-gold">
        +{{ b().atkBonus }} ATK to all cards
      </span>
      <span v-if="b().defense > 0" class="text-[10px] px-2 py-0.5 bg-dim/15 border border-dim/30 rounded text-dim">
        -{{ b().defense }} damage taken
      </span>
      <span v-if="b().spellDmgBonus > 0" class="text-[10px] px-2 py-0.5 bg-rate/15 border border-rate/30 rounded text-rate">
        +{{ b().spellDmgBonus }} spell damage
      </span>
      <span v-if="b().lifestealChance > 0" class="text-[10px] px-2 py-0.5 bg-hp/15 border border-hp/30 rounded text-hp">
        🩸 lifesteal
      </span>
      <span v-if="b().extraTier2Card" class="text-[10px] px-2 py-0.5 bg-rate/15 border border-rate/30 rounded text-rate">
        +1 tier-2 card in deck
      </span>
      <span v-if="b().startingPerk" class="text-[10px] px-2 py-0.5 bg-rate/15 border border-rate/30 rounded text-rate">
        ✨ free perk
      </span>
    </div>

    <!-- How to play -->
    <div class="max-w-md p-4 bg-surface border border-white/[0.08] rounded-xl text-[11px] text-dim leading-relaxed">
      <div class="font-bold text-slate-300 mb-2 text-xs">How to play</div>
      <ul class="list-disc list-inside space-y-1">
        <li>Play cards from your hand by spending mana</li>
        <li>Select a board card, then click an enemy to attack</li>
        <li>Cards played this turn can't attack until next turn</li>
        <li>Attack the enemy hero directly to win</li>
        <li>Mana increases by 1 each turn (max 10)</li>
      </ul>
    </div>

    <!-- Start button -->
    <button
      class="px-14 py-4 bg-energy/10 border-2 border-energy rounded-xl text-energy font-extrabold text-xl
             tracking-widest uppercase hover:bg-energy/20 hover:scale-105 active:scale-95 transition-all
             duration-150 glow-energy-sm"
      @click="combat.startRun()"
    >
      Start Run →
    </button>

  </div>
</template>
