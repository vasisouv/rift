<script setup>
import { useCombatStore } from '../../stores/combat.js'
const combat = useCombatStore()
const goldEarned = 10 + combat.level * 5
</script>

<template>
  <div class="victory-overlay fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">

    <!-- Radial burst rings -->
    <div class="ring ring-1" />
    <div class="ring ring-2" />
    <div class="ring ring-3" />

    <!-- Content -->
    <div class="victory-content flex flex-col items-center gap-4">
      <div class="victory-label text-[13px] font-bold tracking-[0.5em] text-energy/70 uppercase">
        Enemy Defeated
      </div>
      <div class="victory-title text-8xl font-extrabold tracking-tight text-energy glow-energy">
        VICTORY
      </div>
      <div class="victory-gold text-2xl font-bold text-gold font-mono">
        +{{ goldEarned }} 🪙
      </div>
    </div>

  </div>
</template>

<style scoped>
.victory-overlay {
  background: radial-gradient(ellipse at center, rgba(0,255,255,0.08) 0%, rgba(4,6,15,0.85) 70%);
  animation: overlay-fade-in 0.3s ease-out forwards;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Expanding rings */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 255, 255, 0.5);
  animation: ring-expand 2.8s ease-out forwards;
}
.ring-1 { animation-delay: 0s;    width: 80px;  height: 80px; }
.ring-2 { animation-delay: 0.25s; width: 80px;  height: 80px; }
.ring-3 { animation-delay: 0.5s;  width: 80px;  height: 80px; }

@keyframes ring-expand {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(18);  opacity: 0;   }
}

/* Content animations */
.victory-label {
  animation: content-rise 0.5s 0.2s ease-out both;
}
.victory-title {
  animation: content-rise 0.6s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.victory-gold {
  animation: content-rise 0.5s 0.55s ease-out both;
}

@keyframes content-rise {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0)     scale(1);   }
}
</style>
