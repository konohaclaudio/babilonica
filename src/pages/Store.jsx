import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import config from '../config'
import Filter from '../components/Filter'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const WA_NUMBER = config.store.whatsapp
const WA_MSG    = encodeURIComponent('Olá! Vim pela loja Babilônica e quero saber mais sobre as joias 💎✨')

function AnimatedStar({ size = 88 }) {
  return (
    <div className="store-hero__star-wrap">
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <polygon
          className="store-hero__star-path"
          points="50,5 60,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 40,35"
          stroke="var(--text)" strokeWidth="1.5" fill="none" strokeLinejoin="round"
        />
      </svg>
      <span className="store-hero__seven" aria-hidden="true">7</span>
    </div>
  )
}

export default function Store() {
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [cart, setCart]                 = useState([])
  const [cartOpen, setCartOpen]         = useState(false)
  const cursorRef = useRef(null)

  // Load products
  useEffect(() => {
    if (DEMO) {
      setProducts(mockProducts)
      setLoading(false)
      return
    }
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  // Custom cursor — desktop only
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const cursor = cursorRef.current
    if (!cursor) return

    document.body.classList.add('store-cursor-active')

    function onMove(e) {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
    }
    function onOver(e) {
      if (e.target.closest('a, button, [data-hover]')) cursor.classList.add('hovering')
    }
    function onOut(e) {
      if (e.target.closest('a, button, [data-hover]')) cursor.classList.remove('hovering')
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover',  onOver)
    document.addEventListener('mouseout',   onOut)

    return () => {
      document.body.classList.remove('store-cursor-active')
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mouseout',   onOut)
    }
  }, [])

  // Reveal animations via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })

    const els = document.querySelectorAll('.reveal')
    els.forEach(el => observer.observe(el))

    // Trigger anything already visible on load
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('active')
        }
      })
    }, 80)

    return () => observer.disconnect()
  }, [products])

  // Parallax on manifesto background
  useEffect(() => {
    function onScroll() {
      const bg = document.querySelector('.store-manifesto__bg')
      if (bg) bg.style.transform = `translateY(${window.scrollY * 0.1}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filterCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort()
    return ['Tudo', ...cats]
  }, [products])

  const filtered = activeCategory === 'Tudo'
    ? products
    : products.filter(p => p.category === activeCategory)

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  function updateQty(id, delta) {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    )
  }

  function removeItem(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* CURSOR CUSTOMIZADO — desktop */}
      <div id="bab-cursor" ref={cursorRef} aria-hidden="true" />

      {/* NAV */}
      <nav className="nav">
        <div style={{ gridColumn: 1 }} />
        <div className="nav__logo">
          {config.store.logo
            ? <img src={config.store.logo} alt={config.store.name} className="nav__logo-img" />
            : <span>{config.store.name}</span>
          }
        </div>
        <div className="nav__actions">
          <button
            type="button"
            className="nav__cart-btn"
            onClick={() => setCartOpen(true)}
          >
            {cartCount > 0 ? `Sacola [${cartCount}]` : 'Sacola'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="store-hero">
        {/* Nome em arco */}
        <svg viewBox="0 0 420 165" className="store-hero__arc-text" aria-hidden="true">
          <defs>
            <path id="bab-arc" d="M 42 148 Q 210 -24 378 148" />
          </defs>
          <text
            fontFamily="var(--font-display)"
            fontSize="30"
            fontWeight="400"
            fill="var(--text)"
            letterSpacing="7"
          >
            <textPath href="#bab-arc" startOffset="50%" textAnchor="middle">
              Babilônica
            </textPath>
          </text>
        </svg>

        {/* Estrela animada */}
        <AnimatedStar />

        <p className="store-hero__tagline">{config.store.tagline}</p>
        <p className="store-hero__sub reveal">
          Aço inox 316L hipoalergênico · Peças autorais · Piraju — SP
        </p>
        <a href="#catalogo" className="store-hero__cta reveal" style={{ transitionDelay: '120ms' }}>
          Explorar o Catálogo →
        </a>
      </section>

      {/* MARQUEE */}
      <div className="store-marquee" aria-hidden="true">
        <div className="store-marquee__track">
          <span className="store-marquee__content">
            JOIAS EM AÇO INOX ✦ PEÇAS AUTORAIS ✦ CURADORIA BABILÔNICA ✦ 5% DESCONTO NO PIX ✦ ENVIO PARA SP E RJ ✦ @BABILONICA7 ✦&nbsp;
          </span>
          <span className="store-marquee__content" aria-hidden="true">
            JOIAS EM AÇO INOX ✦ PEÇAS AUTORAIS ✦ CURADORIA BABILÔNICA ✦ 5% DESCONTO NO PIX ✦ ENVIO PARA SP E RJ ✦ @BABILONICA7 ✦&nbsp;
          </span>
        </div>
      </div>

      {/* MANIFESTO */}
      <section className="store-manifesto">
        <div className="store-manifesto__bg" />
        <div className="store-manifesto__content reveal">
          <svg width="36" height="36" viewBox="0 0 100 100" className="store-manifesto__star" aria-hidden="true">
            <polygon
              points="50,5 60,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 40,35"
              stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"
            />
          </svg>
          <h2 className="store-manifesto__title">Inox como intenção.</h2>
          <p className="store-manifesto__text">
            Não usamos metais que mandam embora. Aço inox 316L — grau cirúrgico, eterno, incorruptível.
            Cada peça Babilônica é autoral, pensada para quem carrega a própria história na pele.
          </p>
          <div className="store-manifesto__pills">
            <span>✦ Hipoalergênico</span>
            <span>✦ Resiste à água e ao suor</span>
            <span>✦ 5% desc. no Pix</span>
            <span>✦ Envio SP e RJ</span>
          </div>
        </div>
      </section>

      {/* FILTRO */}
      <Filter
        categories={filterCategories}
        active={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* CATÁLOGO */}
      <main className="catalog" id="catalogo">
        {loading ? (
          <div className="state-loading">
            <div className="state-loading__spinner" />
            Convocando as peças...
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-empty">
            Nenhuma peça nesta categoria.
          </div>
        ) : (
          <div className="catalog__grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                currency={config.catalog.currency}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="store-footer">
        <div className="store-footer__inner">
          <p>{config.store.name} · {config.store.city}</p>
          <div className="store-footer__links">
            <a
              href={config.store.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @babilonica7
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="store-footer__admin">
          <a href="/login" className="store-footer__admin-link">Acesso administrativo</a>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Falar com Babilônica no WhatsApp"
        data-hover
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* SACOLA DRAWER */}
      <Cart
        items={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClearCart={() => setCart([])}
        currency={config.catalog.currency}
        whatsapp={config.store.whatsapp}
        storeName={config.store.name}
        demoMode={DEMO}
      />
    </>
  )
}
