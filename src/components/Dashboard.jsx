import React from 'react'
import { AlertTriangle, Package, Activity, Layers } from 'lucide-react'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="border border-rule bg-white rounded-lg px-4 py-3.5 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={17} className="text-white" />
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-xs text-ink/50 uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard({ items, movements, lowStockItems }) {
  const today = new Date().toDateString()
  const todaysMovements = movements.filter((m) => new Date(m.created_at).toDateString() === today)
  const categories = new Set(items.map((i) => i.category))

  // Recently moved items (most recent unique items from movements)
  const recentItemIds = []
  for (const m of movements) {
    if (!recentItemIds.includes(m.item_id)) recentItemIds.push(m.item_id)
    if (recentItemIds.length >= 5) break
  }
  const recentItems = recentItemIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total SKUs" value={items.length} accent="bg-steel" />
        <StatCard icon={Layers} label="Categories" value={categories.size} accent="bg-ink" />
        <StatCard icon={Activity} label="Moves today" value={todaysMovements.length} accent="bg-ok" />
        <StatCard
          icon={AlertTriangle}
          label="Low stock"
          value={lowStockItems.length}
          accent={lowStockItems.length > 0 ? 'bg-alert' : 'bg-ok'}
        />
      </div>

      {/* Low stock alerts */}
      <div>
        <h2 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-alert" />
          Needs reordering
        </h2>
        {lowStockItems.length === 0 ? (
          <p className="text-sm text-ink/50 border border-rule rounded-lg px-4 py-6 text-center bg-white">
            Nothing below threshold right now. Good shape.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="border border-alert/30 bg-alert/5 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-ink/50">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-alert leading-none">
                    {item.current_stock} {item.unit}
                  </p>
                  <p className="text-[11px] text-ink/40">threshold {item.low_stock_threshold}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently moved */}
      <div>
        <h2 className="font-display text-xl font-bold mb-2">Recently moved</h2>
        {recentItems.length === 0 ? (
          <p className="text-sm text-ink/50 border border-rule rounded-lg px-4 py-6 text-center bg-white">
            No stock movements logged yet. Use the Items tab to record stock in/out.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="border border-rule bg-white rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-ink/50">{item.category}</p>
                </div>
                <p className="font-display text-lg font-bold leading-none">
                  {item.current_stock} {item.unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
