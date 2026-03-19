<script setup>
const props = defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  canAttack: { type: Boolean, default: false },
  isEnemy: { type: Boolean, default: false },
  isAttackTarget: { type: Boolean, default: false },
  isSpellTarget: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'drag-attack-start', 'drag-attack-end'])

const hpPct = () => Math.max(0, (props.card.hp / props.card.maxHp) * 100)

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('attackerId', props.card.instanceId)
  emit('drag-attack-start', props.card.instanceId)
}

function onDragEnd() {
  emit('drag-attack-end')
}
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg border
           select-none w-[96px] min-w-[96px]"
    :data-instance-id="card.instanceId"
    :class="[
      canAttack && !isEnemy ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
      'transition-all duration-100',
      card.hitFlash ? 'brightness-200' : '',
      selected ? 'border-energy ring-1 ring-energy/60 bg-energy/10' : '',
      isAttackTarget && !isSpellTarget ? 'border-hp ring-1 ring-hp/60 bg-hp/10 animate-pulse' : '',
      isSpellTarget ? 'border-rate ring-1 ring-rate/60 bg-rate/10 animate-pulse cursor-pointer' : '',
      canAttack && !selected && !isAttackTarget
        ? 'card-ready-attack bg-energy/5'
        : '',
      (card.hasSummoningSickness || card.hasAttackedThisTurn) && !isEnemy
        ? 'border-white/10 bg-surface cursor-default'
        : '',
      isEnemy && !isAttackTarget ? 'border-hp/30 bg-hp/5 hover:border-hp/60' : '',
      !canAttack && !isEnemy && !isAttackTarget
        ? 'border-white/20 bg-surface'
        : '',
    ]"
    :draggable="canAttack && !isEnemy"
    @click.stop="emit('click', card.instanceId)"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Emoji -->
    <div class="text-4xl leading-none" draggable="false">{{ card.emoji }}</div>

    <!-- Name -->
    <div class="text-[11px] text-center text-slate-300 font-semibold leading-tight w-full truncate text-center" draggable="false">
      {{ card.name }}
    </div>

    <!-- Stats: ATK / HP -->
    <div class="flex items-center justify-between w-full mt-0.5 px-0.5" draggable="false">
      <span class="text-sm font-bold text-yellow-400">⚔{{ card.atk }}</span>
      <span class="text-sm font-bold text-hp">♥{{ card.hp }}</span>
    </div>

    <!-- HP bar -->
    <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden" draggable="false">
      <div
        class="h-full rounded-full transition-all duration-300"
        :style="{ width: hpPct() + '%', backgroundColor: card.color }"
      />
    </div>
  </div>
</template>

