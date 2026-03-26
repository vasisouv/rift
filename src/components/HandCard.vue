<script setup>
import { getCardDef } from '../data/cards.js'
import { getKeyword } from '../data/keywords.js'

const props = defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  affordable: { type: Boolean, default: true },
})

const emit = defineEmits(['click', 'drag-start'])

const isSpell = props.card.type === 'spell'
const spellDef = isSpell ? getCardDef(props.card.defId) : null

const keywordText = !isSpell && props.card.keywords?.length
  ? props.card.keywords.map(k => {
      const id = typeof k === 'string' ? k : k.id
      return getKeyword(id)?.name
    }).filter(Boolean).join(' · ')
  : ''

function onDragStart(e) {
  if (!props.affordable || isSpell) { e.preventDefault(); return }
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cardId', props.card.instanceId)
  emit('drag-start', props.card.instanceId)
}
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 md:py-2.5 rounded-xl border
           select-none transition-all duration-100 w-[78px] min-w-[78px] h-[90px] md:w-[100px] md:min-w-[100px] md:h-[140px] shrink-0"
    :class="[
      affordable ? 'cursor-pointer' : 'cursor-not-allowed',
      selected
        ? isSpell
          ? 'border-rate ring-2 ring-rate/50 bg-rate/10 -translate-y-3 scale-105'
          : 'border-energy ring-2 ring-energy/50 bg-energy/10 -translate-y-3 scale-105'
        : affordable
          ? isSpell
            ? 'border-rate/30 bg-rate/5 hover:border-rate/50 hover:-translate-y-1'
            : 'border-white/20 bg-surface hover:border-energy/50 hover:-translate-y-1'
          : 'border-white/10 bg-surface/50 opacity-40',
    ]"
    :draggable="affordable && !isSpell"
    @click="affordable && emit('click', card.instanceId)"
    @dragstart="onDragStart"
  >
    <!-- Mana cost gem — pill inside card on mobile, circle outside on desktop -->
    <div
      class="absolute z-10 flex items-center justify-center font-extrabold border-2 shadow-lg
             top-1 left-1 px-1.5 py-0.5 rounded-md text-xs
             md:-top-3.5 md:-left-3.5 md:px-0 md:py-0 md:w-9 md:h-9 md:rounded-full md:text-lg"
      :class="affordable
        ? isSpell ? 'bg-purple-600 border-purple-300 text-white' : 'bg-blue-600 border-blue-300 text-white'
        : 'bg-slate-700 border-slate-500 text-slate-400'"
      style="text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7); box-shadow: 0 2px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25);"
    >
      {{ card.manaCost }}
    </div>

    <!-- Spell label -->
    <div v-if="isSpell" class="absolute -top-1 right-1 text-[7px] font-extrabold text-rate uppercase tracking-wider">
      Spell
    </div>

    <!-- Emoji -->
    <div class="text-2xl md:text-4xl leading-none mt-1" draggable="false">{{ card.emoji }}</div>

    <!-- Name -->
    <div class="text-[9px] md:text-[11px] text-center text-slate-300 font-semibold leading-tight w-full" draggable="false">
      {{ card.name }}
    </div>

    <!-- Keywords (minion) -->
    <div v-if="keywordText" class="text-[8px] text-center leading-tight w-full px-0.5 opacity-80" :style="{ color: card.color }" draggable="false">
      {{ keywordText }}
    </div>

    <!-- Spell: description -->
    <div v-if="isSpell && spellDef" class="text-[9px] text-center text-rate/80 leading-tight w-full px-0.5" draggable="false">
      {{ spellDef.description }}
    </div>

    <!-- Minion: ATK / HP stats -->
    <div v-else class="flex items-center justify-between w-full px-0.5 mt-0.5" draggable="false">
      <span class="text-sm font-bold text-yellow-400">⚔{{ card.atk }}</span>
      <span class="text-sm font-bold text-hp">♥{{ card.hp }}</span>
    </div>
  </div>
</template>
