export const apiConfig = {
  failureRate: 0,
}

const MIN_DELAY_MS = 300
const MAX_DELAY_MS = 600

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isAbortError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'name' in err && (err as { name: unknown }).name === 'AbortError'
}

export async function simulateNetwork(signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const delayMs = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)

    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })

  if (apiConfig.failureRate > 0 && Math.random() < apiConfig.failureRate) {
    throw new ApiError('Simulated network error')
  }
}
