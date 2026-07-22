export interface RadarChartItem {
  label: string;
  score: number; // 0~10
}

const SIZE = 360;
const CENTER = SIZE / 2;
const MAX_R = SIZE / 2 - 72;
const RINGS = [0.25, 0.5, 0.75, 1];

// 라벨이 길면 잘라서 "…"로 뭉개는 대신 두 줄로 나눠 전부 읽히게 한다.
// "&"가 있으면 그 자리에서 자연스럽게 나누고, 없으면 중간 공백에서 나눈다.
function splitLabel(label: string): [string, string | null] {
  if (label.length <= 9) return [label, null];

  const ampIdx = label.indexOf('&');
  if (ampIdx > 0) {
    return [label.slice(0, ampIdx).trim(), label.slice(ampIdx).trim()];
  }

  // "&"가 없으면 전체 길이의 절반과 가장 가까운 공백에서 나눈다.
  const mid = Math.floor(label.length / 2);
  let bestSpace = -1;
  let bestDist = Infinity;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === ' ') {
      const dist = Math.abs(i - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestSpace = i;
      }
    }
  }
  if (bestSpace === -1) return [label, null];
  return [label.slice(0, bestSpace).trim(), label.slice(bestSpace + 1).trim()];
}

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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[400px] mx-auto">
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
        const [x, y] = pointFor(i, 1.32);
        const [line1, line2] = splitLabel(item.label);
        return (
          <text
            key={item.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={700}
            fill="rgba(255,255,255,0.85)"
          >
            <tspan x={x} dy={line2 ? '-0.5em' : 0}>
              {line1}
            </tspan>
            {line2 && (
              <tspan x={x} dy="1.15em">
                {line2}
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}
