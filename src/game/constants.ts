// ---- Tuning knobs (easy to adjust together with the kids) -------------------

// Player / camera
export const MOVE_SPEED = 5 // metres per second while walking
export const EYE_HEIGHT = 1.7 // camera height above the ground
export const PLAYER_RADIUS = 0.35 // how "wide" the player is for wall collisions

// The fenced garden is a square lawn from -GARDEN_HALF..+GARDEN_HALF on x and z.
export const GARDEN_HALF = 24
export const WALL_MARGIN = 0.6 // how far inside the fence the player is stopped

// Fence
export const FENCE_HEIGHT = 1.4

// ---- Cottage (built from primitives so you can walk inside) -----------------
// A big house (~5x the first version) at the back edge of the garden, with the
// door facing the garden (+z side).
export const COTTAGE_POS: [number, number, number] = [0, 0, -GARDEN_HALF + 8]
export const COTTAGE_HALF = 7 // half-width of the walls (interior ~14x14)
export const COTTAGE_WALL_T = 0.25 // wall thickness
export const COTTAGE_WALL_H = 5 // wall height
export const COTTAGE_DOOR_HALF = 1.3 // half-width of the door opening (front wall)

// Forest of living trees, scattered in a ring OUTSIDE the fence.
export const TREE_COUNT = 40
export const TREE_RING_MIN = GARDEN_HALF + 6
export const TREE_RING_MAX = GARDEN_HALF + 18
export const TREE_MIN_HEIGHT = 4.5
export const TREE_MAX_HEIGHT = 8.5

// ---- Graveyard (the dark area OUTSIDE the fence, where the zombies are) ------
export const GRAVE_COUNT = 18
export const DEAD_TREE_COUNT = 10
export const GRAVEYARD_BAND_MIN = GARDEN_HALF + 1.5 // just outside the fence
export const GRAVEYARD_BAND_MAX = GARDEN_HALF + 6.5

// Zombies patrol a RECTANGULAR ring outside the square fence (never get in).
export const ZOMBIE_COUNT = 6
export const ZOMBIE_HEIGHT = 1.85
export const ZOMBIE_SPEED = 0.8 // metres per second along the perimeter
export const ZOMBIE_OFFSET_MIN = 1.4 // metres beyond the fence
export const ZOMBIE_OFFSET_MAX = 4.5

// Companions (bee + ladybug) hover and trail the player inside the garden.
export const BEE_HEIGHT = 0.45 // model size, not altitude
export const LADYBUG_SIZE = 0.35
export const COMPANION_FOLLOW = 0.045 // 0..1 lerp — how quickly they catch up
export const COMPANION_ALTITUDE = 1.4 // how high they hover
