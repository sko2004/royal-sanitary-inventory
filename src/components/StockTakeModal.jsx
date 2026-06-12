import React, { useState, useMemo } from 'react'
import { X, ClipboardList, Search } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function StockTakeModal({ items, onClose, onSaved }) {
  const [counts, setCounts] = useState({}) // item_id -> string value typed by user
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q)
    )
  }, [items, query])

  const handleChange = (id, value) => {
    setCounts((c) => ({ ...c, [id]: value }))
  }

  // Items where the typed count differs from the stored current_stock
  const changedItems = items
    .map((item) => {
      const raw = counts[item.id]
      if (raw === undefined || raw === '') return null
      const counted = Number(raw)
      if (Number.isNaN(counted)) return null
      const diff = counted - Number(item.current_stock)
      if (diff === 0) return null
      return { item, counted, diff }
    })
    .filter(Boolean)

  const handleSave = async () => {
    if (changedItems.length === 0) {
      onClose()
      return
    }
    setSaving(true)
    setError(null)
    try {
      for (const { item, counted, diff } of changedItems) {
        const movement = {
          item_id: item.id,
          type: diff > 0 ? 'in' : 'out',
          quantity: Math.abs(diff),
          note: 'Stock take adjustment',
        }
        const { error: moveError } = await supabase.from('stock_movements').insert(movement)
        if (moveError) throw moveError

        const { error: updateError } = await supabase
          .from('items')
          .update({ current_stock: counted, updated_at: new Date().toISOString() })
          .eq('id', item.id)
        if (updateError) throw updateError
      }
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-paper border border-rule rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <ClipboardList size={20} />
            Stock take
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-rule">
          <p className="text-sm text-ink/60 mb-2">
            Walk the shelves and type the counted quantity for each item. Leave items unchanged
            if the count matches — only changed items will be saved as adjustments.
          </p>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter items…"
              className="w-full border border-rule rounded-md pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {error && (
            <div className="text-sm text-alert bg-alert/10 border border-alert/30 rounded px-3 py-2 my-2">
              {error}
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-paper">
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink/40">
                <th className="py-2 font-semibold">Item</th>
                <th className="py-2 font-semibold text-right">System</th>
                <th className="py-2 font-semibold text-right w-24">Counted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filtered.map((item) => {
                const raw = counts[item.id]
                const counted = raw === undefined || raw === '' ? null : Number(raw)
                const diff = counted === null || Number.isNaN(counted) ? 0 : counted - Number(item.current_stock)
                return (
                  <tr key={item.id}>
                    <td className="py-2 pr-2">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-ink/40">{item.category}</p>
                    </td>
                    <td className="py-2 text-right text-ink/50 whitespace-nowrap">
                      {item.current_stock} {item.unit}
                    </td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={raw ?? ''}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        placeholder={String(item.current_stock)}
                        className={`w-20 text-right border rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40 ${
                          diff !== 0 ? 'border-tag' : 'border-rule'
                        }`}
                      />
                      {diff !== 0 && (
                        <p className={`text-[11px] mt-0.5 ${diff > 0 ? 'text-ok' : 'text-alert'}`}>
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-rule">
          <p className="text-sm text-ink/50">
            {changedItems.length} item{changedItems.length === 1 ? '' : 's'} changed
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-tag text-white font-display font-bold tracking-wide px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : `Save ${changedItems.length > 0 ? changedItems.length + ' change' + (changedItems.length === 1 ? '' : 's') : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}