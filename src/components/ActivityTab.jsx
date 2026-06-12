import React from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityTab({ movements }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-2">Recent activity</h2>
      {movements.length === 0 ? (
        <p className="text-sm text-ink/50 border border-rule rounded-lg px-4 py-10 text-center bg-white">
          No stock movements logged yet.
        </p>
      ) : (
        <div className="border border-rule rounded-lg bg-white divide-y divide-rule overflow-hidden">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                {m.type === 'in' ? (
                  <ArrowUpCircle size={18} className="text-ok shrink-0" />
                ) : (
                  <ArrowDownCircle size={18} className="text-alert shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{m.items?.name || 'Unknown item'}</p>
                  {m.note && <p className="text-xs text-ink/40 truncate">{m.note}</p>}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className={`font-display font-bold ${m.type === 'in' ? 'text-ok' : 'text-alert'}`}>
                  {m.type === 'in' ? '+' : '-'}
                  {m.quantity} {m.items?.unit}
                </p>
                <p className="text-[11px] text-ink/40">{formatTime(m.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
