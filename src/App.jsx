import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Store from './pages/Store'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Confirm from './pages/Confirm'
import ProductDetail from './pages/ProductDetail'
import Manual from './pages/Manual'
import { supabase } from './lib/supabase'
import { useEffect, useState } from 'react'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function RequireAuth({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (DEMO) {
      setSession(sessionStorage.getItem('demo_admin') ? 'demo' : null)
      return
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/produto/:id" element={<ProductDetail />} />
        <Route path="/confirmado" element={<Confirm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/manual" element={<Manual />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
