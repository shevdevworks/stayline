const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Selector-only matching can't see aria-disabled (deliberately left tabbable,
// e.g. calendar days) vs actually hidden (aria-hidden, the hidden attribute,
// or display:none/visibility:hidden applied via a CSS module class rather
// than an attribute). Walking to root catches hiding applied to an ancestor,
// not just the candidate itself.
function isHidden(el: HTMLElement, root: HTMLElement): boolean {
  let node: HTMLElement | null = el
  while (node) {
    if (node.hidden) return true
    if (node.getAttribute('aria-hidden') === 'true') return true
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return true
    if (node === root) break
    node = node.parentElement
  }
  return false
}

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !isHidden(el, root),
  )
}
