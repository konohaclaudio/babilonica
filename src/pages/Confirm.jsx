import { useNavigate } from 'react-router-dom'
import config from '../config'

export default function Confirm() {
  const navigate = useNavigate()

  return (
    <div className="confirm-page">
      <div className="confirm-icon">✦</div>
      <h1 className="confirm-title">Ritual enviado</h1>
      <p className="confirm-subtitle">
        Seu pedido foi encaminhado à {config.store.name} via WhatsApp.
        Em breve você receberá a confirmação.
      </p>
      <button
        type="button"
        className="confirm-back"
        onClick={() => navigate('/')}
      >
        Retornar ao Sanctum
      </button>
    </div>
  )
}
