import { Outlet, NavLink } from 'react-router-dom'

const LOGO_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 464.95 464.95"><path fill="#f1f2f2" d="M108.33,265.23c1.08.15,2.16.45,3.21.91,6.38,2.81,12.26,6.51,18.21,10.09v-81.28c-.01-5.07-4.44-10.29-8.29-11.03-3.89-.75-8.87,1.51-11.81,4.48l-29.3,39.7-41.12-38.97,56.79-84.96c4.95-7.4,12.86-13.07,20.8-16.39l40.98-17.13c4.64,38.43,36.24,66.05,73.95,65.61,37.03-.43,68.56-27.29,72.51-65.53l41.9,17.47c7.25,3.02,13.56,8.52,18.75,14l18.53-11.48c-7.1-9.19-15.54-16.71-25.97-21.14l-57.02-24.22c-9.05-3.84-12.78-1.6-20.13,4.18-28.46,22.35-71.68,21.79-99.75-.93-5.29-4.28-9.97-7.15-16.53-4.34l-58.52,25.1c-9.18,3.94-19.24,10.7-24.99,19.3l-63.18,94.43c-3.52,5.26-1.86,13.15,2.25,17.07l48.19,45.91c6.53,6.22,18.03,9.26,24.33,1.19l16.17-20.71.04,38.68ZM281.78,74.36c-5.01,23.65-25.61,40.16-48.34,40.66-23.49.51-46.45-13.15-52.44-39.39,33.01,15.12,69.04,16.35,100.78-1.26Z"/><path fill="#f1f2f2" d="M443.86,181.99l-35.19-53.75-16.81,13.48,31.21,47.54-41.03,38.83-31.71-42.41-17.92,24.65v180.94c-.01,5.28-4.48,8.89-9.46,8.89h-115.63c-6.78,8-14.03,15.21-21.93,21.6l139.4.05c15.86,0,28.78-12.55,28.79-28.8l.13-166.35,14.6,18.72c2.57,3.3,8.66,6.87,12.3,6.72,3.49-.15,9.63-2.51,12.4-5.13l49.28-46.5c5.07-4.79,5.28-12.8,1.57-18.48Z"/><path fill="#f58e81" d="M62.7,310.65c4.52-21.38,30.67-34.67,51.15-26.41,22.1,8.91,29.88,36.27,46.08,41.77,6.26-.32,13.21-9.47,16.76-14.81,46.74-70.31,99.78-141.41,171.45-187.13,30.04-19.16,62.24-39.23,101.38-39.09-36.94,22.23-70,41.67-99.9,70.69-72.78,70.62-114.96,145.84-162.07,233.44-5.1,9.47-15.8,16.55-24.2,17.43-11.96,1.26-21.67-5.46-28.3-15.35l-36.39-54.26c-8.14-12.14-19.74-18.6-35.96-26.28Z"/></svg>`

// Outline hanger icon — tries /ilustraciones/generico.svg first, fallback inline
function HangerIcon({ active }) {
  // Use the percha SVG inline (currentColor = adapts to nav color)
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="currentColor">
      <path d="M96.82,71.88v3.33c-.95,3.81-4.19,7.48-8.82,7.48l-77.67.03c-3.76,0-6.37-2.73-7.14-6.01v-2.76c.86-3.53,3.33-5.56,6.66-7.14l38.64-18.22v-8.43c0-1.18.98-2.29,2.27-2.31,4.12-.04,7.67-2.62,8.44-6.33.81-3.89-.8-7.92-4.56-9.42-2.8-1.12-5.7-.38-8.04,1.33-4.86,3.56-2.25,9-5.76,8.7s-2.18-8.63,3.64-12.58c3.68-2.5,8.21-3.03,12.22-1.23,4.54,2.03,6.84,6.62,6.88,11.49.05,6.63-4.5,11.72-11.31,12.14l.14,5.89,40.2,17.8c2.51,1.11,3.36,4.13,4.22,6.22ZM10.94,78.96h76.25c2.65,0,4.57-1.67,5.13-3.88.51-2.02-.15-4.87-2.41-5.88l-38.58-17.2-40.47,19.19c-1.59.76-2.9,2.14-3.27,3.73-.52,2.2.81,4.04,3.36,4.04Z"/>
    </svg>
  )
}

// Outline person icon — stroke based, no fill
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7.5" r="3.5"/>
      <path d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5"/>
    </svg>
  )
}

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--nav-h)' }}>
        <Outlet />
      </div>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'var(--nav-h)',
        background: 'var(--coral)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <NavLink to="/" end style={{ textDecoration: 'none', flex: 1 }}>
          {({ isActive }) => (
            <NavItem icon={<HangerIcon active={isActive} />} label="Ropero" active={isActive} />
          )}
        </NavLink>

        <NavLink to="/asistente" style={{ textDecoration: 'none', flex: 1 }}>
          {({ isActive }) => (
            <NavItem
              icon={
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--dark)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  opacity: isActive ? 1 : 0.7
                }}>
                  <div dangerouslySetInnerHTML={{ __html: LOGO_ICON_SVG }} style={{ width: 16, height: 16 }} />
                </div>
              }
              label="Aiva!"
              active={isActive}
            />
          )}
        </NavLink>

        <NavLink to="/perfil" style={{ textDecoration: 'none', flex: 1 }}>
          {({ isActive }) => (
            <NavItem icon={<PersonIcon />} label="Perfil" active={isActive} />
          )}
        </NavLink>
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 3, padding: '8px 4px',
      color: active ? 'white' : 'rgba(255,255,255,0.65)',
      transition: 'color 0.15s'
    }}>
      <div style={{ opacity: active ? 1 : 0.75 }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{label}</span>
    </div>
  )
}
