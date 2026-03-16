import { defineStore } from 'pinia'
import { useCombatStore } from './combat'
import { useMetaStore } from './meta'

export const useGameStore = defineStore('game', {
  actions: {
    // Only meta (shards + upgrades) persists — runs are session-only
    save() {
      const meta = useMetaStore()
      meta.save()
    },

    load() {
      const meta = useMetaStore()
      meta.load()
      // Always land on gun select — no run state is restored
      const combat = useCombatStore()
      combat.phase = 'gun-select'
    },

    // Wipes everything — run + meta — back to a fresh first-load state.
    hardReset() {
      const meta = useMetaStore()
      const combat = useCombatStore()
      localStorage.removeItem('void_harvest_meta_v1')
      meta.$reset()
      combat.restartRun()
    },
  },
})
