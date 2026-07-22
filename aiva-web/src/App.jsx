import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { storage } from './data/storage'
import Onboarding from './pages/Onboarding'
import Ropero from './pages/Ropero'
import Detalle from './pages/Detalle'
import Asistente from './pages/Asistente'
import Perfil from './pages/Perfil'
import Privacidad from './pages/Privacidad'
import Layout from './components/Layout'
import './index.css'

function App() {
  const [checking, setChecking] = useState(true)
  const [onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    const done = storage.get('onboarding_completo') === 'true'
    setOnboardingDone(done)
    setChecking(false)
  }, [])

  if (checking) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100dvh', background: 'var(--bg)'
      }} />
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={
          onboardingDone
            ? <Navigate to="/" replace />
            : <Onboarding onComplete={() => setOnboardingDone(true)} />
        } />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/" element={
          !onboardingDone
            ? <Navigate to="/onboarding" replace />
            : <Layout />
        }>
          <Route index element={<Ropero />} />
          <Route path="detalle/:categoria" element={<Detalle />} />
          <Route path="asistente" element={<Asistente />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
