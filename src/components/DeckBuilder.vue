<script setup>
import { ref, computed } from 'vue'
import { useMetaStore } from '../stores/meta.js'
import { useCombatStore } from '../stores/combat.js'
import { useSoundStore } from '../stores/sound.js'
import { CARD_DEFS, getCardDef, getStartingDeck, getTierLabel, getTierColor } from '../data/cards.js'

const meta = useMetaStore()
const combat = useCombatStore()
const sound = useSoundStore()

const MIN_DECK = 20
const MAX_DECK = 40
const MAX_COPIES = 4

// Initialize from custom deck or starter deck
const deck = ref(meta.customDeck ? [...meta.customDeck] : [...getStartingDeck()])

const sortBy = ref('cost') // 'cost' or 'tier'

// Collection with in-deck counts
const collectionCards = computed(() => {
  const entries = Object.entries(meta.collection)
    .map(([id, count]) => {
      const def = getCardDef(id)
      if (!def) return null
      const inDeck = deck.value.filter(d => d === id).length
      return { ...def, owned: count, inDeck, available: count - inDeck }
    })
    .filter(Boolean)

  if (sortBy.value === 'tier') {
    entries.sort((a, b) => a.tier - b.tier || a.manaCost - b.manaCost)
  } else {
    entries.sort((a, b) => a.manaCost - b.manaCost || a.tier - b.tier)
  }
  return entries
})

