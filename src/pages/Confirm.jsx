import { useNavigate } from 'react-router-dom'
import config from '../config'

export default function Confirm() {
  const navigate = useNavigate()

  return (
    <div className="confirm-page">
      <img
        src="/obrigada.jpeg"
        alt="Obrigada — Babilônica"
        className="confirm-stamp"
      />
      <p className="confirm-subtitle">
        Seu pedido foi encaminhado à {config.store.name} via WhatsApp.
        Em breve você receberá a confirmação.
      </p>
      <button
        type="button"
        className="confirm-back"
        onClick={() => navigate('/')}
      >
        Continuar explorando →
      </button>
    </div>
  )
}
