import React, { useState } from 'react'
import VirtualKeyboard from './components/VirtualKeyboard'

export default function App(){
  const [showVK, setShowVK] = useState(true)
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>So You — Preview App</h1>
        <button onClick={()=>setShowVK(v=>!v)} className="btn">Toggle Keyboard</button>
      </header>
      <main className="app-main">
        <p>This is a small preview app used for keyboard/theme prototyping.</p>
        <input placeholder="Focus here and use virtual keyboard" />
      </main>
      <VirtualKeyboard visible={showVK} />
    </div>
  )
}
