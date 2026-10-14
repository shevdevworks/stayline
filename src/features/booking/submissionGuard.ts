export interface SubmissionGuard {
  readonly inFlight: boolean
  // Runs task unless one is already running; returns null for a duplicate.
  run<T>(task: () => Promise<T>): Promise<T> | null
}

// Synchronous double-submit protection. The reducer's 'submitting' state
// can't catch two clicks in the same tick: both handlers still see the
// pre-click state, so both would call the API. A plain flag flipped before
// the request starts does.
export function createSubmissionGuard(): SubmissionGuard {
  let inFlight = false

  return {
    get inFlight() {
      return inFlight
    },
    run(task) {
      if (inFlight) return null
      inFlight = true
      return task().finally(() => {
        inFlight = false
      })
    },
  }
}
