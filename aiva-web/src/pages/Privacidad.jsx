import { Link } from 'react-router-dom'

export default function Privacidad() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '0 0 60px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '56px 24px 0' }}>
        <Link to="/perfil" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--coral)', fontSize: 15, fontWeight: 600, marginBottom: 28 }}>
          ‹ Volver
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Política de privacidad</h1>
        <p style={{ fontSize: 13, color: 'var(--dark-50)', marginBottom: 36 }}>Última actualización: julio de 2025</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          <Seccion titulo="Tus datos son tuyos">
            Aiva! no tiene servidores propios ni bases de datos en la nube. Todo lo que guardás — nombres, medidas, notas, perfiles — se almacena exclusivamente en tu dispositivo usando el almacenamiento local del navegador (localStorage). No tenemos acceso a esa información en ningún momento.
          </Seccion>

          <Seccion titulo="No compartimos nada">
            No vendemos, cedemos ni transferimos ningún dato personal a terceros. No hay publicidad, no hay perfiles de usuario en nuestros sistemas, no hay telemetría ni analítica de comportamiento.
          </Seccion>

          <Seccion titulo="El asistente de IA usa tu propia API key">
            El chat con Aiva usa la API de Groq, que vos configurás con tu propia clave personal (API key). Cuando mandás un mensaje, ese texto viaja directamente desde tu dispositivo a los servidores de Groq — nunca pasa por nosotros. Esa comunicación está sujeta a la{' '}
            <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral)' }}>
              política de privacidad de Groq
            </a>
            . Tu API key se guarda en el almacenamiento local de tu navegador y jamás sale de tu dispositivo hacia nosotros.
          </Seccion>

          <Seccion titulo="Qué se guarda en tu dispositivo">
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                'Nombre, altura y peso de cada perfil',
                'Medidas de cada prenda por perfil',
                'Categorías de ropa personalizadas',
                'Notas sobre prendas',
                'Tu API key de Groq (si la configurás)',
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--dark-50)' }}>{item}</li>
              ))}
            </ul>
          </Seccion>

          <Seccion titulo="Cómo borrar tus datos">
            Tenés control total. Podés resetear o eliminar perfiles desde la pantalla de Perfil. Para borrar absolutamente todo, basta con limpiar los datos del sitio desde la configuración de tu navegador (Configuración → Privacidad → Datos del sitio → aiva.app o donde esté alojada la app).
          </Seccion>

          <Seccion titulo="Menores de edad">
            Aiva! no está dirigida a menores de 13 años. Si creás perfiles para otras personas — como hijos o clientes — sos responsable de gestionar esa información de acuerdo con las leyes aplicables.
          </Seccion>

          <Seccion titulo="Cambios a esta política">
            Si realizamos cambios importantes, lo informaremos dentro de la aplicación. La fecha de "última actualización" al inicio de esta página indica cuándo fue revisada por última vez.
          </Seccion>

          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: 32 }}>🔒</span>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--dark-50)', margin: 0 }}>
              Resumen en una línea: <strong style={{ color: 'var(--dark)' }}>tus datos se quedan en tu dispositivo y nunca los vemos.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--dark)' }}>{titulo}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--dark-50)' }}>{children}</p>
    </div>
  )
}
