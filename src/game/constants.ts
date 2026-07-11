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

// ---- Coins (gold to pick up) ------------------------------------------------
// More coins OUTSIDE the fence, and worth more, to tempt the player past the
// zombies. Every coin spot comes back a little while after it's picked up
// ("lidt ad gangen"), so there is almost always something to collect.
export const GARDEN_COIN_COUNT = 20 // coins inside the fence
export const GARDEN_COIN_VALUE = 5
export const GRAVEYARD_COIN_COUNT = 24 // coins outside the fence, among the zombies
export const GRAVEYARD_COIN_VALUE = 10
export const COIN_RESPAWN_MIN = 8 // seconds before a picked-up coin spot returns
export const COIN_RESPAWN_MAX = 16

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

// Zombies patrol a RECTANGULAR ring outside the square fence (never get in),
// but HUNT the player once she steps outside the gate.
export const ZOMBIE_COUNT = 6
export const ZOMBIE_HEIGHT = 1.85
export const ZOMBIE_SPEED = 0.8 // metres per second while patrolling the perimeter
export const ZOMBIE_OFFSET_MIN = 1.4 // metres beyond the fence
export const ZOMBIE_OFFSET_MAX = 4.5
export const ZOMBIE_CHASE_SPEED = 2.8 // m/s when hunting (below player speed, so escapable)
export const ZOMBIE_AGGRO = 26 // start hunting when the player is this close AND outside
export const CATCH_DISTANCE = 1.6 // caught if a zombie gets this close (outside only)
export const CAUGHT_GOLD_LOSS = 0.3 // lose this fraction of your gold when caught

// Companions (bee + ladybug) hover and trail the player inside the garden.
export const BEE_HEIGHT = 0.45 // model size, not altitude
export const LADYBUG_SIZE = 0.35
export const COMPANION_FOLLOW = 0.045 // 0..1 lerp — how quickly they catch up
export const COMPANION_ALTITUDE = 1.4 // how high they hover
