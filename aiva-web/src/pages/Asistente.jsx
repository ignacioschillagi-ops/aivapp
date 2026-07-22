import { useState, useEffect, useRef } from 'react'
import { getGroqKey, setGroqKey, removeGroqKey, getPerfilActivoId, getMedidas } from '../data/storage'
import { TODAS_LAS_CATEGORIAS_NOMBRES } from '../data/categorias'
import { CONFIG_MEDIDAS } from '../data/medidas'
import { LOGO_ICONO } from '../data/logos'

const SYSTEM_PROMPT = (medidas) => `Sos Aiva, una asesora de moda personal experta y amigable. Hablás en español argentino, de manera cálida y directa.

Tenés acceso a las medidas del usuario:
${medidas}

Tus capacidades:
1. ASESORA DE MODA: Respondés preguntas sobre moda, outfits, estilos y tendencias.
2. TABLA DE TALLES: Cuando el usuario sube una foto de una tabla de talles, analizás la imagen, comparás con sus medidas guardadas y recomendás el talle exacto.
3. ESTIMACION DE MEDIDAS: Cuando el usuario sube una foto de una prenda con un objeto de referencia (desodorante, moneda, botella, etc.), estimás las medidas de la prenda en centímetros. SOLO brindás las medidas estimadas, SIN recomendar si le entra o no.

Cuando estimás medidas, SIEMPRE listalas así (una por línea):
- Nombre de la medida: XX cm

Sé concisa, útil y entusiasta.`

const detectarMedidas = (texto) => {
  const lineas = texto.split('\n')
  const medidas = []
  const patrones = [
    /^[-•*]\s*(.+?):\s*(\d+(?:[.,]\d+)?)\s*cm/i,
    /^\*\*(.+?)\*\*[:\s]+(\d+(?:[.,]\d+)?)\s*cm/i,
    /^(.+?):\s*(\d+(?:[.,]\d+)?)\s*cm$/i,
  ]
  for (const linea of lineas) {
    const trimmed = linea.trim()
    for (const patron of patrones) {
      const match = trimmed.match(patron)
      if (match && match[1].trim().length < 50) {
        medidas.push({ label: match[1].trim().replace(/\*+/g, ''), valor: match[2].replace(',', '.') })
        break
      }
    }
  }
  return medidas
}

const sugerirCategoria = (texto) => {
  const t = texto.toLowerCase()
  const mapeo = [
    { palabras: ['remera', 'camiseta', 't-shirt'], cat: 'Remeras y camisetas' },
    { palabras: ['camisa'], cat: 'Camisas' },
    { palabras: ['buzo', 'sweater', 'hoodie'], cat: 'Buzos y sweaters' },
    { palabras: ['campera', 'chaqueta', 'jacket'], cat: 'Camperas' },
    { palabras: ['tapado', 'abrigo'], cat: 'Tapados y abrigos' },
    { palabras: ['pantalon', 'pantalón', 'jean'], cat: 'Jeans y pantalones' },
    { palabras: ['short', 'bermuda'], cat: 'Shorts' },
    { palabras: ['pollera', 'falda'], cat: 'Polleras y faldas' },
    { palabras: ['vestido', 'enterito'], cat: 'Vestidos y enteritos' },
    { palabras: ['blusa'], cat: 'Blusas' },
    { palabras: ['musculosa'], cat: 'Musculosas' },
    { palabras: ['zapatilla', 'zapato', 'sneaker'], cat: 'Zapatillas y Zapatos' },
    { palabras: ['bota'], cat: 'Botas' },
    { palabras: ['taco', 'stiletto'], cat: 'Tacos y stilettos' },
    { palabras: ['gorra', 'sombrero'], cat: 'Gorras y sombreros' },
    { palabras: ['guante'], cat: 'Guantes' },
    { palabras: ['media'], cat: 'Medias' },
  ]
  for (const { palabras, cat } of mapeo) {
    if (palabras.some(p => t.includes(p))) return cat
  }
  return TODAS_LAS_CATEGORIAS_NOMBRES[0]
}

