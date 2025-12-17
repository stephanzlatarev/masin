
export default function(line, point) {
  const bx = line.b.x - line.a.x;
  const by = line.b.y - line.a.y;
  const px = point.x - line.a.x;
  const py = point.y - line.a.y;
  const dp = (bx * px + by * py);
  const s = dp / line.length;
  const h = Math.abs((by * px - bx * py) / line.length);

  const x = line.a.x + s * bx / line.length;
  const y = line.a.y + s * by / line.length;

  return { x, y, s, h };
}
