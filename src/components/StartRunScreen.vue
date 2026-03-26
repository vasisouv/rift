<script setup>
import { useCombatStore } from '../stores/combat.js'
import { useMetaStore } from '../stores/meta.js'
import { RIFTS } from '../data/rifts.js'

const combat = useCombatStore()
const meta = useMetaStore()

const b = () => meta.startingBonuses

function riftStatus(rift) {
  if (meta.isRiftCompleted(rift.id)) return 'completed'
  if (meta.isRiftUnlocked(rift.index)) return 'available'
  return 'locked'
}

function riftBattleLabel(rift) {
  const status = riftStatus(rift)
  if (status === 'completed') return 'Cleared'
  if (status === 'locked') return `${rift.battles + 1} battles`
  const current = meta.getRiftBattle(rift.id)
  if (current >= rift.battles) return 'Boss ready!'
  return `Battle ${current + 1} of ${rift.battles + 1}`
}

function selectRift(rift) {
  if (riftStatus(rift) === 'locked') return
  combat.startRun(rift.id)
}
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-5 px-4 py-6">

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

    <!-- Campaign section -->
    <div class="w-full max-w-xl">
      <div class="text-[10px] text-dim uppercase tracking-[0.3em] text-center mb-2">Campaign</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="rift in RIFTS"
          :key="rift.id"
          class="relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-150"
          :class="{
            'bg-energy/5 border-energy/60 cursor-pointer hover:bg-energy/10 hover:scale-[1.03] active:scale-95':
              riftStatus(rift) === 'available',
            'bg-surface border-energy/30 cursor-pointer hover:bg-energy/5 hover:scale-[1.02] active:scale-95 opacity-80':
              riftStatus(rift) === 'completed',
            'bg-surface/30 border-white/[0.06] opacity-35 cursor-not-allowed':
              riftStatus(rift) === 'locked',
          }"
          @click="selectRift(rift)"
        >
          <!-- Status badge -->
          <div v-if="riftStatus(rift) === 'completed'"
               class="absolute top-1.5 right-1.5 text-energy text-sm">✓</div>
          <div v-if="riftStatus(rift) === 'locked'"
               class="absolute top-1.5 right-1.5 text-dim text-xs">🔒</div>

          <!-- Glow ring for available -->
          <div v-if="riftStatus(rift) === 'available'"
               class="absolute inset-0 rounded-xl ring-1 ring-energy/40 animate-pulse pointer-events-none" />

          <div class="text-2xl">{{ rift.emoji }}</div>
          <div class="text-xs font-bold tracking-wider" :style="{ color: rift.color }">
            {{ rift.name }}
          </div>
          <div class="text-[9px] text-dim">
            Boss: {{ rift.boss.name }}
          </div>
          <div class="text-[9px] font-mono"
               :class="riftStatus(rift) === 'completed' ? 'text-energy' : 'text-dim/60'">
            {{ riftBattleLabel(rift) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="w-full max-w-xl flex items-center gap-3">
      <div class="flex-1 h-px bg-white/[0.07]" />
      <span class="text-[10px] text-dim uppercase tracking-[0.3em]">or</span>
      <div class="flex-1 h-px bg-white/[0.07]" />
    </div>

    <!-- Endless Run -->
    <button
      class="px-14 py-4 bg-rate/10 border-2 border-rate/60 rounded-xl text-rate font-extrabold text-xl
             tracking-widest uppercase hover:bg-rate/20 hover:scale-105 active:scale-95 transition-all
             duration-150"
      @click="combat.startRun()"
    >
      Endless Run ∞
    </button>
    <div class="text-[10px] text-dim text-center -mt-3">
      No rift — enemies scale forever. How far can you go?
    </div>

    <!-- Active meta bonuses -->
    <div v-if="meta.hasAnyUpgrade" class="flex flex-wrap gap-1.5 justify-center max-w-lg">
      <div class="text-[9px] text-dim uppercase tracking-widest w-full text-center mb-0.5">Active bonuses</div>
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

  </div>
</template>
