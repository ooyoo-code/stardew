import { pets } from '../data/pets'
import { getContentBoundsFrac, loadImageEl, type ContentBoundsFrac } from './imageContentBounds'

let cached: Promise<ContentBoundsFrac> | null = null

/**
 * The pet's on-screen slot must stay in the same place no matter which pet is picked —
 * otherwise cycling through pets makes it visibly hop around, since each animal's art has
 * a different amount of padding in its square canvas. Pet art is a small, fixed set of
 * assets (unlike the AI-generated character, which genuinely varies per request), so their
 * content bounds only need measuring once: this takes the union of all pets' bounds (the
 * smallest box containing every pet's content) and uses its outer edges for every pet's
 * slot. That keeps the slot's position constant across pets while still guaranteeing none
 * of them — including whichever has the least padding — can overlap the character.
 */
export function getPetSlotBoundsFrac(): Promise<ContentBoundsFrac> {
  if (!cached) {
    cached = Promise.all(pets.map((p) => loadImageEl(p.image).then(getContentBoundsFrac))).then((all) => ({
      left: Math.min(...all.map((b) => b.left)),
      right: Math.max(...all.map((b) => b.right)),
      top: Math.min(...all.map((b) => b.top)),
      bottom: Math.max(...all.map((b) => b.bottom)),
    }))
  }
  return cached
}
