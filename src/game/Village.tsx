import { HOUSES } from './layout'
import { House } from './House'

/** The little village of ten tall houses (one is the BUTIK shop). */
export function Village() {
  return (
    <group>
      {HOUSES.map((def, i) => (
        <House key={i} def={def} />
      ))}
    </group>
  )
}
