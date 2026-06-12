import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function StockAdjustModal({ item, type, onClose, onSaved }) {
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isIn = type === 'in'
  const qty = Number(quantity)
  const newStock = isIn ? Number(item.current_stock) + (qty || 0) : Number(item.current_stock) - (qty || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than 0')
      return
    }
    if (!isIn && qty > Number(item.current_stock)) {
      setError(`Only ${item.current_stock} ${item.unit} available`)
      return
    }

    setSaving(true)
    try {
      const { error: moveError } = await supabase.from('stock_movements').insert({
        item_id: item.id,
        type,
        quantity: qty,
        note: note.trim() || null,
      })
      if (moveError) throw moveError

      const { error: updateError } = await supabase
        .from('items')
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.id)
      if (updateError) throw updateError

      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-paper border border-rule rounded-lg w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <h3 className="font-display text-xl font-bold">
            {isIn ? 'Stock in' : 'Stock out'} — {item.name}
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <div className="text-sm text-alert bg-alert/10 border border-alert/30 rounded px-3 py-2">{error}</div>
          )}

          <p className="text-sm text-ink/60">
            Current stock: <span className="font-semibold text-ink">{item.current_stock} {item.unit}</span>
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
              Quantity ({item.unit}) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              autoFocus
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              placeholder={isIn ? 'e.g. purchase from supplier' : 'e.g. sold to customer'}
            />
          </div>

          {qty > 0 && (
            <p className="text-xs text-ink/50">
              New stock will be{' '}
              <span className={`font-semibold ${newStock < 0 ? 'text-alert' : 'text-ink'}`}>
                {newStock} {item.unit}
              </span>
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full font-display font-bold tracking-wide px-5 py-2.5 rounded-md text-white transition-opacity disabled:opacity-50 ${
              isIn ? 'bg-ok' : 'bg-alert'
            }`}
          >
            {saving ? 'Saving…' : isIn ? 'Add to stock' : 'Remove from stock'}
          </button>
        </form>
      </div>
    </div>
  )
}
