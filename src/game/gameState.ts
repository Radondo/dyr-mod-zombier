import { wallet } from './wallet'
import { CAUGHT_GOLD_LOSS } from './constants'

// Small shared game-state singleton (same no-rerender pattern as input/wallet).
export const gameState = {
  caught: false,
  lastLoss: 0,
}

// Called when a zombie catches the player outside the fence: lose some gold,
// flash the "Fanget!" banner, and let the caller teleport the player home.
export function triggerCaught() {
  if (gameState.caught) return
  const loss = Math.ceil(wallet.gold * CAUGHT_GOLD_LOSS)
  wallet.gold = Math.max(0, wallet.gold - loss)
  gameState.lastLoss = loss
  gameState.caught = true
  setTimeout(() => {
    gameState.caught = false
  }, 1900)
}
