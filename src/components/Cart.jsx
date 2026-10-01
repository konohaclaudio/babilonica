import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Cart({ items, open, onClose, onUpdateQty, onRemove, onClearCart, currency, whatsapp, storeName, demoMode }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const fmt = (n) => `${currency} ${Number(n).toFixed(2).replace('.', ',')}`

  async function handleCheckout(e) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSending(true)

    if (demoMode) {
      await new Promise(r => setTimeout(r, 800))
      onClearCart()
      onClose()
      setName('')
      setPhone('')
      setSending(false)
      navigate('/confirmado')
      return
    }

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: name.trim(),
          phone: phone.trim(),
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          total,
        }),
      })

      if (!res.ok) throw new Error('Erro ao enviar pedido')

      onClearCart()
      onClose()
      setName('')
      setPhone('')
      navigate('/confirmado')
    } catch {
      alert('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer${open ? ' open' : ''}`} aria-label="Sacola">
        <div className="cart-header">
          <span className="cart-header__title">Sacola</span>
          <button type="button" className="cart-close" onClick={onClose} aria-label="Fechar sacola">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__icon">◇</div>
            <p className="cart-empty__text">Sua sacola está vazia</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  {(item.images?.[0] || item.image_url)
                    ? <img src={item.images?.[0] || item.image_url} alt={item.name} className="cart-item__img" />
                    : <div className="cart-item__img-placeholder">◇</div>
                  }
                  <div>
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__qty">
                      <button type="button" className="cart-item__qty-btn" onClick={() => onUpdateQty(item.id, -1)}>−</button>
                      <span className="cart-item__qty-num">{item.qty}</span>
                      <button type="button" className="cart-item__qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                    <button type="button" className="cart-item__remove" onClick={() => onRemove(item.id)}>
                      remover
                    </button>
                  </div>
                  <div className="cart-item__price">{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span className="cart-total__label">Total</span>
                <span className="cart-total__value">{fmt(total)}</span>
              </div>

              <form className="cart-form" onSubmit={handleCheckout}>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (ex: 11999999999)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                <button type="submit" className="cart-checkout-btn" disabled={sending}>
                  {sending ? 'Enviando...' : 'Finalizar via WhatsApp →'}
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
