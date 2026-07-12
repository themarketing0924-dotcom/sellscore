export interface RadarChartItem {
  label: string;
  score: number; // 0~10
}

const SIZE = 320;
const CENTER = SIZE / 2;
const MAX_R = SIZE / 2 - 56;
const RINGS = [0.25, 0.5, 0.75, 1];

export function RadarChart({ items }: { items: RadarChartItem[] }) {
  const n = items.length;
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i: number, ratio: number) => {
    const angle = angleFor(i);
    const r = MAX_R * ratio;
    return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
  };

  const dataPoints = items.map((item, i) => pointFor(i, Math.min(item.score / 10, 1)));
  const dataPath = dataPoints.map((p) => p.join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[360px] mx-auto">
      {/* rings */}
      {RINGS.map((ratio) => {
        const ringPoints = items.map((_, i) => pointFor(i, ratio).join(',')).join(' ');
        return (
          <polygon
            key={ratio}
            points={ringPoints}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* spokes */}
      {items.map((_, i) => {
        const [x, y] = pointFor(i, 1);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* data shape */}
      <polygon points={dataPath} fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.9)" strokeWidth={1.5} />

      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill="rgba(56,189,248,1)" />
      ))}

      {/* labels */}
      {items.map((item, i) => {
        const [x, y] = pointFor(i, 1.28);
        return (
          <text
            key={item.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="rgba(255,255,255,0.45)"
          >
            {item.label.length > 10 ? `${item.label.slice(0, 9)}…` : item.label}
          </text>
        );
      })}
    </svg>
  );
}
