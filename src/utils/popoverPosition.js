// Pure geometry for placing a popover relative to an anchor within the viewport.
// Kept free of any DOM or Vue dependency so it can be unit-tested in isolation:
// callers pass in plain rectangles (already read via getBoundingClientRect) and
// the viewport size, and receive back the fixed-position coordinates to apply.

/**
 * Compute a {top, left, placement} for a popover anchored to an element.
 *
 * The popover is placed ABOVE the anchor by default and flipped BELOW when there
 * is not enough room above. It never overlaps the anchor. Horizontally it is
 * centred on the anchor and then clamped so it stays within the viewport margins;
 * if it is too wide to fit between the margins it is pinned to the left margin.
 *
 * @param {{top:number,left:number,bottom:number,width:number}} anchorRect
 *   The anchor's viewport rectangle (as from getBoundingClientRect).
 * @param {{width:number,height:number}} popoverSize The popover's measured size.
 * @param {{width:number,height:number}} viewport The viewport size (innerWidth/Height).
 * @param {{gap?:number,margin?:number}} [opts] gap: space between anchor and
 *   popover; margin: minimum distance kept from each viewport edge.
 * @returns {{top:number,left:number,placement:'above'|'below'}}
 */
export function computePopoverPosition(anchorRect, popoverSize, viewport, opts = {}) {
  const { gap = 8, margin = 8 } = opts
  const vw = viewport.width
  const vh = viewport.height
  const w = popoverSize.width
  const h = popoverSize.height

  // Horizontal: centre on the anchor, then clamp into [margin, vw - w - margin].
  // When the popover is too wide to honour both margins, pin it to the left one.
  let left
  if (w >= vw - 2 * margin) {
    left = margin
  } else {
    const centred = anchorRect.left + anchorRect.width / 2 - w / 2
    left = Math.min(Math.max(centred, margin), vw - w - margin)
  }

  // Vertical: prefer above; flip below when the popover (plus gap and margin)
  // does not fit in the space above the anchor.
  const spaceAbove = anchorRect.top
  const fitsAbove = spaceAbove >= h + gap + margin

  let placement
  let top
  if (fitsAbove) {
    placement = 'above'
    top = anchorRect.top - gap - h
  } else {
    placement = 'below'
    top = anchorRect.bottom + gap
  }
  // Never let the popover escape above the top margin.
  if (top < margin) top = margin

  return { top, left, placement }
}
