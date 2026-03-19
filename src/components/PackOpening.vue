<script setup>
import { ref, watch } from 'vue'
import gsap from 'gsap'
import { getTierLabel, getTierColor } from '../data/cards.js'
import { useSoundStore } from '../stores/sound.js'

const props = defineProps({
  cards: { type: Array, default: () => [] },
  packColor: { type: String, default: '#00ffff' },
})
const emit = defineEmits(['close'])
const sound = useSoundStore()

const revealed = ref([])
const allRevealed = ref(false)
const packOpened = ref(false)
const cardRefs = ref([])

function setCardRef(el, i) {
  if (el) cardRefs.value[i] = el
}

watch(() => props.cards, async (cards) => {
  if (!cards || cards.length === 0) return
  revealed.value = []
  allRevealed.value = false
  packOpened.value = false
  cardRefs.value = []

  await new Promise(r => setTimeout(r, 400))
  packOpened.value = true
  sound.packOpen?.()

  for (let i = 0; i < cards.length; i++) {
    await new Promise(r => setTimeout(r, 350))
    revealed.value.push(cards[i])

    // Animate card appearing
    await new Promise(r => setTimeout(r, 20))
    const el = cardRefs.value[i]
    if (el) {
      gsap.from(el, {
        y: 40,
        scale: 0.5,
        opacity: 0,
        rotateY: 180,
        duration: 0.4,
        ease: 'back.out(1.7)',
      })
      // Glow pulse for high tier
      if (cards[i].tier >= 6) {
        gsap.fromTo(el, { boxShadow: `0 0 0px ${getTierColor(cards[i].tier)}` },
          { boxShadow: `0 0 30px ${getTierColor(cards[i].tier)}80`, duration: 0.6, yoyo: true, repeat: 1 })
      }
    }
    sound.cardReveal?.(cards[i].tier)
  }

  allRevealed.value = true
}, { immediate: true })
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">

    <!-- Pack (before opening) -->
    <div v-if="!packOpened" class="text-8xl animate-pulse select-none">
      📦
    </div>

    <!-- Cards revealed -->
    <div v-else class="flex flex-col items-center gap-6 px-4">
      <div class="text-sm font-bold text-white/50 uppercase tracking-[0.3em]">Cards Obtained</div>

      <div class="flex gap-3 flex-wrap justify-center max-w-2xl">
        <div
          v-for="(card, i) in revealed"
          :key="i"
          :ref="el => setCardRef(el, i)"
          class="w-28 p-3 rounded-xl border-2 flex flex-col items-center gap-1.5"
          :style="{
            borderColor: getTierColor(card.tier),
            background: getTierColor(card.tier) + '12',
          }"
        >
          <div class="text-3xl">{{ card.emoji }}</div>
          <div class="text-[10px] font-bold text-white text-center leading-tight">{{ card.name }}</div>
          <div v-if="card.type === 'spell'" class="text-[8px] text-rate font-extrabold uppercase tracking-wider">Spell</div>
          <div v-if="card.type === 'spell'" class="text-[9px] text-center text-white/60 leading-tight px-1">{{ card.description }}</div>
          <div v-else class="flex gap-2 text-[10px]">
            <span class="text-gold font-mono font-bold">{{ card.baseAtk }} ⚔</span>
            <span class="text-hp font-mono font-bold">{{ card.baseHp }} ♥</span>
          </div>
          <div
            class="text-[9px] font-extrabold uppercase tracking-wider"
            :style="{ color: getTierColor(card.tier) }"
          >
            {{ getTierLabel(card.tier) }}
          </div>
          <div class="text-[9px] text-energy/70 font-mono">{{ card.manaCost }} mana</div>
        </div>
      </div>

      <button
        v-if="allRevealed"
        class="px-10 py-2.5 bg-energy/10 border border-energy rounded-lg text-energy font-bold text-sm
               hover:bg-energy/20 transition-colors tracking-widest uppercase"
        @click="emit('close')"
      >
        Collect
      </button>
    </div>

  </div>
</template>
