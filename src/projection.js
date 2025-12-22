
export default function(a, b, length, p) {
  const bx = b.x - a.x;
  const by = b.y - a.y;
  const px = p.x - a.x;
  const py = p.y - a.y;
  const dp = (bx * px + by * py);
  const s = dp / length;

  const w = by * px - bx * py;
  const h = Math.abs(w / length);

  const x = a.x + s * bx / length;
  const y = a.y + s * by / length;

  return { x, y, s, h, a: Math.sign(w) };
}
