export default function Filter({ categories, active, onSelect }) {
  return (
    <div className="filter" role="group" aria-label="Filtrar por categoria">
      {categories.map(cat => (
        <button
          key={cat}
          type="button"
          className={`filter__btn${active === cat ? ' active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