// Deck cards grouped by ID
const deckCards = computed(() => {
  const counts = {}
  for (const id of deck.value) {
    counts[id] = (counts[id] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([id, count]) => {
      const def = getCardDef(id)
      return def ? { ...def, count } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.manaCost - b.manaCost || a.name.localeCompare(b.name))
})

// Mana curve
const manaCurve = computed(() => {
  const curve = {}
  for (const id of deck.value) {
    const def = getCardDef(id)
    if (def) {
      const cost = Math.min(def.manaCost, 7)
      curve[cost] = (curve[cost] ?? 0) + 1
    }
  }
  return curve
})

const maxCurveVal = computed(() => Math.max(1, ...Object.values(manaCurve.value)))
const isValid = computed(() => deck.value.length >= MIN_DECK && deck.value.length <= MAX_DECK)

function addCard(cardId) {
  if (deck.value.length >= MAX_DECK) return
  const inDeck = deck.value.filter(d => d === cardId).length
  const owned = meta.collection[cardId] ?? 0
  if (inDeck >= MAX_COPIES || inDeck >= owned) return
  deck.value.push(cardId)
  sound.cardPlay?.()
}

function removeCard(cardId) {
  const idx = deck.value.lastIndexOf(cardId)
  if (idx !== -1) {
    deck.value.splice(idx, 1)
  }
}

function saveDeck() {
  if (!isValid.value) return
  meta.setCustomDeck(deck.value)
  sound.buy?.()
}

function useDefault() {
  meta.clearCustomDeck()
  deck.value = [...getStartingDeck()]
  sound.buy?.()
}

function back() {
  combat.phase = 'start-run'
}
</script>

<template>
  <div class="flex flex-col overflow-hidden px-4 py-5 max-w-6xl mx-auto w-full" style="height: calc(100vh - 52px)">

    <!-- Header -->
    <div class="text-center mb-4">
      <h2 class="text-xl font-extrabold tracking-[0.3em] text-energy glow-energy uppercase">
        Deck Builder
      </h2>
      <p class="text-dim text-[11px] mt-1">
        Build your deck ({{ MIN_DECK }}–{{ MAX_DECK }} cards, max {{ MAX_COPIES }} copies each).
        <span class="text-white/30">Collection: {{ meta.collectionSize }}/{{ CARD_DEFS.length }} unique</span>
      </p>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">

      <!-- Left: Collection -->
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-bold text-dim uppercase tracking-widest">
            Collection
          </div>
          <div class="flex gap-1">
            <button
              class="text-[9px] px-2 py-0.5 rounded border transition-colors"
              :class="sortBy === 'cost' ? 'border-energy/40 text-energy' : 'border-white/10 text-dim'"
              @click="sortBy = 'cost'"
            >
              By Cost
            </button>
            <button
              class="text-[9px] px-2 py-0.5 rounded border transition-colors"
              :class="sortBy === 'tier' ? 'border-energy/40 text-energy' : 'border-white/10 text-dim'"
              @click="sortBy = 'tier'"
            >
              By Tier
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 content-start pr-1">
          <div
            v-for="card in collectionCards"
            :key="card.id"
            class="p-3 rounded-xl border transition-all duration-150 select-none"
            :class="[
              card.available > 0
                ? 'cursor-pointer hover:scale-105 hover:border-energy/60 bg-surface'
                : 'opacity-35 cursor-not-allowed',
            ]"
            :style="{ borderColor: card.available > 0 ? getTierColor(card.tier) + '40' : 'rgba(255,255,255,0.05)' }"
            @click="card.available > 0 && addCard(card.id)"
          >
            <div class="text-3xl text-center mb-1">{{ card.emoji }}</div>
            <div class="text-[11px] font-bold text-white text-center truncate leading-tight">{{ card.name }}</div>
            <div class="flex justify-center gap-2 text-[11px] mt-1">
              <span class="text-gold font-mono">{{ card.baseAtk }}⚔</span>
              <span class="text-hp font-mono">{{ card.baseHp }}♥</span>
            </div>
            <div class="text-[10px] text-center font-bold mt-1" :style="{ color: getTierColor(card.tier) }">
              {{ getTierLabel(card.tier) }}
            </div>
            <div class="text-[10px] text-center text-energy/60 font-mono">{{ card.manaCost }} mana</div>
            <div class="text-[10px] text-center mt-0.5" :class="card.inDeck > 0 ? 'text-xp' : 'text-dim'">
              {{ card.inDeck }}/{{ Math.min(card.owned, MAX_COPIES) }} in deck
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Deck Panel -->
      <div class="w-60 shrink-0 flex flex-col min-h-0 pl-4 border-l border-white/[0.08]">

        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-bold text-dim uppercase tracking-widest">Your Deck</div>
          <div
            class="text-sm font-mono font-bold"
            :class="[
              deck.length < MIN_DECK ? 'text-hp' : deck.length <= MAX_DECK ? 'text-xp' : 'text-hp'
            ]"
          >
            {{ deck.length }}
          </div>
        </div>

        <!-- Mana curve -->
        <div class="flex items-end gap-0.5 h-10 mb-2 px-1">
          <div v-for="c in [1,2,3,4,5,6,7]" :key="c" class="flex-1 flex flex-col items-center gap-0.5">
            <div class="text-[7px] text-dim font-mono">{{ manaCurve[c] ?? 0 }}</div>
            <div
              class="w-full bg-energy/30 rounded-t transition-all duration-200"
              :style="{ height: ((manaCurve[c] ?? 0) / maxCurveVal) * 24 + 'px' }"
            />
            <div class="text-[7px] text-dim">{{ c }}{{ c === 7 ? '+' : '' }}</div>
          </div>
        </div>

        <!-- Deck list -->
        <div class="flex-1 overflow-y-auto space-y-px pr-1">
          <div
            v-for="card in deckCards"
            :key="card.id"
            class="flex items-center gap-1.5 px-2 py-1 rounded bg-surface/80 border border-white/[0.06]
                   hover:border-hp/30 cursor-pointer transition-colors group"
            @click="removeCard(card.id)"
          >
            <span class="text-energy/60 text-[10px] font-mono w-3 text-right shrink-0">{{ card.manaCost }}</span>
            <span class="text-sm shrink-0">{{ card.emoji }}</span>
            <span class="text-[10px] font-bold text-white/80 flex-1 truncate">{{ card.name }}</span>
            <span class="text-[10px] text-dim font-mono">×{{ card.count }}</span>
            <span class="text-[9px] text-hp opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </div>
          <div v-if="deckCards.length === 0" class="text-[10px] text-dim text-center py-6">
            Click cards to add them
          </div>
        </div>

        <!-- Validation -->
        <div v-if="deck.length < MIN_DECK" class="text-[9px] text-hp text-center py-1">
          Need {{ MIN_DECK - deck.length }} more card{{ MIN_DECK - deck.length === 1 ? '' : 's' }}
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-1.5 pt-3 border-t border-white/[0.08] mt-2">
          <button
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150"
            :class="isValid
              ? 'bg-xp/10 border border-xp/40 text-xp hover:bg-xp/20 hover:scale-[1.02] active:scale-95'
              : 'bg-surface border border-white/10 text-dim cursor-not-allowed'"
            :disabled="!isValid"
            @click="saveDeck"
          >
            Save Deck
          </button>
          <button
            class="px-4 py-1.5 bg-surface border border-white/10 rounded-lg text-[10px] text-dim
                   hover:border-gold/40 hover:text-gold transition-colors"
            @click="useDefault"
          >
            Reset to Default
          </button>
          <button
            class="px-4 py-1.5 bg-surface border border-white/10 rounded-lg text-[10px] text-dim
                   hover:border-energy/40 hover:text-energy transition-colors"
            @click="back"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
