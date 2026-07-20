import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storage, getPerfilActivoId, getPerfilPrincipal, getPerfilesAdicionales } from '../data/storage'

export default function Perfil() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [editando, setEditando] = useState(false)
  const [esPrincipal, setEsPrincipal] = useState(true)
  const [perfilId, setPerfilId] = useState('principal')
  const [perfilesDisponibles, setPerfilesDisponibles] = useState([])
  const [showNuevoPerfil, setShowNuevoPerfil] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaAltura, setNuevaAltura] = useState('')
  const [nuevoPeso, setNuevoPeso] = useState('')

  useEffect(() => { cargar(getPerfilActivoId()) }, [])

  const cargar = (id) => {
    storage.set('perfil_activo_id', id)
    setPerfilId(id)
    setEditando(false)
    if (id === 'principal') {
      const p = getPerfilPrincipal()
      if (p) { setNombre(p.nombre || ''); setAltura(p.altura || ''); setPeso(p.peso || ''); setFechaNacimiento(p.fechaNacimiento || '') }
      setEsPrincipal(true)
    } else {
      const adicionales = getPerfilesAdicionales()
      const p = adicionales.find(p => p.id === id)
      if (p) { setNombre(p.nombre || ''); setAltura(p.altura || ''); setPeso(p.peso || ''); setFechaNacimiento(p.fechaNacimiento || '') }
      setEsPrincipal(false)
    }
    const principal = getPerfilPrincipal()
    const adicionales = getPerfilesAdicionales()
    setPerfilesDisponibles([
      { id: 'principal', nombre: principal?.nombre || 'Principal' },
      ...adicionales.map(p => ({ id: p.id, nombre: p.nombre }))
    ])
  }

  const guardar = () => {
    const datos = { nombre, altura, peso, fechaNacimiento }
    if (esPrincipal) {
      storage.setJSON('perfil_principal', datos)
    } else {
      const adicionales = getPerfilesAdicionales()
      storage.setJSON('perfiles_adicionales', adicionales.map(p => p.id === perfilId ? { ...p, ...datos } : p))
    }
    setEditando(false)
    cargar(perfilId)
  }

  const agregarPerfil = () => {
    if (!nuevoNombre.trim()) return
    const adicionales = getPerfilesAdicionales()
    const nuevo = { id: `perfil_${Date.now()}`, nombre: nuevoNombre.trim(), altura: nuevaAltura, peso: nuevoPeso }
    storage.setJSON('perfiles_adicionales', [...adicionales, nuevo])
    storage.set('perfil_activo_id', nuevo.id)
    setShowNuevoPerfil(false)
    setNuevoNombre(''); setNuevaAltura(''); setNuevoPeso('')
    cargar(nuevo.id)
    navigate('/')
  }

  const resetear = () => {
    if (!confirm(`¿Borrar todas las medidas de ${nombre || 'este perfil'}?`)) return
    const categorias = ['Gorras y sombreros','Remeras y camisetas','Buzos y sweaters','Camperas','Jeans y pantalones','Zapatillas y Zapatos','Tapados y abrigos','Camisas','Blusas','Vestidos y enteritos','Shorts','Polleras y faldas','Ropa interior','Medias','Guantes','Musculosas','Botas','Tacos y stilettos']
    categorias.forEach(cat => storage.remove(`medidas_${perfilId}_${cat}`))
    storage.remove(`prendas_personalizadas_${perfilId}`)
    alert('Medidas reseteadas correctamente')
  }

  const eliminar = () => {
    if (!confirm(`¿Eliminar el perfil de ${nombre}? Esta acción no se puede deshacer.`)) return
    const adicionales = getPerfilesAdicionales()
    storage.setJSON('perfiles_adicionales', adicionales.filter(p => p.id !== perfilId))
    storage.remove(`prendas_personalizadas_${perfilId}`)
    storage.set('perfil_activo_id', 'principal')
    navigate('/')
  }

  const formatFecha = (text) => {
    const limpio = text.replace(/\D/g, '').slice(0, 8)
    if (limpio.length > 4) return `${limpio.slice(0,2)}/${limpio.slice(2,4)}/${limpio.slice(4)}`
    if (limpio.length > 2) return `${limpio.slice(0,2)}/${limpio.slice(2)}`
    return limpio
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Perfil</h1>
        <button
          onClick={editando ? guardar : () => setEditando(true)}
          style={{ background: editando ? 'var(--coral)' : 'transparent', color: editando ? 'white' : 'var(--coral)', border: editando ? 'none' : '1.5px solid var(--coral)', padding: editando ? '8px 18px' : '8px', borderRadius: editando ? 'var(--radius-full)' : '50%', cursor: 'pointer', fontWeight: 700, fontSize: 14, width: editando ? 'auto' : 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >{editando ? 'Guardar' : '✏️'}</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--coral-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>{nombre || 'Tu nombre'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="section-label">Datos personales</span>
          <FieldRow label="Nombre" editando={editando} valor={nombre} onChange={setNombre} placeholder="Tu nombre" />
          <div style={{ display: 'flex', gap: 12 }}>
            <FieldRow label="Altura" editando={editando} valor={altura} onChange={setAltura} placeholder="170" unidad="cm" type="number" style={{ flex: 1 }} />
            <FieldRow label="Peso" editando={editando} valor={peso} onChange={setPeso} placeholder="70" unidad="kg" type="number" style={{ flex: 1 }} />
          </div>
          <FieldRow label="Fecha de nacimiento" editando={editando} valor={fechaNacimiento} onChange={v => setFechaNacimiento(formatFecha(v))} placeholder="DD/MM/AAAA" type="tel" maxLength={10} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="section-label">Perfiles</span>
          <button onClick={() => setShowNuevoPerfil(true)} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 22 }}>➕</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Agregar persona</div>
              <div style={{ fontSize: 13, color: 'var(--dark-50)', marginTop: 2 }}>Creá un perfil para otra persona</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--dark-20)' }}>›</span>
          </button>
          {perfilesDisponibles.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {perfilesDisponibles.map(p => (
                <button key={p.id} className={`chip ${perfilId === p.id ? 'active' : ''}`} onClick={() => cargar(p.id)}>{p.nombre}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="section-label">Zona de peligro</span>
          <button onClick={resetear} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-light)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 20 }}>🔄</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger)' }}>Resetear medidas</div>
              <div style={{ fontSize: 12, color: 'var(--dark-50)', marginTop: 2 }}>Borra todas las medidas de este perfil</div>
            </div>
          </button>
          {!esPrincipal && (
            <button onClick={eliminar} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-light)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>🗑️</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger)' }}>Eliminar perfil</div>
                <div style={{ fontSize: 12, color: 'var(--dark-50)', marginTop: 2 }}>Esta acción no se puede deshacer</div>
              </div>
            </button>
          )}
        </div>

        <div style={{ paddingTop: 8, textAlign: 'center' }}>
          <Link to="/privacidad" style={{ fontSize: 13, color: 'var(--dark-50)' }}>Política de privacidad</Link>
        </div>
      </div>

      {showNuevoPerfil && (
        <div className="modal-overlay" onClick={() => setShowNuevoPerfil(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nuevo perfil</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Nombre *" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-md)', padding: '0 12px', border: '2px solid transparent' }}>
                  <input type="number" style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontSize: 15, fontFamily: 'var(--font)' }} placeholder="Altura" value={nuevaAltura} onChange={e => setNuevaAltura(e.target.value)} />
                  <span style={{ fontSize: 12, color: 'var(--dark-50)' }}>cm</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
                  <input type="number" style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 0', fontSize: 15, fontFamily: 'var(--font)' }} placeholder="Peso" value={nuevoPeso} onChange={e => setNuevoPeso(e.target.value)} />
                  <span style={{ fontSize: 12, color: 'var(--dark-50)' }}>kg</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowNuevoPerfil(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={agregarPerfil} disabled={!nuevoNombre.trim()}>Crear perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FieldRow({ label, editando, valor, onChange, placeholder, unidad, type = 'text', maxLength, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-50)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      {editando ? (
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-md)', border: '2px solid var(--coral)', padding: '0 14px' }}>
          <input type={type} style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'var(--font)', color: 'var(--dark)' }} value={valor} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />
          {unidad && <span style={{ fontSize: 13, color: 'var(--dark-50)', fontWeight: 600 }}>{unidad}</span>}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '14px 16px', fontSize: 15, color: 'var(--dark)' }}>
          {valor ? `${valor}${unidad ? ` ${unidad}` : ''}` : '—'}
        </div>
      )}
    </div>
  )
}
