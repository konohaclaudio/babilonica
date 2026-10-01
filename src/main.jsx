import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import config from './config'
import { supabase } from './lib/supabase'
import './styles/global.css'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500&display=swap'
document.head.appendChild(link)

async function bootstrap() {
  // Merge persisted settings into config before React mounts
  if (DEMO) {
    try {
      const saved = localStorage.getItem('babilonica_settings')
      if (saved) {
        const s = JSON.parse(saved)
        if (s.name)     config.store.name     = s.name
        if (s.tagline)  config.store.tagline  = s.tagline
        if (s.whatsapp) config.store.whatsapp = s.whatsapp
        if (s.city)     config.store.city     = s.city
        if (s.logo_url) config.store.logo     = s.logo_url
        if (s.currency) config.catalog.currency = s.currency
      }
    } catch {}
  } else {
    try {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
      if (data) {
        if (data.name)     config.store.name     = data.name
        if (data.tagline)  config.store.tagline  = data.tagline
        if (data.whatsapp) config.store.whatsapp = data.whatsapp
        if (data.city)     config.store.city     = data.city
        if (data.logo_url) config.store.logo     = data.logo_url
        if (data.currency) config.catalog.currency = data.currency
      }
    } catch {}
  }

  // Apply theme CSS variables
  const root = document.documentElement
  Object.entries(config.theme).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

bootstrap()
