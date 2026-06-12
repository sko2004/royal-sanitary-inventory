import React, { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import ItemCard from './ItemCard.jsx'
import ItemFormModal from './ItemFormModal.jsx'
import StockAdjustModal from './StockAdjustModal.jsx'

export default function ItemsTab({ items, onChange }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [formItem, setFormItem] = useState(undefined) // undefined = closed, null = new, item = edit
  const [adjust, setAdjust] = useState(null) // { item, type }

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category))
    return ['All', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      const matchesQuery =
        !q || i.name.toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q)
      const matchesCategory = category === 'All' || i.category === category
      return matchesQuery && matchesCategory
    })
  }, [items, query, category])

  const handleSaved = () => {
    setFormItem(undefined)
    onChange()
  }

  const handleAdjustSaved = () => {
    setAdjust(null)
    onChange()
  }

  return (
    <div>
      {/* Search + add */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full border border-rule rounded-md pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
          />
        </div>
        <button
          onClick={() => setFormItem(null)}
          className="flex items-center justify-center gap-1.5 bg-ink text-paper font-display font-bold tracking-wide px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add item
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              category === c
                ? 'bg-tag text-white border-tag'
                : 'border-rule text-ink/50 bg-white hover:text-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Item grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-ink/50 border border-rule rounded-lg px-4 py-10 text-center bg-white mt-2">
          {items.length === 0
            ? 'No items yet. Add your first SKU to get started.'
            : 'No items match your search.'}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={(it) => setFormItem(it)}
              onAdjust={(it, type) => setAdjust({ item: it, type })}
            />
          ))}
        </div>
      )}

      {formItem !== undefined && (
        <ItemFormModal item={formItem} onClose={() => setFormItem(undefined)} onSaved={handleSaved} />
      )}

      {adjust && (
        <StockAdjustModal
          item={adjust.item}
          type={adjust.type}
          onClose={() => setAdjust(null)}
          onSaved={handleAdjustSaved}
        />
      )}
    </div>
  )
}
