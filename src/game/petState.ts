// Shared "talk to a pet" prompt (same no-rerender singleton pattern as shopUI).
// The Pets component writes it; the HTML ShopPrompt reads it.
export const petUI = {
  prompt: null as string | null,
}
