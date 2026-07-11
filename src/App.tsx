import { useState } from 'react'
import { Scene } from './game/Scene'
import { TouchControls } from './game/TouchControls'
import { isTouchDevice } from './game/input'

function App() {
  // The hint hides on the first interaction (click / touch).
  const [started, setStarted] = useState(false)

  return (
    <div className="game" onPointerDown={() => setStarted(true)}>
      <Scene />

      <div className="crosshair" />

      {isTouchDevice && <TouchControls onStart={() => setStarted(true)} />}

      {!started && (
        <div className="hint">
          <div className="hint-title">Dyr Mod Zombier 🐞🐝</div>
          {isTouchDevice ? (
            <>
              <div className="hint-line">Venstre side: gå · Højre side: kig rundt</div>
              <div className="hint-line">Rør skærmen for at starte</div>
            </>
          ) : (
            <>
              <div className="hint-line">Klik og træk musen for at kigge rundt</div>
              <div className="hint-line">WASD eller piletaster for at gå</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
