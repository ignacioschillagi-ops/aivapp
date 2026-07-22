import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  storage, getPerfilActivoId, getPerfilPrincipal,
  getPerfilesAdicionales, getEstadoMedidas,
  getPrendasPersonalizadas, setPrendasPersonalizadas
} from '../data/storage'
import { CATEGORIAS_BASE, CATEGORIAS_EXTRA, ICONOS } from '../data/categorias'
import { CONFIG_MEDIDAS } from '../data/medidas'
import SvgIcon from '../components/SvgIcon'

// Loads icon from /iconos/{icono}.svg, falls back to embedded SVG
function CategoriaIcon({ icono, size = 28 }) {
  const [useEmbed, setUseEmbed] = useState(false)
  if (useEmbed) {
    return <SvgIcon svg={ICONOS[icono] || ICONOS.percha} size={size} color="var(--coral)" />
  }
  return (
    <img
      src={`/iconos/${icono}.svg`}
      onError={() => setUseEmbed(true)}
      style={{ width: size, height: size, objectFit: 'contain' }}
      alt=""
    />
  )
}

export default function Ropero() {
  const navigate = useNavigate()
  const [perfilActivo, setPerfilActivo] = useState(null)
  const [perfilPrincipal, setPerfilPrincipal] = useState(null)
  const [perfilesAdicionales, setPerfilesAdicionales] = useState([])
  const [showSelector, setShowSelector] = useState(false)
  const [estados, setEstados] = useState({})
  const [agregadas, setAgregadas] = useState([])
  const [gestionando, setGestionando] = useState(false)
  const [extrasDisponibles, setExtrasDisponibles] = useState([])

  const cargar = useCallback(() => {
    const perfilId = getPerfilActivoId()
    const principal = getPerfilPrincipal()
    const adicionales = getPerfilesAdicionales()
    setPerfilPrincipal(principal)
    setPerfilesAdicionales(adicionales)
    let activo = principal
    if (perfilId !== 'principal') {
      activo = adicionales.find(p => p.id === perfilId) || principal
    }
    setPerfilActivo(activo)

    const personalizadas = getPrendasPersonalizadas(perfilId)
    const todasConocidas = [...CATEGORIAS_BASE, ...CATEGORIAS_EXTRA]
    const agr = personalizadas.map(p => {
      const conocida = todasConocidas.find(k => k.id === p.id)
      return { id: p.id, categoria: p.categoria, icono: conocida?.icono || 'percha', campos: p.campos || [] }
    })
    setAgregadas(agr)

    const agregadasIds = new Set(personalizadas.map(p => p.id))
    setExtrasDisponibles(CATEGORIAS_EXTRA.filter(p => !agregadasIds.has(p.id)))

    const nuevosEstados = {}
    const todasPrendas = [...CATEGORIAS_BASE, ...agr]
    todasPrendas.forEach(p => {
      const config = CONFIG_MEDIDAS[p.categoria] || p.campos || []
      nuevosEstados[p.categoria] = getEstadoMedidas(perfilId, p.categoria, config)
    })
    setEstados(nuevosEstados)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const cambiarPerfil = (id) => {
    storage.set('perfil_activo_id', id)
    setShowSelector(false)
    cargar()
  }

  const agregarCategoria = (prenda) => {
    const perfilId = getPerfilActivoId()
    const existentes = getPrendasPersonalizadas(perfilId)
    if (!existentes.find(p => p.id === prenda.id)) {
      setPrendasPersonalizadas(perfilId, [...existentes, { id: prenda.id, categoria: prenda.categoria }])
      cargar()
    }
  }

  const quitarCategoria = (id) => {
    const perfilId = getPerfilActivoId()
    const existentes = getPrendasPersonalizadas(perfilId)
    setPrendasPersonalizadas(perfilId, existentes.filter(p => p.id !== id))
    cargar()
  }

  const nombrePerfil = perfilActivo?.nombre
  const todosPerfiles = [
    { id: 'principal', nombre: perfilPrincipal?.nombre || 'Principal', avatar: perfilPrincipal?.avatar || '👤' },
    ...perfilesAdicionales.map(p => ({ id: p.id, nombre: p.nombre, avatar: p.avatar || '👤' }))
  ]
  const perfilActivoId = getPerfilActivoId()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 16px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <button
          onClick={() => setShowSelector(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--dark)' }}>
            {nombrePerfil ? `Ropero de ${nombrePerfil}` : 'Mi Ropero'}
          </h1>
          <span style={{ color: 'var(--coral)', fontSize: 18 }}>▾</span>
        </button>
      </div>

      {/* Profile selector dropdown */}
      {showSelector && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowSelector(false)} />
          <div style={{
            position: 'absolute', top: 110, left: 20, right: 20,
            background: 'white', borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 50, padding: 8, animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ padding: '8px 12px 4px' }}>
              <span className="section-label">Elegir perfil</span>
            </div>
            {todosPerfiles.map(p => (
              <button key={p.id} onClick={() => cambiarPerfil(p.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  background: perfilActivoId === p.id ? 'var(--coral-light)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left'
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: perfilActivoId === p.id ? 'var(--coral-light)' : 'var(--dark-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>{p.avatar}</div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: perfilActivoId === p.id ? 'var(--coral)' : 'var(--dark)' }}>{p.nombre}</span>
                {perfilActivoId === p.id && <span style={{ color: 'var(--coral)' }}>✓</span>}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--bg)', margin: '4px 0' }} />
            <button onClick={() => { setShowSelector(false); navigate('/perfil') }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--coral-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--coral)' }}>+</div>
              <span style={{ fontSize: 15, color: 'var(--coral)', fontWeight: 500 }}>Agregar persona</span>
            </button>
          </div>
        </>
      )}

      {/* Clothing list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {CATEGORIAS_BASE.map(prenda => (
          <PrendaItem key={prenda.id} prenda={prenda} estado={estados[prenda.categoria]}
            onClick={() => navigate(`/detalle/${encodeURIComponent(prenda.categoria)}`)} />
        ))}
        {agregadas.map(prenda => (
          <PrendaItem key={prenda.id} prenda={prenda} estado={estados[prenda.categoria]}
            onClick={() => !gestionando && navigate(`/detalle/${encodeURIComponent(prenda.categoria)}`)}
            gestionando={gestionando} onRemove={() => quitarCategoria(prenda.id)} />
        ))}

        <button onClick={() => setGestionando(g => !g)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', marginTop: 8, color: 'var(--coral)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          <span>{gestionando ? '▲' : '▼'}</span>
          {gestionando ? 'Cerrar' : 'Gestionar categorías'}
        </button>

        {gestionando && (
          <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
            {extrasDisponibles.map((prenda, index) => (
              <button key={prenda.id} onClick={() => agregarCategoria(prenda)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: index < extrasDisponibles.length - 1 ? '1px solid var(--bg)' : 'none', background: 'none', border: 'none', borderBottom: index < extrasDisponibles.length - 1 ? '1px solid var(--bg)' : 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                  <CategoriaIcon icono={prenda.icono} size={28} />
                </div>
                <span style={{ flex: 1, fontSize: 15, color: 'var(--dark)' }}>{prenda.categoria}</span>
                <span style={{ color: 'var(--coral)', fontSize: 20, fontWeight: 300 }}>+</span>
              </button>
            ))}
            <button onClick={() => navigate('/detalle/nueva')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%' }}>
              <span style={{ fontSize: 20 }}>+</span>Agregar tipo de prenda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PrendaItem({ prenda, estado, onClick, gestionando, onRemove }) {
  const estadoColor = { completo: 'var(--coral)', incompleto: '#f0a500', vacio: 'var(--dark-20)' }[estado || 'vacio']
  const estadoLabel = { completo: '● Completo', incompleto: '◐ Incompleto', vacio: '○ Sin medidas' }[estado || 'vacio']

  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
      borderBottom: '1px solid var(--dark-10)',
      cursor: gestionando ? 'default' : 'pointer',
      opacity: gestionando ? 0.6 : 1
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: 'var(--coral-light)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <CategoriaIcon icono={prenda.icono} size={28} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 2 }}>{prenda.categoria}</div>
        <div style={{ fontSize: 12, color: estadoColor, fontWeight: 500 }}>{estadoLabel}</div>
      </div>
      {gestionando && onRemove
        ? <button onClick={e => { e.stopPropagation(); onRemove() }} style={{ color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 18 }}>✕</button>
        : <span style={{ color: 'var(--dark-20)', fontSize: 18 }}>›</span>
      }
    </div>
  )
}
