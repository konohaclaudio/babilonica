import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import config from '../config'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pd-accordion">
      <button type="button" className="pd-accordion__trigger" onClick={() => setOpen(v => !v)}>
        <span className="pd-accordion__title">{title}</span>
        <span className="pd-accordion__icon">{open ? '—' : '+'}</span>
      </button>
      <div className={`pd-accordion__body${open ? ' open' : ''}`}>
        <div className="pd-accordion__inner">
          <p className="pd-accordion__text">{children}</p>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setActiveImg(0)
    if (DEMO) {
      const p = mockProducts.find(p => String(p.id) === String(id))
      setProduct(p || null)
      return
    }
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => setProduct(data))
  }, [id])

  function handleAdd() {
    // Notify parent Store via localStorage event (simple cross-page signaling)
    const event = new CustomEvent('babilonica-add-to-cart', { detail: { product, qty } })
    window.dispatchEvent(event)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const fmt = (n) => `${config.catalog.currency} ${Number(n).toFixed(2).replace('.', ',')}`

  if (!product) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="state-loading">
          <div className="state-loading__spinner" />
          Convocando a peça...
        </div>
      </div>
    )
  }

  return (
    <div className="pd-layout">
      {/* Back nav */}
      <nav className="pd-nav">
        <button type="button" className="pd-nav-back" onClick={() => navigate('/')}>
          ← Catálogo
        </button>
        <span className="pd-nav-store">{config.store.name}</span>
      </nav>

      <div className="pd-split">
        {/* LEFT — sticky image + gallery */}
        <aside className="pd-image-side">
          {(() => {
            const allImgs = product.images?.length
              ? product.images
              : product.image_url ? [product.image_url] : []
            const current = allImgs[activeImg] || null
            return (
              <>
                <div className="pd-image-wrap">
                  {current
                    ? <img src={current} alt={product.name} className="pd-image" />
                    : <div className="pd-image-placeholder">◇</div>
                  }
                  <div className="pd-image-frame" />
                </div>

                {allImgs.length > 1 && (
                  <div className="pd-gallery-strip">
                    {allImgs.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`pd-gallery-thumb${i === activeImg ? ' active' : ''}`}
                        onClick={() => setActiveImg(i)}
                        aria-label={`Foto ${i + 1}`}
                      >
                        <img src={url} alt={`${product.name} — foto ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}

                {product.category && (
                  <div className="pd-image-caption">{product.category}</div>
                )}
              </>
            )
          })()}
        </aside>

        {/* RIGHT — product info */}
        <main className="pd-info-side">
          <div className="pd-info-inner">
            {/* Breadcrumb */}
            <p className="pd-breadcrumb">
              <button type="button" onClick={() => navigate('/')}>Catálogo</button>
              {' / '}
              <span>{product.category || 'Formulação'}</span>
            </p>

            {/* Title */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Price */}
            <div className="pd-price-row">
              <span className="pd-price">{fmt(product.price)}</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="pd-description">{product.description}</p>
            )}

            {/* Add to sacola */}
            <div className="pd-buy-row">
              <div className="pd-qty">
                <button type="button" className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="pd-qty-num">{qty}</span>
                <button type="button" className="pd-qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
              </div>
              <button
                type="button"
                className={`pd-add-btn${added ? ' added' : ''}`}
                onClick={handleAdd}
              >
                {added ? 'Adicionado à Sacola ✦' : 'Adicionar à Sacola →'}
              </button>
            </div>

            {/* Accordions */}
            <div className="pd-accordions">
              <Accordion title="Cuidados com a Peça">
                Aço inox 316L grau cirúrgico — o mesmo usado em implantes. Use todos os dias, na água, no suor, no tempo. Para limpar: pano macio úmido com sabão neutro, enxague e seque. Armazene separado de outras peças.
              </Accordion>
              <Accordion title="Sobre o Material">
                Todas as peças Babilônica são em aço inox 316L hipoalergênico. Não escurece, não oxida, não mancha a pele. Indicado para peles sensíveis e alérgicas a níquel. Curadoria autoral — cada design é exclusivo.
              </Accordion>
              <Accordion title="Envio & Pagamento">
                Enviamos para São Paulo e Rio de Janeiro via Correios ou motoboy (SP capital). 5% de desconto pagando via Pix. Pedido confirmado via WhatsApp, despacho em até 2 dias úteis após confirmação do pagamento.
              </Accordion>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="store-footer">
        {config.store.name} · {config.store.city}
      </footer>
    </div>
  )
}
