import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { LayoutGrid, Boxes, History, RefreshCw } from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'
import ItemsTab from './components/ItemsTab.jsx'
import ActivityTab from './components/ActivityTab.jsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'items', label: 'Items', icon: Boxes },
  { id: 'activity', label: 'Activity', icon: History },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [items, setItems] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [itemsRes, movementsRes] = await Promise.all([
        supabase.from('items').select('*').order('name', { ascending: true }),
        supabase
          .from('stock_movements')
          .select('*, items(name, unit)')
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (itemsRes.error) throw itemsRes.error
      if (movementsRes.error) throw movementsRes.error

      setItems(itemsRes.data || [])
      setMovements(movementsRes.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const lowStockItems = items.filter((i) => Number(i.current_stock) <= Number(i.low_stock_threshold))

  // Map of item_id -> timestamp of its most recent stock movement (from the recent movements list)
  const lastMovedMap = {}
  for (const m of movements) {
    if (!lastMovedMap[m.item_id]) lastMovedMap[m.item_id] = m.created_at
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-rule bg-paper sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-steel font-semibold">Royal Sanitary House</p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold leading-none -mt-0.5">
              Stock Ledger
            </h1>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-sm font-medium text-steel hover:text-ink transition-colors px-3 py-2 rounded-md border border-rule bg-white/60"
            title="Refresh data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 -mb-px">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold font-display tracking-wide border-b-2 transition-colors ${
                  active
                    ? 'border-tag text-tag'
                    : 'border-transparent text-ink/50 hover:text-ink'
                }`}
              >
                <Icon size={16} />
                {t.label}
                {t.id === 'dashboard' && lowStockItems.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center text-[11px] font-bold bg-alert text-white rounded-full w-5 h-5">
                    {lowStockItems.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 border border-alert/30 bg-alert/10 text-alert text-sm rounded-md px-4 py-3">
            {error}. Check that your Supabase URL/key are set correctly and the schema has been created.
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-center text-ink/50 py-20 font-display text-xl">Loading stock data…</div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard items={items} movements={movements} lowStockItems={lowStockItems} />
            )}
            {tab === 'items' && <ItemsTab items={items} onChange={fetchData} lastMovedMap={lastMovedMap} />}
            {tab === 'activity' && <ActivityTab movements={movements} />}
          </>
        )}
      </main>

      <footer className="border-t border-rule py-3 text-center text-xs text-ink/40 font-display tracking-wide">
        POC — Royal Sanitary House Inventory · Top SKU tracker
      </footer>
    </div>
  )
}