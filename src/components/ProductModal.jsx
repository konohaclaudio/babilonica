import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'
const MAX_SLOTS = 3

export default function ProductModal({ product, categories, onSave, onClose }) {
  // Seed image slots: prefer product.images[], fall back to image_url for slot 0
  const seedImages = () => {
    const arr = ['', '', '']
    const src = product?.images?.length
      ? product.images
      : product?.image_url ? [product.image_url] : []
    src.slice(0, MAX_SLOTS).forEach((url, i) => { arr[i] = url || '' })
    return arr
  }

  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    category:    product?.category    || categories[0] || '',
    active:      product?.active      ?? true,
    sort_order:  product?.sort_order  || 0,
  })
  const [images, setImages]         = useState(seedImages)
  const [uploading, setUploading]   = useState([false, false, false])
  const [uploadError, setUploadError] = useState('')
  const fileRefsEl = useRef([])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setImage(index, url) {
    setImages(prev => { const n = [...prev]; n[index] = url; return n })
  }

  function setSlotUploading(index, val) {
    setUploading(prev => { const n = [...prev]; n[index] = val; return n })
  }

  async function handleFileChange(e, slotIndex) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Formato não suportado. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Imagem muito grande. Máximo 4 MB.')
      return
    }

    setSlotUploading(slotIndex, true)
    setUploadError('')

    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}-${slotIndex}.${ext}`

    if (DEMO) {
      // Demo: use object URL (ephemeral, not persisted)
      const localUrl = URL.createObjectURL(file)
      setImage(slotIndex, localUrl)
      setSlotUploading(slotIndex, false)
      return
    }

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploadError('Erro ao fazer upload. Verifique o bucket no Supabase.')
      setSlotUploading(slotIndex, false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    setImage(slotIndex, publicUrl)
    setSlotUploading(slotIndex, false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const filtered = images.filter(Boolean)
    onSave({
      ...form,
      id:         product?.id,
      price:      parseFloat(form.price),
      sort_order: parseInt(form.sort_order) || 0,
      images:     filtered,
      image_url:  filtered[0] || '',
    })
  }

  const SLOT_LABELS = ['Principal', 'Foto 2', 'Foto 3']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__header">
          <span className="modal__title">{product ? 'Editar produto' : 'Novo produto'}</span>
          <button type="button" className="cart-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ex: Colar Ishtar"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preço *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="89.90"
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Descrição do produto (opcional)"
              />
            </div>

            {/* ── 3 SLOTS DE IMAGEM ── */}
            <div className="form-group">
              <label>Fotos do produto (até 3)</label>
              <div className="image-slots">
                {[0, 1, 2].map(i => (
                  <div key={i} className="image-slot">
                    <div
                      className={`image-slot__preview${uploading[i] ? ' uploading' : ''}`}
                      role="button"
                      tabIndex={0}
                      title={`Clique para escolher ${SLOT_LABELS[i]}`}
                      onClick={() => fileRefsEl.current[i]?.click()}
                      onKeyDown={e => e.key === 'Enter' && fileRefsEl.current[i]?.click()}
                    >
                      {images[i]
                        ? <img src={images[i]} alt={SLOT_LABELS[i]} className="image-slot__img" />
                        : <span className="image-slot__empty">+</span>
                      }
                      {uploading[i] && (
                        <div className="image-slot__spinner" aria-label="Enviando..." />
                      )}
                    </div>

                    <span className="image-slot__label">{SLOT_LABELS[i]}</span>

                    {images[i] && (
                      <button
                        type="button"
                        className="image-slot__remove"
                        onClick={() => setImage(i, '')}
                        title="Remover foto"
                      >
                        ×
                      </button>
                    )}

                    <input
                      ref={el => { fileRefsEl.current[i] = el }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => handleFileChange(e, i)}
                    />
                  </div>
                ))}
              </div>

              {uploadError && (
                <div className="form-error">{uploadError}</div>
              )}

              {/* URL fallback para foto principal */}
              <input
                type="url"
                value={images[0]}
                onChange={e => { setImage(0, e.target.value); setUploadError('') }}
                placeholder="Ou cole a URL da foto principal..."
                style={{ marginTop: '0.5rem' }}
              />
              <p className="form-hint">JPG, PNG ou WebP · máx 4 MB · clique no slot para fazer upload</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ordem (menor = primeiro)</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.active ? 'true' : 'false'} onChange={e => set('active', e.target.value === 'true')}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={uploading.some(Boolean)}>
              {product ? 'Salvar alterações' : 'Adicionar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
