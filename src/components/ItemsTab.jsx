import React, { useState, useMemo } from 'react'
import { Search, Plus, Download, ClipboardList, ArrowUpDown } from 'lucide-react'
import ItemCard from './ItemCard.jsx'
import ItemFormModal from './ItemFormModal.jsx'
import StockAdjustModal from './StockAdjustModal.jsx'
import StockTakeModal from './StockTakeModal.jsx'
import { itemsToCSV, downloadCSV } from '../utils'

const SORT_OPTIONS = [
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'lowstock', label: 'Lowest stock first' },
  { id: 'recent', label: 'Recently moved' },
]

export default function ItemsTab({ items, onChange, lastMovedMap = {} }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [formItem, setFormItem] = useState(undefined) // undefined = closed, null = new, item = edit
  const [adjust, setAdjust] = useState(null) // { item, type }
  const [stockTakeOpen, setStockTakeOpen] = useState(false)

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category))
    return ['All', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((i) => {
      const matchesQuery =
        !q || i.name.toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q)
      const matchesCategory = category === 'All' || i.category === category
      return matchesQuery && matchesCategory
    })

    const sorted = [...result]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'lowstock') {
      // Sort by how close to (or below) threshold the item is — most urgent first
      sorted.sort((a, b) => {
        const ra = Number(a.low_stock_threshold) > 0 ? Number(a.current_stock) / Number(a.low_stock_threshold) : Infinity
        const rb = Number(b.low_stock_threshold) > 0 ? Number(b.current_stock) / Number(b.low_stock_threshold) : Infinity
        return ra - rb
      })
    } else if (sortBy === 'recent') {
      // Items with a recent movement first (most recent first); items never moved go last
      sorted.sort((a, b) => {
        const ta = lastMovedMap[a.id] ? new Date(lastMovedMap[a.id]).getTime() : 0
        const tb = lastMovedMap[b.id] ? new Date(lastMovedMap[b.id]).getTime() : 0
        return tb - ta
      })
    }
    return sorted
  }, [items, query, category, sortBy, lastMovedMap])

  const handleSaved = () => {
    setFormItem(undefined)
    onChange()
  }

  const handleAdjustSaved = () => {
    setAdjust(null)
    onChange()
  }

  const handleStockTakeSaved = () => {
    setStockTakeOpen(false)
    onChange()
  }

  const handleExport = () => {
    const csv = itemsToCSV(filtered)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCSV(`stock-export-${stamp}.csv`, csv)
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

      {/* Toolbar: category chips + sort + export + stock take */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
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

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none border border-rule rounded-md pl-7 pr-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-white text-ink/60 focus:outline-none focus:ring-2 focus:ring-tag/40"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide border border-rule bg-white text-ink/60 hover:text-ink px-3 py-1.5 rounded-md transition-colors"
            title="Export current view as CSV"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setStockTakeOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-steel text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            title="Bulk-update quantities during a physical count"
          >
            <ClipboardList size={13} /> Stock take
          </button>
        </div>
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

      {stockTakeOpen && (
        <StockTakeModal
          items={filtered}
          onClose={() => setStockTakeOpen(false)}
          onSaved={handleStockTakeSaved}
        />
      )}
    </div>
  )
}