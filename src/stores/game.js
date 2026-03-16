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

    // Wipes the current run and returns to gun select. Meta progress is kept.
    hardReset() {
      const combat = useCombatStore()
      combat.restartRun()
    },
  },
})
