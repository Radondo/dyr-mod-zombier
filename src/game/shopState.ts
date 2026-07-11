// Shared shop UI state (same no-rerender singleton pattern as input/wallet).
// The in-world Shop writes the current "buy" prompt; the HTML ShopPrompt reads it.
export const shopUI = {
  prompt: null as string | null,
  affordable: false,
}
