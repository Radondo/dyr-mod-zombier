// Resolve a public asset path against Vite's base URL.
//
// In dev BASE_URL is "/", so asset('/models/x.glb') → "/models/x.glb".
// When built for GitHub Pages with base '/dyr-mod-zombier/', the same call
// gives "/dyr-mod-zombier/models/x.glb" — so runtime-loaded models/textures
// resolve correctly under the project sub-path instead of 404ing at the root.
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
