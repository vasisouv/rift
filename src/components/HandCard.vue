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
      class="absolute -top-3.5 -left-3.5 w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold border-2 shadow-lg z-10"
      :class="affordable
        ? 'bg-blue-600 border-blue-300 text-white'
        : 'bg-slate-700 border-slate-500 text-slate-400'"
      style="text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7); box-shadow: 0 2px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25);"
    >
      {{ card.manaCost }}
    </div>

    <!-- Emoji -->
    <div class="text-4xl leading-none mt-1" draggable="false">{{ card.emoji }}</div>

    <!-- Name -->
    <div class="text-[11px] text-center text-slate-300 font-semibold leading-tight w-full" draggable="false">
      {{ card.name }}
    </div>

    <!-- ATK / HP stats -->
    <div class="flex items-center justify-between w-full px-0.5 mt-0.5" draggable="false">
      <span class="text-sm font-bold text-yellow-400">⚔{{ card.atk }}</span>
      <span class="text-sm font-bold text-hp">♥{{ card.hp }}</span>
    </div>
  </div>
</template>
