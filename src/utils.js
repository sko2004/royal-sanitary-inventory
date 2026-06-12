// Format a timestamp as a short relative time string, e.g. "5m ago", "3h ago", "2d ago"
export function timeAgo(timestamp) {
  if (!timestamp) return 'never'
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = Math.max(0, now - then)

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`
  return `${Math.floor(diffMs / week)}w ago`
}

// Convert an array of item objects into a CSV string
export function itemsToCSV(items) {
  const headers = [
    'name',
    'category',
    'sku',
    'unit',
    'current_stock',
    'low_stock_threshold',
    'updated_at',
  ]
  const escape = (val) => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const rows = items.map((item) => headers.map((h) => escape(item[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

// Trigger a browser download of a CSV string
export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}