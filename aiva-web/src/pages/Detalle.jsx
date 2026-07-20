import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPerfilActivoId, getMedidas, setMedidas, storage } from '../data/storage'
import { CONFIG_MEDIDAS } from '../data/medidas'
import { SVG_ILUSTRACIONES } from '../data/svgIlustraciones'

function parseLineas(svgStr) {
  const lineas = []
  const re = /<line([^/]*)\/?>/g
  let m
  while ((m = re.exec(svgStr)) !== null) {
    const attrs = m[1]
    const get = (attr) => {
      const a = new RegExp(`${attr}="([^"]*)"`, 'i').exec(attrs)
      return a ? parseFloat(a[1]) : 0
    }
    lineas.push({ x1: get('x1'), y1: get('y1'), x2: get('x2'), y2: get('y2') })
  }
  return lineas
}

function sketchSvg(svgStr) {
  return svgStr.replace('<svg ', '<svg width="100%" height="100%" ')
}

function IlustracionMedicion({ categoria, campos, valores, campoActivo, onClickLinea }) {
  const ilustracion = SVG_ILUSTRACIONES[categoria]
  const lineas = useMemo(() => ilustracion ? parseLineas(ilustracion.guias) : [], [ilustracion])
  const prendaHtml = useMemo(() => ilustracion ? sketchSvg(ilustracion.prenda) : null, [ilustracion])

  if (!ilustracion) {
    return (
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        aspectRatio: '1', boxShadow: 'var(--shadow-sm)',
        fontSize: 64, color: 'var(--dark-20)'
      }}>
        👔
      </div>
    )
  }

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-lg)',
      aspectRatio: '1', position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)', width: '100%'
    }}>
      <div
        dangerouslySetInnerHTML={{ __html: prendaHtml }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <svg viewBox="0 0 800 800" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {lineas.map((ln, i) => {
          const campo = campos[i]
          const isFilled = campo && valores[campo.id] && valores[campo.id] !== ''
          const isActive = campo && campoActivo === campo.id
          const strokeColor = (isFilled || isActive) ? '#f58e81' : '#aaa'
          const strokeOpacity = isActive ? 1 : isFilled ? 0.9 : 0.5
          const strokeWidth = isActive ? 8 : isFilled ? 6 : 5
          return (
            <g key={i} onClick={() => campo && onClickLinea(campo.id)} style={{ cursor: campo ? 'pointer' : 'default' }}>
              <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke="transparent" strokeWidth="40" />
              <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={strokeColor} strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity} strokeLinecap="round"
                style={{ transition: 'all 0.2s' }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Detalle() {
  const { categoria } = useParams()
  const categoriaDecoded = decodeURIComponent(categoria)
  const navigate = useNavigate()
  const [valores, setValores] = useState({})
  const [notas, setNotas] = useState('')
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState(null)
  const [campoActivo, setCampoActivo] = useState(null)
  const inputRefs = useRef({})
  const campos = CONFIG_MEDIDAS[categoriaDecoded] || []

  useEffect(() => {
    if (!categoriaDecoded || categoriaDecoded === 'nueva') return
    const perfilId = getPerfilActivoId()
    const medidas = getMedidas(perfilId, categoriaDecoded)
    const { __notas__: n, ...rest } = medidas
    setValores(rest)
    setNotas(n || '')
  }, [categoriaDecoded])

  const handleGuardar = () => {
    if (Object.values(valores).filter(Boolean).length === 0 && !notas.trim()) {
      setError('Completá al menos una medida o nota antes de guardar.')
      return
    }
    const perfilId = getPerfilActivoId()
    setMedidas(perfilId, categoriaDecoded, { ...valores, __notas__: notas })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
    setError(null)
  }

  const handleClickLinea = (campoId) => {
    setCampoActivo(campoId)
    const el = inputRefs.current[campoId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => el.focus(), 300)
    }
  }

  if (categoriaDecoded === 'nueva') return <NuevaPrenda />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: 'var(--shadow-sm)' }}>‹</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>{categoriaDecoded}</h1>
        <button onClick={handleGuardar} style={{ background: guardado ? '#4caf50' : 'var(--coral)', color: 'white', padding: '8px 18px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'background 0.2s' }}>
          {guardado ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <IlustracionMedicion
          categoria={categoriaDecoded} campos={campos}
          valores={valores} campoActivo={campoActivo}
          onClickLinea={handleClickLinea}
        />

        {campos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="section-label">Medidas</span>
            {campos.map(campo => (
              <MedidaField
                key={campo.id} campo={campo}
                valor={valores[campo.id] || ''}
                isActive={campoActivo === campo.id}
                onChange={v => setValores(prev => ({ ...prev, [campo.id]: v }))}
                onFocus={() => setCampoActivo(campo.id)}
                onBlur={() => setCampoActivo(null)}
                inputRef={el => inputRefs.current[campo.id] = el}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="section-label">Notas</span>
          <textarea className="input-field" style={{ resize: 'none', minHeight: 80, padding: 14, lineHeight: 1.5 }}
            placeholder="Observaciones, marcas favoritas, talle habitual..."
            value={notas} onChange={e => setNotas(e.target.value)} />
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-md)', padding: 12, color: 'var(--danger)', fontSize: 14 }}>{error}</div>
        )}
      </div>
    </div>
  )
}

function MedidaField({ campo, valor, isActive, onChange, onFocus, onBlur, inputRef }) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-md)', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)',
      border: `2px solid ${isActive ? 'var(--coral)' : valor ? 'rgba(245,142,129,0.3)' : 'transparent'}`,
      transition: 'border-color 0.2s'
    }}>
      <span style={{ flex: 1, fontSize: 15, color: 'var(--dark)' }}>{campo.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input ref={inputRef} type="number" value={valor}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="0"
          style={{ width: 60, textAlign: 'right', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, fontWeight: 700, color: valor ? 'var(--coral)' : 'var(--dark-20)', fontFamily: 'var(--font)', transition: 'color 0.2s' }}
        />
        <span style={{ fontSize: 13, color: 'var(--dark-50)', fontWeight: 600 }}>cm</span>
      </div>
    </div>
  )
}

function NuevaPrenda() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [campos, setCampos] = useState([{ id: `c_${Date.now()}`, label: '', valor: '' }])

  const guardar = () => {
    if (!nombre.trim() || !campos.some(c => c.label.trim())) return
    const perfilId = getPerfilActivoId()
    const clave = `prendas_personalizadas_${perfilId}`
    const existentes = storage.getJSON(clave) || []
    const nueva = { id: `custom_${Date.now()}`, categoria: nombre.trim(), campos: campos.filter(c => c.label.trim()).map(c => ({ id: c.id, label: c.label.trim(), placeholder: 'ej: 00 cm' })) }
    const valoresGuardados = {}
    campos.filter(c => c.label.trim() && c.valor).forEach(c => { valoresGuardados[c.id] = c.valor })
    storage.setJSON(clave, [...existentes, nueva])
    if (Object.keys(valoresGuardados).length > 0) setMedidas(perfilId, nombre.trim(), valoresGuardados)
    navigate(-1)
  }

  const canSave = nombre.trim() && campos.some(c => c.label.trim())
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: 'var(--shadow-sm)' }}>‹</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>Nueva prenda</h1>
        <button onClick={guardar} disabled={!canSave} style={{ background: canSave ? 'var(--coral)' : 'var(--dark-20)', color: 'white', padding: '8px 18px', borderRadius: 'var(--radius-full)', border: 'none', cursor: canSave ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14 }}>Guardar</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="section-label">Nombre de la prenda</span>
          <input className="input-field" placeholder="Ej: Kimono, Ropa de ski..." value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="section-label">Medidas (al menos una)</span>
          {campos.map((campo) => (
            <div key={campo.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="input-field" style={{ flex: 1 }} placeholder="Ej: Cintura, Largo..." value={campo.label} onChange={e => setCampos(prev => prev.map(c => c.id === campo.id ? { ...c, label: e.target.value } : c))} />
              <input type="number" className="input-field" style={{ width: 70, textAlign: 'center', color: 'var(--coral)', fontWeight: 700 }} placeholder="cm" value={campo.valor} onChange={e => setCampos(prev => prev.map(c => c.id === campo.id ? { ...c, valor: e.target.value } : c))} />
              {campos.length > 1 && <button onClick={() => setCampos(prev => prev.filter(c => c.id !== campo.id))} style={{ color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4 }}>✕</button>}
            </div>
          ))}
          <button onClick={() => setCampos(prev => [...prev, { id: `c_${Date.now()}`, label: '', valor: '' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>+ Agregar medida</button>
        </div>
      </div>
    </div>
  )
}