const MSG_INICIAL = {
  id: '0', rol: 'assistant',
  texto: 'Hola! Soy Aiva, tu asesora de moda personal 👗\n\nPuedo ayudarte a:\n📏 Estimar medidas de prendas desde una foto\n👕 Analizar tablas de talles y recomendarte tu talle\n😎 Responder dudas de moda y estilo\n\n¿En qué te ayudo hoy?'
}

export default function Asistente() {
  const [apiKey, setApiKeyState] = useState(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [mensajes, setMensajes] = useState([MSG_INICIAL])
  const [texto, setTexto] = useState('')
  const [medidas, setMedidasState] = useState('')
  const [modalGuardar, setModalGuardar] = useState(null) // { medidas, textoRespuesta }
  const [catSeleccionada, setCatSeleccionada] = useState('')
  const [imgPreview, setImgPreview] = useState(null)
  const [imgBase64, setImgBase64] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const key = getGroqKey()
    setApiKeyState(key)
    setChecking(false)
    cargarMedidas()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const cargarMedidas = () => {
    const perfilId = getPerfilActivoId()
    let resumen = ''
    TODAS_LAS_CATEGORIAS_NOMBRES.forEach(cat => {
      const medidas = getMedidas(perfilId, cat)
      const { __notas__: _, ...vals } = medidas
      const campos = Object.entries(vals)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v} cm`).join(', ')
      if (campos) resumen += `${cat}: ${campos}\n`
    })
    setMedidasState(resumen || 'Sin medidas cargadas.')
  }

  const guardarKey = async () => {
    const key = apiKeyInput.trim()
    if (!key.startsWith('gsk_')) {
      alert('La API key de Groq debe empezar con "gsk_"')
      return
    }
    setLoading(true)
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 10, messages: [{ role: 'user', content: 'hola' }] })
      })
      const d = await r.json()
      if (d.error) { alert('Key inválida. Revisá que esté bien copiada.'); return }
      setGroqKey(key)
      setApiKeyState(key)
      alert('¡API key activada correctamente! Ya podés usar Aiva.')
    } catch {
      alert('Error de conexión. Verificá tu internet e intentá de nuevo.')
    } finally { setLoading(false) }
  }

  const handleImagen = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target.result
      setImgPreview(result)
      setImgBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const enviar = async () => {
    if (!texto.trim() && !imgBase64) return
    const nuevoMsg = { id: Date.now().toString(), rol: 'user', texto: texto.trim(), imagen: imgPreview }
    const historial = [...mensajes, nuevoMsg]
    setMensajes(historial)
    setTexto('')
    setImgPreview(null)
    const b64 = imgBase64
    setImgBase64(null)
    setLoading(true)

    try {
      const msgs = historial.filter(m => m.id !== '0').map(m => {
        if (m.rol === 'user' && m.imagen && b64) {
          return { role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
            { type: 'text', text: m.texto || 'Analizá esta imagen.' }
          ]}
        }
        return { role: m.rol === 'assistant' ? 'assistant' : 'user', content: m.texto || '.' }
      })

      const modelo = b64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile'
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelo, max_tokens: 1000,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(medidas) }, ...msgs]
        })
      })
      const data = await r.json()
      const respuesta = data.choices?.[0]?.message?.content ?? 'No pude procesar tu consulta.'
      const medidasDetectadas = detectarMedidas(respuesta)
      setMensajes(prev => [...prev, {
        id: Date.now().toString(), rol: 'assistant', texto: respuesta,
        medidas: medidasDetectadas.length > 0 ? medidasDetectadas : undefined
      }])
    } catch {
      setMensajes(prev => [...prev, {
        id: Date.now().toString(), rol: 'assistant',
        texto: 'Error al conectar. Verificá tu API key e intentá de nuevo.'
      }])
    } finally { setLoading(false) }
  }

  const guardarMedidas = () => {
    if (!catSeleccionada || !modalGuardar) return
    const perfilId = getPerfilActivoId()
    const config = CONFIG_MEDIDAS[catSeleccionada]
    const existentes = getMedidas(perfilId, catSeleccionada)
    const nuevas = { ...existentes }

    if (config) {
      const COMUNES = new Set(['ancho', 'largo', 'de', 'del', 'la', 'el', 'total', 'contorno', 'altura', 'por'])
      for (const m of modalGuardar.medidas) {
        const val = parseFloat(m.valor)
        if (isNaN(val) || val < 8 || val > 250) continue
        const ml = m.label.toLowerCase()
        for (const campo of config) {
          const cl = campo.label.toLowerCase()
          const mlP = ml.split(' ').filter(p => p.length > 3 && !COMUNES.has(p))
          const clP = cl.split(' ').filter(p => p.length > 3 && !COMUNES.has(p))
          const ok = cl.includes(ml) || ml.includes(cl) ||
            (mlP.length > 0 && mlP.some(p => cl.includes(p))) ||
            (clP.length > 0 && clP.some(p => ml.includes(p)))
          if (ok) { nuevas[campo.id] = m.valor; break }
        }
      }
    }

    const perfilId2 = getPerfilActivoId()
    const key = `medidas_${perfilId2}_${catSeleccionada}`
    localStorage.setItem(key, JSON.stringify(nuevas))
    setModalGuardar(null)
    alert(`Medidas guardadas en "${catSeleccionada}"`)
  }

  if (checking) return <div style={{ flex: 1, background: 'var(--bg)' }} />

  if (!apiKey) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
        <AivaHeader apiKey={null} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Activá el Asistente AI</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-50)', lineHeight: 1.6 }}>
              Aiva usa IA para ayudarte con tu ropa. Necesitás una API key gratuita de Groq.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="section-label">Cómo obtener tu key gratis:</span>
            {[
              { n: 1, t: 'Entrá a console.groq.com y creá una cuenta gratuita' },
              { n: 2, t: 'Andá a "API Keys" y creá una nueva key' },
              { n: 3, t: 'Copiá la key (empieza con "gsk_") y pegala acá abajo' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--coral)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0
                }}>{s.n}</div>
                <span style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 2 }}>{s.t}</span>
              </div>
            ))}
          </div>

          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--coral)', fontSize: 14, fontWeight: 600, padding: 12
            }}
          >
            🔗 Abrir console.groq.com
          </a>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="input-field"
              placeholder="gsk_xxxxxxxxxxxxxxxx"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              type="password"
              style={{ fontFamily: 'monospace' }}
            />
            <button
              className="btn-primary"
              onClick={guardarKey}
              disabled={!apiKeyInput.trim() || loading}
            >
              {loading ? 'Verificando...' : 'Activar Aiva'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <AivaHeader
        apiKey={apiKey}
        onManageKey={() => {
          if (confirm(`Key activa: ...${apiKey.slice(-8)}\n\n¿Querés eliminarla?`)) {
            removeGroqKey()
            setApiKeyState(null)
            setApiKeyInput('')
          }
        }}
      />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mensajes.map(msg => (
          <MsgBurbuja
            key={msg.id}
            msg={msg}
            onGuardar={() => {
              setCatSeleccionada(sugerirCategoria(msg.texto))
              setModalGuardar({ medidas: msg.medidas, textoRespuesta: msg.texto })
            }}
          />
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <AivaAvatar />
            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)', padding: '12px 16px',
              boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 4
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)',
                  animation: `bounce 1s ease ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imgPreview && (
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={imgPreview} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} alt="" />
          <button
            onClick={() => { setImgPreview(null); setImgBase64(null) }}
            style={{ color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
          >✕</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '12px 16px',
        background: 'white', borderTop: '1px solid var(--bg)'
      }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagen} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--coral-light)', border: 'none',
            cursor: 'pointer', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
        >📷</button>
        <textarea
          style={{
            flex: 1, background: 'var(--bg)', border: 'none', outline: 'none',
            borderRadius: 20, padding: '10px 16px', fontSize: 15, lineHeight: 1.4,
            resize: 'none', maxHeight: 100, fontFamily: 'var(--font)', color: 'var(--dark)'
          }}
          placeholder="Preguntale a Aiva..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          rows={1}
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() && !imgBase64 || loading}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: (!texto.trim() && !imgBase64) || loading ? 'var(--dark-20)' : 'var(--coral)',
            border: 'none', cursor: (!texto.trim() && !imgBase64) || loading ? 'not-allowed' : 'pointer',
            color: 'white', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.15s'
          }}
        >→</button>
      </div>

      {/* Save measurements modal */}
      {modalGuardar && (
        <div className="modal-overlay" onClick={() => setModalGuardar(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Guardar medidas en...</h3>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modalGuardar.medidas.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{m.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--coral)' }}>{m.valor} cm</span>
                </div>
              ))}
            </div>

            <span className="section-label" style={{ display: 'block', marginBottom: 10 }}>Elegí la prenda:</span>
            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
              {TODAS_LAS_CATEGORIAS_NOMBRES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatSeleccionada(cat)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 0', borderBottom: '1px solid var(--bg)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <span style={{
                    flex: 1, fontSize: 15,
                    color: catSeleccionada === cat ? 'var(--coral)' : 'var(--dark)',
                    fontWeight: catSeleccionada === cat ? 600 : 400
                  }}>{cat}</span>
                  {catSeleccionada === cat && <span style={{ color: 'var(--coral)' }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setModalGuardar(null)}
                className="btn-outline" style={{ flex: 1 }}
              >Cancelar</button>
              <button
                onClick={guardarMedidas}
                className="btn-primary" style={{ flex: 1 }}
                disabled={!catSeleccionada}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function AivaHeader({ apiKey, onManageKey }) {
  return (
    <div style={{
      padding: '24px 20px 16px',
      background: 'white', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <AivaAvatar size={44} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Aiva</div>
        <div style={{ fontSize: 12, color: 'var(--dark-50)' }}>Asesora de moda IA</div>
      </div>
      {apiKey && onManageKey && (
        <button
          onClick={onManageKey}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--coral)', fontSize: 13, fontWeight: 600, padding: 8
          }}
        >🔑</button>
      )}
    </div>
  )
}

function AivaAvatar({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <div
        dangerouslySetInnerHTML={{ __html: LOGO_ICONO }}
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
    </div>
  )
}

function MsgBurbuja({ msg, onGuardar }) {
  const esUsuario = msg.rol === 'user'
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: esUsuario ? 'flex-end' : 'flex-start' }}>
      {!esUsuario && <AivaAvatar />}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          borderRadius: 18,
          borderBottomRightRadius: esUsuario ? 4 : 18,
          borderBottomLeftRadius: esUsuario ? 18 : 4,
          padding: '10px 14px',
          background: esUsuario ? 'var(--coral)' : 'white',
          boxShadow: esUsuario ? 'none' : 'var(--shadow-sm)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          {msg.imagen && (
            <img src={msg.imagen} style={{ width: 180, height: 180, borderRadius: 10, objectFit: 'cover' }} alt="" />
          )}
          {msg.texto && (
            <p style={{
              fontSize: 15, lineHeight: 1.5, margin: 0,
              color: esUsuario ? 'white' : 'var(--dark)',
              whiteSpace: 'pre-wrap'
            }}>{msg.texto}</p>
          )}
        </div>
        {!esUsuario && msg.medidas && msg.medidas.length > 0 && (
          <button
            onClick={onGuardar}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--coral)', color: 'white',
              padding: '8px 14px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start'
            }}
          >
            💾 Guardar medidas en mi ropero
          </button>
        )}
      </div>
    </div>
  )
}
