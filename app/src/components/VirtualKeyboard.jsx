import React, { useEffect, useRef, useState } from 'react'
import './vk.css'

const LAYOUTS = {
  qwerty: [
    ['1','2','3','4','5','6','7','8','9','0','-','=', 'Backspace'],
    ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    ['a','s','d','f','g','h','j','k','l',';','\'', 'Enter'],
    ['z','x','c','v','b','n','m',',','.','/'],
    ['Space']
  ],
  azerty: [
    ['&','\u00e9','\"','\'','(','-','\u00e8','_','\u00e7','\u00e0',')','=','Backspace'],
    ['a','z','e','r','t','y','u','i','o','p','^','$','*'],
    ['q','s','d','f','g','h','j','k','l','m','Enter'],
    ['<','w','x','c','v','b','n',',',';',':','!'],
    ['Space']
  ]
}

export default function VirtualKeyboard({ visible=true }){
  const [layout, setLayout] = useState(localStorage.getItem('vk_layout') || 'qwerty')
  const [scale, setScale] = useState(parseFloat(localStorage.getItem('vk_scale')) || 1)
  const ref = useRef(null)
  const dragging = useRef(false)
  const offset = useRef({x:0,y:0})

  useEffect(()=>{
    localStorage.setItem('vk_layout', layout)
  },[layout])
  useEffect(()=>{
    localStorage.setItem('vk_scale', String(scale))
  },[scale])

  useEffect(()=>{
    // restore position
    try{
      const pos = JSON.parse(localStorage.getItem('app_vk_pos')||'null')
      if(pos && ref.current){ ref.current.style.left = pos.left + 'px'; ref.current.style.top = pos.top + 'px'; ref.current.style.transform = 'none' }
    }catch(e){}
  },[])

  useEffect(()=>{
    function onPointerMove(e){ if(!dragging.current) return; const el = ref.current; const left = e.clientX - offset.current.x; const top = e.clientY - offset.current.y; el.style.left = Math.max(8, Math.min(window.innerWidth - el.offsetWidth - 8, left)) + 'px'; el.style.top = Math.max(8, Math.min(window.innerHeight - el.offsetHeight - 8, top)) + 'px'; el.style.transform = 'none' }
    function onPointerUp(e){ if(!dragging.current) return; dragging.current = false; try{ const el=ref.current; localStorage.setItem('app_vk_pos', JSON.stringify({ left: parseInt(el.style.left,10)||0, top: parseInt(el.style.top,10)||0 })); }catch(e){} }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return ()=>{ window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp) }
  },[])

  function onPointerDown(e){ if(e.target.closest && e.target.closest('.vk-key')) return; dragging.current = true; const r = ref.current.getBoundingClientRect(); offset.current.x = e.clientX - r.left; offset.current.y = e.clientY - r.top; }

  function sendKey(k){ const active = document.activeElement; if(!active) return; if(k==='Backspace'){ if(active.value!==undefined) active.value = active.value.slice(0,-1); active.focus(); return } if(k==='Enter'){ if(active.tagName==='TEXTAREA'){ active.value += '\n'; } else { active.form && active.form.requestSubmit && active.form.requestSubmit(); } return } if(k==='Space'){ if(active.value!==undefined){ active.value += ' '; active.focus(); } return } if(active.value!==undefined){ active.value += k; active.focus() }
  }

  if(!visible) return null
  return (
    <div ref={ref} className="vk-container" onPointerDown={onPointerDown} style={{ transform:`scale(${scale})` }}>
      <div className="vk-toolbar">
        <div>Virtual Keyboard</div>
        <div className="vk-controls">
          <select value={layout} onChange={e=>setLayout(e.target.value)}>
            <option value="qwerty">QWERTY</option>
            <option value="azerty">AZERTY</option>
          </select>
          <button onClick={()=>setScale(s=>Math.max(0.6, +(s-0.1).toFixed(2)))}>-</button>
          <button onClick={()=>setScale(s=>Math.min(1.5, +(s+0.1).toFixed(2)))}>+</button>
        </div>
      </div>
      <div className="vk-keys">
        {LAYOUTS[layout].map((row,i)=>(
          <div key={i} className="vk-row">
            {row.map((k,j)=>(
              <button key={j} className="vk-key" onClick={()=>sendKey(k)}>{k==='Space'? '␣' : k}</button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
