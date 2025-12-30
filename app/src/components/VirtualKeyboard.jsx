import React, { useEffect, useRef, useState } from 'react'
import './vk.css'

const PHYSICAL_KEY_MAP = {
  QWERTY: {
    'KeyQ':'Q','KeyW':'W','KeyE':'E','KeyR':'R','KeyT':'T','KeyY':'Y','KeyU':'U','KeyI':'I','KeyO':'O','KeyP':'P',
    'KeyA':'A','KeyS':'S','KeyD':'D','KeyF':'F','KeyG':'G','KeyH':'H','KeyJ':'J','KeyK':'K','KeyL':'L',
    'KeyZ':'Z','KeyX':'X','KeyC':'C','KeyV':'V','KeyB':'B','KeyN':'N','KeyM':'M','Space':' ','Backspace':'BACKSPACE','Enter':'ENTER'
  },
  AZERTY: {
    'KeyQ':'A','KeyW':'Z','KeyE':'E','KeyR':'R','KeyT':'T','KeyY':'Y','KeyU':'U','KeyI':'I','KeyO':'O','KeyP':'P',
    'KeyA':'Q','KeyS':'S','KeyD':'D','KeyF':'F','KeyG':'G','KeyH':'H','KeyJ':'J','KeyK':'K','KeyL':'L',
    'KeyZ':'W','KeyX':'X','KeyC':'C','KeyV':'V','KeyB':'B','KeyN':'N','KeyM':'M','Space':' ','Backspace':'BACKSPACE','Enter':'ENTER'
  },
  QWERTZ: {
    'KeyQ':'Q','KeyW':'W','KeyE':'E','KeyR':'R','KeyT':'T','KeyY':'Z','KeyU':'U','KeyI':'I','KeyO':'O','KeyP':'P',
    'KeyA':'A','KeyS':'S','KeyD':'D','KeyF':'F','KeyG':'G','KeyH':'H','KeyJ':'J','KeyK':'K','KeyL':'L',
    'KeyZ':'Y','KeyX':'X','KeyC':'C','KeyV':'V','KeyB':'B','KeyN':'N','KeyM':'M','Space':' ','Backspace':'BACKSPACE','Enter':'ENTER'
  }
}

const LAYOUT_DEFINITIONS = {
  AZERTY: [
    ['A','Z','E','R','T','Y','U','I','O','P'],
    ['Q','S','D','F','G','H','J','K','L','M'],
    ['W','X','C','V','B','N','É','À','Ç']
  ],
  QWERTY: [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
  ],
  QWERTZ: [
    ['Q','W','E','R','T','Z','U','I','O','P','Ü'],
    ['A','S','D','F','G','H','J','K','L','Ö','Ä'],
    ['Y','X','C','V','B','N','M','ẞ']
  ]
}

const getDefaultLayout = (lang) => {
  if(lang==='fr') return 'AZERTY'
  if(lang==='de') return 'QWERTZ'
  return 'QWERTY'
}

