// Mutable game wallet + owned pets — a module-level singleton, same no-rerender
// pattern as input.ts. Game logic (coin pickups, shop, getting caught) mutates
// it directly; the HUD and pet renderers poll it each frame.

export const STARTING_GOLD = 100
export const MAX_FOLLOWERS = 3 // only ever three animals follow you at once

export type Pet = { id: number; kind: string; following: boolean }

export const wallet = {
  gold: STARTING_GOLD,
  pets: [] as Pet[],
}

let nextPetId = 1

export function addGold(amount: number) {
  wallet.gold = Math.max(0, wallet.gold + amount)
}

export function followingCount() {
  return wallet.pets.filter((p) => p.following).length
}

// Buy a new animal. It follows straight away if there's room (< 3 following);
// otherwise it stands in the garden until you choose to swap it in.
export function buyPet(kind: string) {
  wallet.pets.push({ id: nextPetId++, kind, following: followingCount() < MAX_FOLLOWERS })
}

// Toggle whether a pet follows you. Turning one ON only works if fewer than
// three already follow (so you must send one home first).
export function toggleFollow(id: number) {
  const p = wallet.pets.find((x) => x.id === id)
  if (!p) return
  if (p.following) p.following = false
  else if (followingCount() < MAX_FOLLOWERS) p.following = true
}

// A cheap string that changes whenever the pet list or follow-state changes,
// so renderers know when to re-read.
export function petsSignature() {
  return wallet.pets.map((p) => `${p.id}${p.following ? 'F' : 'H'}`).join(',')
}
