<script setup>
const props = defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  affordable: { type: Boolean, default: true },
})

const emit = defineEmits(['click', 'drag-start'])

function onDragStart(e) {
  if (!props.affordable) { e.preventDefault(); return }
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('cardId', props.card.instanceId)
  emit('drag-start', props.card.instanceId)
}
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-xl border
           select-none transition-all duration-100 w-[100px] min-w-[100px] shrink-0"
    :class="[
      affordable ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed',
      selected
        ? 'border-energy ring-2 ring-energy/50 bg-energy/10 -translate-y-3 scale-105'
        : affordable
          ? 'border-white/20 bg-surface hover:border-energy/50 hover:-translate-y-1'
          : 'border-white/10 bg-surface/50 opacity-40',
    ]"
    :draggable="affordable"
    @click="affordable && emit('click', card.instanceId)"
    @dragstart="onDragStart"
  >
    <!-- Mana cost gem -->
    <div
      class="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold border"
      :class="affordable ? 'bg-blue-500/80 border-blue-300 text-white' : 'bg-gray-700 border-gray-500 text-gray-400'"
    >
      {{ card.manaCost }}
    </div>

    <!-- Emoji -->
    <div class="text-4xl leading-none mt-1">{{ card.emoji }}</div>

    <!-- Name -->
    <div class="text-[11px] text-center text-slate-300 font-semibold leading-tight w-full">
      {{ card.name }}
    </div>

    <!-- ATK / HP stats -->
    <div class="flex items-center justify-between w-full px-0.5 mt-0.5">
      <span class="text-sm font-bold text-yellow-400">⚔{{ card.atk }}</span>
      <span class="text-sm font-bold text-hp">♥{{ card.hp }}</span>
    </div>
  </div>
</template>
