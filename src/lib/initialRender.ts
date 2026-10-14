// True for the app's very first render — the one the build prerenders to
// static HTML and the browser then hydrates — and false once that render
// has committed on the client (see Layout).
//
// Data hooks read this to resolve their first result synchronously from
// the bundled data instead of going through the simulated network: the
// prerendered page already shows real content, and the client must render
// the same thing for hydration to match. Later navigations and filter
// changes still go through the simulated latency, so loading, empty and
// error states stay part of the demo.
let initialRender = true

export function isInitialRender(): boolean {
  return initialRender
}

export function markInitialRenderDone(): void {
  initialRender = false
}
