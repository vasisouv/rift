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
      // Always land on start-run — no run state is restored
      const combat = useCombatStore()
      combat.phase = 'start-run'
    },

    // Wipes everything — run + meta — back to a fresh first-load state.
    hardReset() {
      const meta = useMetaStore()
      const combat = useCombatStore()
      localStorage.removeItem('void_harvest_meta_v1')
      localStorage.removeItem('void_harvest_meta_v2')
      meta.$reset()
      combat.restartRun()
    },
  },
})
