import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product, currency, onAdd, cartQty = 0 }) {
  const [added, setAdded] = useState(false)
  const price = `${currency} ${Number(product.price).toFixed(2).replace('.', ',')}`
  const navigate = useNavigate()
  const imgSrc = product.images?.[0] || product.image_url

  const hasStock = product.stock !== null && product.stock !== undefined
  const esgotado = hasStock && product.stock === 0
  const noLimit  = hasStock && cartQty >= product.stock

  function handleAdd() {
    if (esgotado || noLimit) return
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="product-card">
      <div
        className="product-card__img-wrap"
        onClick={() => navigate(`/produto/${product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="product-card__img" loading="lazy" />
          : <div className="product-card__img-placeholder">◇</div>
        }
        {esgotado && <div className="product-card__badge-esgotado">Esgotado</div>}
      </div>
      <div className="product-card__body">
        {product.category && (
          <div className="product-card__category">{product.category}</div>
        )}
        <div
          className="product-card__name"
          onClick={() => navigate(`/produto/${product.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </div>
        <div className="product-card__price">{price}</div>
        <button
          type="button"
          className={`product-card__add${added ? ' added' : ''}${(esgotado || noLimit) ? ' disabled' : ''}`}
          onClick={handleAdd}
          disabled={esgotado || noLimit}
        >
          {esgotado ? 'Esgotado' : noLimit ? 'Limite atingido' : added ? 'Adicionado ✦' : 'Adicionar à Sacola'}
        </button>
      </div>
    </div>
  )
}
