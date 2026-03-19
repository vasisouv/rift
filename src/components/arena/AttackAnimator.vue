<script setup>
import { watch, nextTick } from 'vue'
import gsap from 'gsap'
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
    if (!attackerEl || !targetEl) { combat.onAnimationDone(); return }

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

    const tl = gsap.timeline({
      onComplete() {
        clone.remove()
        attackerEl.style.opacity = ''
        combat.onAnimationDone()
      },
    })

    // Lunge toward target
    tl.to(clone, {
      x: dx * 0.9,
      y: dy * 0.9,
      scale: 1.12,
      filter: 'brightness(1.6)',
      duration: 0.3,
      ease: 'power2.in',
    })
    // Impact — snap to target
    .to(clone, {
      x: dx,
      y: dy,
      scale: 0.92,
      filter: 'brightness(2.2)',
      duration: 0.04,
      ease: 'none',
    })
    // Recoil back partway
    .to(clone, {
      x: dx * 0.7,
      y: dy * 0.7,
      scale: 1.05,
      filter: 'brightness(1.2)',
      duration: 0.07,
      ease: 'power1.out',
    })
    // Return home
    .to(clone, {
      x: 0,
      y: 0,
      scale: 1,
      filter: 'brightness(1)',
      duration: 0.24,
      ease: 'power2.out',
    })
  }
)
</script>

<template><slot /></template>
