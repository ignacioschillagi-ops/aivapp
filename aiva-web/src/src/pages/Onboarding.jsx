import { useState } from 'react'
import { storage } from '../data/storage'
import { LOGO_SVG } from '../data/logos'

const AVATARES = ['👤','👨','👩','🧑','👦','👧','👴','👵','👶','🧒','🧓','🎅','🤶','🤖','👽','👸','🤴','🦸','🦹','🧙']

export default function Onboarding({ onComplete }) {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [avatar, setAvatar] = useState('👤')
  const [showAvatares, setShowAvatares] = useState(false)

  const siguiente = () => setPaso(p => p + 1)

  const finalizar = () => {
    storage.set('onboarding_completo', 'true')
    storage.setJSON('perfil_principal', { nombre, altura, peso, avatar, modo: 'familiar' })
    onComplete()
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 480, margin: '0 auto', width: '100%'
    }}>
      {/* Progress dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '16px 0 0',
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)'
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 8,
            width: paso === i ? 24 : 8,
            borderRadius: 4,
            background: paso === i ? 'var(--coral)' : 'var(--dark-20)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* Step 1: Welcome */}
      {paso === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 28px 40px', gap: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div dangerouslySetInnerHTML={{ __html: LOGO_SVG }} style={{ width: 140, height: 168 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '👗', title: 'Medidas siempre a mano', desc: 'Guardá las medidas de tu ropa favorita y consultalas cuando comprás online.' },
              { icon: '✨', title: 'IA que te recomienda tu talle', desc: 'Subí una foto de la tabla de talles y la IA te dice exactamente qué comprar.' },
              { icon: '👥', title: 'Perfiles para toda la familia', desc: 'Creá perfiles separados para tus hijos, pareja o clientes.' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'var(--coral-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>{f.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{f.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--dark-50)', lineHeight: 1.4 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={siguiente} style={{ marginTop: 'auto' }}>
            Empezar
          </button>
        </div>
      )}

      {/* Step 2: Personal data */}
      {paso === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 28px 40px', gap: 28, overflowY: 'auto' }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Contanos sobre vos</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-50)', lineHeight: 1.5 }}>
              Estos datos ayudan a la IA a recomendarte talles con más precisión
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setShowAvatares(s => !s)}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--coral-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, border: '2px dashed var(--coral)',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                {avatar}
                <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--coral)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white' }}>✏</span>
              </button>
              <span style={{ fontSize: 12, color: 'var(--dark-50)' }}>Tocá para elegir tu avatar</span>
              {showAvatares && (
                <div className="card fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: 12, width: '100%' }}>
                  {AVATARES.map(e => (
                    <button key={e} onClick={() => { setAvatar(e); setShowAvatares(false) }}
                      style={{ fontSize: 26, background: avatar === e ? 'var(--coral-light)' : 'transparent', border: avatar === e ? '2px solid var(--coral)' : '2px solid transparent', borderRadius: 10, padding: 6, cursor: 'pointer', lineHeight: 1 }}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="section-label">¿Cómo te llamás?</span>
              <input
                className="input-field"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="section-label">Altura</span>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-md)', padding: '0 14px', border: '2px solid transparent' }}>
                  <input
                    className="input-field"
                    style={{ border: 'none', padding: '14px 0', flex: 1 }}
                    placeholder="170"
                    type="number"
                    value={altura}
                    onChange={e => setAltura(e.target.value)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--dark-50)', fontWeight: 600 }}>cm</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="section-label">Peso</span>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-md)', padding: '0 14px' }}>
                  <input
                    className="input-field"
                    style={{ border: 'none', padding: '14px 0', flex: 1 }}
                    placeholder="70"
                    type="number"
                    value={peso}
                    onChange={e => setPeso(e.target.value)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--dark-50)', fontWeight: 600 }}>kg</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn-primary"
              onClick={siguiente}
              disabled={!nombre.trim()}
            >
              Continuar
            </button>
            <button className="btn-secondary" onClick={siguiente}>Completar después</button>
          </div>
        </div>
      )}

      {/* Step 3: Use cases */}
      {paso === 3 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 28px 40px', gap: 28 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>¿Para quién es Aiva!?</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-50)', lineHeight: 1.5 }}>Podés usarla como quieras, sola o con otros</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '👤', text: 'Tus propias medidas y ropa favorita' },
              { icon: '👨‍👩‍👧', text: 'Tu pareja, hijos o familia' },
              { icon: '💼', text: 'Tus clientes si sos diseñador o modista' },
              { icon: '🎨', text: 'Distintos estilos y conjuntos que te gusten' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: 'var(--dark)', opacity: 0.7 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, border: '2px solid var(--coral)' }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--coral)' }}>Perfiles para todos</div>
              <div style={{ fontSize: 13, color: 'var(--dark-50)', marginTop: 2 }}>Cada persona con sus propias medidas</div>
            </div>
            <span style={{ color: 'var(--coral)', fontSize: 20 }}>✓</span>
          </div>

          <button className="btn-primary" onClick={finalizar} style={{ marginTop: 'auto' }}>
            Entrar a Aiva!
          </button>
        </div>
      )}
    </div>
  )
}
