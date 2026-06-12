import React from 'react'
import { Plus, Minus, Pencil } from 'lucide-react'

export default function ItemCard({ item, onAdjust, onEdit }) {
  const stock = Number(item.current_stock)
  const threshold = Number(item.low_stock_threshold)
  const low = stock <= threshold
  // Gauge: fill relative to 2x threshold (so threshold sits at midpoint), capped at 100%
  const ratio = threshold > 0 ? Math.min((stock / (threshold * 2)) * 100, 100) : 100

  let fillColor = 'bg-ok'
  if (low) fillColor = 'bg-alert'
  else if (ratio < 65) fillColor = '#E8622C'

  return (
    <div className="relative border border-rule bg-white rounded-lg pl-4 pr-3 py-3">
      {/* tag hole */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-paper border border-rule" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{item.name}</p>
            {low && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-alert/10 text-alert px-1.5 py-0.5 rounded">
                Reorder
              </span>
            )}
          </div>
          <p className="text-xs text-ink/50 mt-0.5">
            {item.category} {item.sku ? `· ${item.sku}` : ''}
          </p>
        </div>
        <button
          onClick={() => onEdit(item)}
          className="text-ink/30 hover:text-ink transition-colors p-1"
          title="Edit item"
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-2xl font-extrabold leading-none">
              {item.current_stock}
              <span className="text-xs font-body font-medium text-ink/40 ml-1">{item.unit}</span>
            </span>
            <span className="text-[11px] text-ink/40">min {item.low_stock_threshold}</span>
          </div>
          <div className="gauge-track">
            <div
              className={`gauge-fill ${fillColor.startsWith('#') ? '' : fillColor}`}
              style={{ width: `${ratio}%`, backgroundColor: fillColor.startsWith('#') ? fillColor : undefined }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAdjust(item, 'out')}
            className="w-8 h-8 rounded-md border border-rule flex items-center justify-center text-alert hover:bg-alert/5 transition-colors"
            title="Stock out (sale/usage)"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => onAdjust(item, 'in')}
            className="w-8 h-8 rounded-md border border-rule flex items-center justify-center text-ok hover:bg-ok/5 transition-colors"
            title="Stock in (purchase/restock)"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
