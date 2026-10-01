import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import config from '../config'
import ProductModal from '../components/ProductModal'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

let demoProducts = [...mockProducts]
let demoOrders = [
  { id: 'demo-001', created_at: new Date().toISOString(), customer: 'Ana Oliveira', phone: '11999990001', items: [{ name: 'Colar Ishtar', price: 480, qty: 1 }, { name: 'Brinco Medusa', price: 260, qty: 1 }], total: 740, status: 'novo' },
  { id: 'demo-002', created_at: new Date(Date.now() - 3600000).toISOString(), customer: 'Julia Santos', phone: '11999990002', items: [{ name: 'Kit Babilônica', price: 1200, qty: 1 }], total: 1200, status: 'confirmado' },
]
let demoCategories = config.catalog.categories.filter(c => c !== 'Tudo')

const StarSvg = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <polygon points="50,5 60,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 40,35"
      stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
  </svg>
)

const NAV_ITEMS = [
  { id: 'catalogo',   label: 'Catálogo',    desc: 'Gestão de formulações e estoques' },
  { id: 'pedidos',    label: 'Rituais',      desc: 'Pedidos e invocações em tempo real' },
  { id: 'categorias', label: 'Categorias',   desc: 'Organizar os grimórios da loja' },
  { id: 'alquimia',   label: 'Alquimia',     desc: 'Configurações e identidade da loja' },
]