export default function VirtualKeyboard({ visible=true, lang='en' }){
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeLayout, setActiveLayout] = useState(getDefaultLayout(lang))
  const [pressedKey, setPressedKey] = useState(null)
  const [scale, setScale] = useState(parseFloat(localStorage.getItem('vk_scale'))||1)
  const [position, setPosition] = useState(() => { try{ return JSON.parse(localStorage.getItem('vk_pos')) || { x: 40, y: 120 } }catch(e){ return { x:40, y:120 } } })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x:0, y:0 })
  const ref = useRef(null)

  useEffect(()=>{ setActiveLayout(getDefaultLayout(lang)) }, [lang])

  useEffect(()=>{ try{ localStorage.setItem('vk_scale', String(scale)) }catch(e){} }, [scale])
  useEffect(()=>{ try{ localStorage.setItem('vk_pos', JSON.stringify(position)) }catch(e){} }, [position])
  useEffect(()=>{ try{ localStorage.setItem('vk_layout', activeLayout) }catch(e){} }, [activeLayout])

  // dragging handlers
  const handleMouseDown = (e) => {
    if((e.target).closest && (e.target).closest('.vk-key')) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  useEffect(()=>{
    if(!isDragging) return
    const onMove = (e)=>{
      const x = e.clientX - dragStartRef.current.x
      const y = e.clientY - dragStartRef.current.y
      // clamp using visual size
      const s = parseFloat(localStorage.getItem('vk_scale')||'1')||1
      const el = ref.current
      if(!el) return
      const visualW = Math.round(el.offsetWidth * s)
      const visualH = Math.round(el.offsetHeight * s)
      const left = Math.max(8, Math.min(window.innerWidth - visualW - 8, x))
      const top = Math.max(8, Math.min(window.innerHeight - visualH - 8, y))
      setPosition({ x: left, y: top })
    }
    const onUp = ()=> setIsDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return ()=>{ document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [isDragging])

  // physical keyboard
  useEffect(()=>{
    const handler = (e)=>{
      if(!isOpen) return
      const map = PHYSICAL_KEY_MAP[activeLayout] || PHYSICAL_KEY_MAP.QWERTY
      const m = map[e.code]
      if(m){ if(m==='BACKSPACE' || m==='ENTER'){ e.preventDefault(); sendKey(m) } else { sendKey(m) } }
    }
    document.addEventListener('keydown', handler)
    return ()=> document.removeEventListener('keydown', handler)
  }, [isOpen, activeLayout])

  const sendKey = (k)=>{
    setPressedKey(k)
    const active = document.activeElement
    if(k==='BACKSPACE'){ if(active && active.value!==undefined) active.value = active.value.slice(0,-1); active && active.focus && active.focus(); }
    else if(k==='ENTER'){ if(active && active.tagName==='TEXTAREA') active.value += '\n'; else active && active.form && active.form.requestSubmit && active.form.requestSubmit(); }
    else if(k===' ' || k==='Space'){ if(active && active.value!==undefined) active.value += ' '; active && active.focus && active.focus(); }
    else { if(active && active.value!==undefined) active.value += k; active && active.focus && active.focus(); }
    setTimeout(()=>setPressedKey(null), 120)
  }

  const adjustScale = (delta)=> setScale(s=>{ const next = Math.min(1.5, Math.max(0.5, +(s+delta).toFixed(2))); try{ localStorage.setItem('vk_scale', String(next)) }catch(e){} return next })

  if(!visible) return null

  const layout = LAYOUT_DEFINITIONS[activeLayout] || LAYOUT_DEFINITIONS.QWERTY

  return (
    <div ref={ref} className="vk-container" style={{ position: 'fixed', left: position.x, top: position.y, transform: `scale(${scale})`, transformOrigin: 'top left', zIndex: 9999 }}>
      <div className="vk-toolbar" onMouseDown={handleMouseDown} style={{ cursor: 'move', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{padding:'6px 8px', fontWeight:700}}>Virtual Keyboard</div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <label style={{fontSize:12}}>Layout</label>
          <select value={activeLayout} onChange={e=>setActiveLayout(e.target.value)}>
            <option value="AZERTY">AZERTY</option>
            <option value="QWERTY">QWERTY</option>
            <option value="QWERTZ">QWERTZ</option>
          </select>
          <button onClick={()=>adjustScale(-0.1)} style={{padding:'6px 8px'}}>−</button>
          <button onClick={()=>adjustScale(0.1)} style={{padding:'6px 8px'}}>+</button>
        </div>
      </div>
      <div className="vk-keys" style={{padding:12}}>
        {layout.map((row,i)=> (
          <div key={i} className="vk-row" style={{display:'flex', justifyContent:'center', gap:8, marginBottom:8}}>
            {row.map((k,j)=> (
              <button key={j} className="vk-key" onClick={()=>sendKey(k)} style={{minWidth:40, padding:'10px 8px'}}>{k}</button>
            ))}
          </div>
        ))}
        <div style={{display:'flex', justifyContent:'center', gap:12, marginTop:8}}>
          <button onClick={()=>sendKey('BACKSPACE')} className="vk-key" style={{minWidth:80}}>Backspace</button>
          <button onClick={()=>sendKey(' ')} className="vk-key" style={{minWidth:200}}>Space</button>
          <button onClick={()=>sendKey('ENTER')} className="vk-key" style={{minWidth:80}}>Enter</button>
        </div>
      </div>
    </div>
  )
}
