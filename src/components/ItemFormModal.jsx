import React, { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

const UNITS = ['pcs', 'bag', 'box', 'kg', 'litre', 'meter', 'roll', 'set']

export default function ItemFormModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    name: '',
    category: '',
    sku: '',
    unit: 'pcs',
    current_stock: 0,
    low_stock_threshold: 5,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category || '',
        sku: item.sku || '',
        unit: item.unit || 'pcs',
        current_stock: item.current_stock ?? 0,
        low_stock_threshold: item.low_stock_threshold ?? 5,
      })
    }
  }, [item])

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        sku: form.sku.trim() || null,
        unit: form.unit,
        current_stock: Number(form.current_stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        updated_at: new Date().toISOString(),
      }

      if (!payload.name) throw new Error('Item name is required')

      if (isEdit) {
        const { error } = await supabase.from('items').update(payload).eq('id', item.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('items').insert(payload)
        if (error) throw error
      }

      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.name}"? This also removes its movement history.`)) return
    setSaving(true)
    try {
      const { error } = await supabase.from('items').delete().eq('id', item.id)
      if (error) throw error
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-paper border border-rule rounded-lg w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <h3 className="font-display text-xl font-bold">{isEdit ? 'Edit item' : 'Add item'}</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <div className="text-sm text-alert bg-alert/10 border border-alert/30 rounded px-3 py-2">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
              Item name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              placeholder="e.g. PVC Pipe 1 inch"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
                placeholder="e.g. Pipes"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
                placeholder="optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Current stock
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.current_stock}
                onChange={(e) => handleChange('current_stock', e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Low stock at
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                className="w-full border border-rule rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tag/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm text-alert hover:underline disabled:opacity-50"
              >
                <Trash2 size={14} /> Delete item
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-tag text-white font-display font-bold tracking-wide px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