export default function Admin() {
  const [view, setView]               = useState('catalogo')
  const [navOpen, setNavOpen]         = useState(false)
  const [products, setProducts]       = useState([])
  const [orders, setOrders]           = useState([])
  const [categories, setCategories]   = useState([...demoCategories])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [newCat, setNewCat]           = useState('')
  const [toast, setToast]             = useState(null)

  // Settings state — seeded from config (already merged with persisted values in main.jsx)
  const [settings, setSettings] = useState({
    name:     config.store.name,
    tagline:  config.store.tagline,
    whatsapp: config.store.whatsapp,
    city:     config.store.city,
    logo_url: config.store.logo || '',
    currency: config.catalog.currency,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const navRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
    loadOrders()

    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadProducts() {
    setLoading(true)
    if (DEMO) { setProducts([...demoProducts]); setLoading(false); return }
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
    setLoading(false)
  }

  async function loadOrders() {
    if (DEMO) { setOrders([...demoOrders]); return }
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function handleSaveProduct(product) {
    if (DEMO) {
      if (product.id) {
        demoProducts = demoProducts.map(p => p.id === product.id ? product : p)
      } else {
        demoProducts = [...demoProducts, { ...product, id: String(Date.now()) }]
      }
      setModalOpen(false); setEditProduct(null); loadProducts(); return
    }
    if (product.id) {
      await supabase.from('products').update(product).eq('id', product.id)
    } else {
      await supabase.from('products').insert(product)
    }
    setModalOpen(false); setEditProduct(null); loadProducts()
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Remover formulação?')) return
    if (DEMO) { demoProducts = demoProducts.filter(p => p.id !== id); loadProducts(); return }
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  async function handleToggleActive(product) {
    if (DEMO) {
      demoProducts = demoProducts.map(p => p.id === product.id ? { ...p, active: !p.active } : p)
      loadProducts(); return
    }
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    loadProducts()
  }

  async function handleOrderStatus(orderId, status) {
    if (DEMO) {
      demoOrders = demoOrders.map(o => o.id === orderId ? { ...o, status } : o)
      loadOrders(); return
    }
    await supabase.from('orders').update({ status }).eq('id', orderId)
    loadOrders()
  }

  async function handleLogout() {
    if (DEMO) { sessionStorage.removeItem('demo_admin'); navigate('/login'); return }
    await supabase.auth.signOut()
    navigate('/login')
  }

  function addCategory() {
    const cat = newCat.trim()
    if (!cat || categories.includes(cat)) return
    const updated = [...categories, cat]
    demoCategories = updated
    setCategories(updated)
    setNewCat('')
  }

  function removeCategory(cat) {
    if (!confirm(`Remover categoria "${cat}"?`)) return
    const updated = categories.filter(c => c !== cat)
    demoCategories = updated
    setCategories(updated)
  }

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      if (DEMO) {
        localStorage.setItem('babilonica_settings', JSON.stringify(settings))
        // Update live config so the current session reflects changes
        config.store.name     = settings.name
        config.store.tagline  = settings.tagline
        config.store.whatsapp = settings.whatsapp
        config.store.city     = settings.city
        config.store.logo     = settings.logo_url
        config.catalog.currency = settings.currency
        showToast('Configurações salvas. Recarregue a loja para ver as alterações.')
      } else {
        const { error } = await supabase.from('settings').upsert({
          id: 1,
          name:     settings.name,
          tagline:  settings.tagline,
          whatsapp: settings.whatsapp,
          city:     settings.city,
          logo_url: settings.logo_url,
          currency: settings.currency,
        })
        if (error) throw error
        showToast('Configurações salvas com sucesso.')
      }
    } catch {
      showToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    if (DEMO) {
      const localUrl = URL.createObjectURL(file)
      setSettings(s => ({ ...s, logo_url: localUrl }))
      showToast('Logo atualizado — visível nesta sessão. Salve para persistir a URL.')
      return
    }

    const ext = file.name.split('.').pop()
    const path = `logo/logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { showToast('Erro ao fazer upload da imagem.', 'error'); return }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
    setSettings(s => ({ ...s, logo_url: publicUrl }))
    showToast('Logo enviado com sucesso.')
  }

  function openNew()   { setEditProduct(null); setModalOpen(true) }
  function openEdit(p) { setEditProduct(p);    setModalOpen(true) }

  const fmt     = (n) => `${config.catalog.currency} ${Number(n).toFixed(2).replace('.', ',')}`
  const fmtDate = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  const newOrders  = orders.filter(o => o.status === 'novo').length
  const currentNav = NAV_ITEMS.find(n => n.id === view)

  return (
    <div className="admin-layout">

      {/* TOPBAR */}
      <header className="admin-topbar-light">
        <div className="admin-topbar-left">
          <div className="admin-brand">
            {config.store.logo
              ? <img src={config.store.logo} alt={config.store.name} className="admin-brand-logo" />
              : <><StarSvg /><span className="admin-brand-name">{config.store.name}</span></>
            }
          </div>

          <div className="admin-dropdown-wrap" ref={navRef}>
            <button
              type="button"
              className="admin-dropdown-trigger"
              onClick={() => setNavOpen(v => !v)}
            >
              <span>{currentNav?.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {navOpen && (
              <div className="admin-dropdown-menu">
                <div className="admin-dropdown-header">Navegação do Sanctum</div>
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`admin-dropdown-item${view === item.id ? ' active' : ''}`}
                    onClick={() => { setView(item.id); setNavOpen(false) }}
                  >
                    <div className="admin-dropdown-item-label">
                      {item.label}
                      {item.id === 'pedidos' && newOrders > 0 && (
                        <span className="admin-dropdown-badge">{newOrders}</span>
                      )}
                    </div>
                    <div className="admin-dropdown-item-desc">{item.desc}</div>
                    {view === item.id && <div className="admin-dropdown-dot" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-topbar-right">
          <a href="/" className="admin-topbar-link">Ver Loja →</a>
          <div className="admin-user">
            <div className="admin-user-info">
              <span className="admin-user-name">Mestre Boticário</span>
              <span className="admin-user-role">Admin</span>
            </div>
            <div className="admin-avatar">M</div>
          </div>
          <button type="button" className="admin-topbar__logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="admin-content">

        {/* ---- CATÁLOGO ---- */}
        {view === 'catalogo' && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Gestão de Catálogo</h1>
                <p className="admin-subtitle">Gerencie as formulações, descrições e estoques.</p>
              </div>
              <button type="button" className="btn-primary" onClick={openNew}>
                + Nova Formulação
              </button>
            </div>

            {loading ? (
              <div className="state-loading">
                <div className="state-loading__spinner" />
                Acessando os registros...
              </div>
            ) : (
              <>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            {(p.images?.[0] || p.image_url)
                              ? <img src={p.images?.[0] || p.image_url} alt={p.name} className="product-thumb" />
                              : <div className="product-thumb-placeholder">◇</div>
                            }
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{p.category || '—'}</td>
                        <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400 }}>{fmt(p.price)}</td>
                        <td>
                          <span className={`badge badge--${p.active ? 'active' : 'inactive'}`}>
                            {p.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.75rem' }} onClick={() => openEdit(p)}>Editar</button>
                            <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.75rem' }} onClick={() => handleToggleActive(p)}>{p.active ? 'Pausar' : 'Ativar'}</button>
                            <button type="button" className="btn-danger" onClick={() => handleDeleteProduct(p.id)}>Remover</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="product-cards-mobile">
                  {products.map(p => (
                    <div key={p.id} className="product-row-mobile">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="product-thumb" />
                        : <div className="product-thumb-placeholder">◇</div>
                      }
                      <div className="product-row-mobile__info">
                        <div className="product-row-mobile__name">{p.name}</div>
                        <div className="product-row-mobile__cat">{p.category || '—'}</div>
                        <div className="product-row-mobile__price">{fmt(p.price)}</div>
                      </div>
                      <div className="product-row-mobile__actions">
                        <span className={`badge badge--${p.active ? 'active' : 'inactive'}`}>{p.active ? 'Ativo' : 'Inativo'}</span>
                        <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openEdit(p)}>Editar</button>
                        <button type="button" className="btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDeleteProduct(p.id)}>Remover</button>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="state-empty">
                    O arquivo está vazio.{' '}
                    <button type="button" onClick={openNew} style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                      Iniciar a primeira formulação
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ---- RITUAIS (PEDIDOS) ---- */}
        {view === 'pedidos' && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Rituais (Pedidos)</h1>
                <p className="admin-subtitle">Acompanhe as invocações e despachos em tempo real.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={loadOrders}>Atualizar</button>
            </div>

            {orders.length === 0 ? (
              <div className="state-empty">O salão está silencioso. Nenhum ritual pendente.</div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card__header">
                      <div>
                        <div className="order-card__id">#{order.id.slice(0, 8).toUpperCase()}</div>
                        <div className="order-card__customer">{order.customer}</div>
                        <div className="order-card__phone">{order.phone}</div>
                      </div>
                      <select className="status-select" value={order.status} onChange={e => handleOrderStatus(order.id, e.target.value)}>
                        <option value="novo">Novo</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div className="order-card__items">
                      {Array.isArray(order.items)
                        ? order.items.map(i => `${i.qty}× ${i.name}`).join(' · ')
                        : JSON.stringify(order.items)
                      }
                    </div>
                    <div className="order-card__footer">
                      <div className="order-card__total">{fmt(order.total)}</div>
                      <div className="order-card__date">{fmtDate(order.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- CATEGORIAS ---- */}
        {view === 'categorias' && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Categorias</h1>
                <p className="admin-subtitle">Organizar os grimórios da loja — usadas no catálogo e nos formulários de produto.</p>
              </div>
            </div>

            <div className="categories-view">
              <div className="categories-add-form">
                <input
                  type="text"
                  className="categories-input"
                  placeholder="Nova categoria — ex: Óleos Botânicos, Vestuário, Alta Joalheria..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                />
                <button type="button" className="btn-primary" onClick={addCategory}>
                  + Adicionar
                </button>
              </div>

              <div className="categories-list">
                {categories.map(cat => (
                  <div key={cat} className="category-item">
                    <span className="category-item__name">{cat}</span>
                    <span className="category-item__count">
                      {products.filter(p => p.category === cat).length} produto{products.filter(p => p.category === cat).length !== 1 ? 's' : ''}
                    </span>
                    <button type="button" className="btn-danger" onClick={() => removeCategory(cat)}>
                      Remover
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="state-empty">Nenhuma categoria cadastrada.</div>
                )}
              </div>

              <p className="categories-hint">
                As categorias aparecem no filtro da loja e no formulário de cadastro de produto.
                Ao remover uma categoria, os produtos vinculados mantêm o valor mas ficam sem filtro ativo.
              </p>
            </div>
          </>
        )}

        {/* ---- ALQUIMIA (CONFIGURAÇÕES) ---- */}
        {view === 'alquimia' && (
          <>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Alquimia da Loja</h1>
                <p className="admin-subtitle">Configure o nome, identidade e informações de contato da loja.</p>
              </div>
            </div>

            <div className="settings-form">

              <div className="settings-section">
                <h2 className="settings-section__title">Identidade</h2>

                <div className="settings-field">
                  <label className="settings-label">Nome da Loja</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.name}
                    onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                    placeholder="ex: Babilônica"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Tagline</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.tagline}
                    onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))}
                    placeholder="ex: Alquimia Ancestral · Essências & Rituais"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Cidade</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.city}
                    onChange={e => setSettings(s => ({ ...s, city: e.target.value }))}
                    placeholder="ex: São Paulo — SP"
                  />
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section__title">Contato & Pedidos</h2>

                <div className="settings-field">
                  <label className="settings-label">
                    WhatsApp
                    <span className="settings-label__hint">somente números com DDI — ex: 5514999990000</span>
                  </label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.whatsapp}
                    onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))}
                    placeholder="5511999999999"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Prefixo de Preço</label>
                  <input
                    type="text"
                    className="settings-input settings-input--short"
                    value={settings.currency}
                    onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                    placeholder="R$"
                  />
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section__title">Logotipo</h2>

                {settings.logo_url && (
                  <div className="settings-logo-preview">
                    <img src={settings.logo_url} alt="Logo atual" className="settings-logo-img" />
                    <span className="settings-logo-preview__label">Logo atual</span>
                  </div>
                )}

                <div className="settings-field">
                  <label className="settings-label">URL da Imagem</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.logo_url}
                    onChange={e => setSettings(s => ({ ...s, logo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Upload do logotipo</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="settings-file-input"
                    onChange={handleLogoUpload}
                  />
                  {DEMO && (
                    <p className="settings-hint">Modo demo: upload local visível nesta sessão. Para salvar permanentemente use a URL ou ative o Supabase.</p>
                  )}
                </div>
              </div>

              <div className="settings-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                </button>
                <p className="settings-reload-hint">
                  Após salvar, recarregue a página da loja para ver as alterações em vigor.
                </p>
              </div>

            </div>
          </>
        )}

      </div>

      {/* TOAST */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setModalOpen(false); setEditProduct(null) }}
        />
      )}
    </div>
  )
}
