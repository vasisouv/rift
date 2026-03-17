<script setup>
import { watch, nextTick } from 'vue'
import { useCombatStore } from '../../stores/combat.js'

const combat = useCombatStore()

function findEl(id) {
  if (id === 'enemy-hero') return document.querySelector('[data-enemy-hero]')
  if (id === 'player-hero') return document.querySelector('[data-player-hero]')
  return document.querySelector(`[data-instance-id="${id}"]`)
}

function getCenter(el) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

watch(
  () => combat.attackAnimation?.id,
  async () => {
    const anim = combat.attackAnimation
    if (!anim) return

    await nextTick()

    const attackerEl = findEl(anim.attackerId)
    const targetEl   = findEl(anim.targetId)
    if (!attackerEl || !targetEl) return

    const fromRect = attackerEl.getBoundingClientRect()
    const from     = getCenter(attackerEl)
    const to       = getCenter(targetEl)
    const dx       = to.x - from.x
    const dy       = to.y - from.y

    // Clone the card and position it fixed over the original
    const clone = attackerEl.cloneNode(true)
    clone.style.cssText = `
      position: fixed;
      left: ${fromRect.left}px;
      top: ${fromRect.top}px;
      width: ${fromRect.width}px;
      height: ${fromRect.height}px;
      margin: 0;
      z-index: 999;
      pointer-events: none;
      border-radius: 8px;
    `
    document.body.appendChild(clone)

    // Hide the original while the clone is flying
    attackerEl.style.opacity = '0'

    const fly = clone.animate(
      [
        { transform: 'translate(0,0) scale(1)',                         filter: 'brightness(1)',   offset: 0    },
        { transform: `translate(${dx*0.9}px,${dy*0.9}px) scale(1.12)`, filter: 'brightness(1.6)', offset: 0.48 },
        { transform: `translate(${dx}px,${dy}px) scale(0.92)`,         filter: 'brightness(2.2)', offset: 0.54 },
        { transform: `translate(${dx*0.7}px,${dy*0.7}px) scale(1.05)`, filter: 'brightness(1.2)', offset: 0.65 },
        { transform: 'translate(0,0) scale(1)',                         filter: 'brightness(1)',   offset: 1    },
      ],
      { duration: 650, easing: 'ease-in-out', fill: 'none' }
    )

    const cleanup = () => {
      clone.remove()
      attackerEl.style.opacity = ''
    }
    fly.onfinish = cleanup
    fly.oncancel = cleanup
  }
)
</script>

<template><slot /></template>
