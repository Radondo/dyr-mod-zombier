// Mutable game wallet + owned pets — a module-level singleton, same no-rerender
// pattern as input.ts. Game logic (coin pickups, shop, getting caught) mutates
// it directly; the HUD polls it each frame.

export const STARTING_GOLD = 100

export const wallet = {
  gold: STARTING_GOLD,
  pets: [] as string[], // e.g. ['dog', 'cat', 'bird:robin']
}

export function addGold(amount: number) {
  wallet.gold = Math.max(0, wallet.gold + amount)
}
