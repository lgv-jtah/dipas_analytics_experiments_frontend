// Tests for the pure popover-placement geometry. No DOM: every input is a plain
// rectangle / size object, so the maths can be pinned exactly.
import { describe, it, expect } from 'vitest'
import { computePopoverPosition } from '../popoverPosition.js'

const VIEWPORT = { width: 1000, height: 800 }
const POP = { width: 200, height: 100 }

// Build an anchor rect from a top/left/size (bottom derived from top + height).
function anchor({ top, left, width = 100, height = 20 }) {
  return { top, left, width, height, bottom: top + height }
}

describe('computePopoverPosition', () => {
  it('places the popover above the anchor when there is room', () => {
    const pos = computePopoverPosition(
      anchor({ top: 400, left: 450 }),
      POP,
      VIEWPORT
    )
    expect(pos.placement).toBe('above')
    // top = anchorTop - gap(8) - height(100)
    expect(pos.top).toBe(292)
    // left = centre(450 + 50 - 100) = 400, within margins
    expect(pos.left).toBe(400)
  })

  it('flips below when there is not enough room above', () => {
    const pos = computePopoverPosition(
      anchor({ top: 50, left: 450 }),
      POP,
      VIEWPORT
    )
    expect(pos.placement).toBe('below')
    // top = anchorBottom(70) + gap(8)
    expect(pos.top).toBe(78)
  })

  it('clamps the left edge to the right margin near the right edge', () => {
    const pos = computePopoverPosition(
      anchor({ top: 400, left: 950, width: 40 }),
      POP,
      VIEWPORT
    )
    // vw - w - margin = 1000 - 200 - 8 = 792
    expect(pos.left).toBe(792)
  })

  it('clamps the left edge to the left margin near the left edge', () => {
    const pos = computePopoverPosition(
      anchor({ top: 400, left: 0, width: 20 }),
      POP,
      VIEWPORT
    )
    expect(pos.left).toBe(8)
  })

  it('pins to the left margin when the popover is too wide for the viewport', () => {
    const pos = computePopoverPosition(
      anchor({ top: 400, left: 40 }),
      { width: 200, height: 100 },
      { width: 150, height: 800 }
    )
    // 200 >= 150 - 16 -> too wide -> left = margin
    expect(pos.left).toBe(8)
  })

  it('never lets the top escape above the margin', () => {
    // Anchor scrolled partly off the top: below placement would start negative.
    const pos = computePopoverPosition(
      { top: -70, left: 450, width: 100, height: 20, bottom: -50 },
      POP,
      VIEWPORT
    )
    expect(pos.placement).toBe('below')
    expect(pos.top).toBe(8)
  })

  it('honours custom gap and margin options', () => {
    const pos = computePopoverPosition(
      anchor({ top: 400, left: 450 }),
      POP,
      VIEWPORT,
      { gap: 20, margin: 4 }
    )
    expect(pos.top).toBe(280) // 400 - 20 - 100
  })
})
