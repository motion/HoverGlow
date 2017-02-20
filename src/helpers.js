
export function offset(ev, target, out) {
  target = target || ev.currentTarget || ev.srcElement
  if (!Array.isArray(out)) {
    out = [0, 0]
  }
  const cx = ev.clientX || 0
  const cy = ev.clientY || 0
  target.lastdimensions = target.lastdimensions || target.getBoundingClientRect()
  const rect = target.lastdimensions
  out[0] = cx - rect.left
  out[1] = cy - rect.top
  return out
}
