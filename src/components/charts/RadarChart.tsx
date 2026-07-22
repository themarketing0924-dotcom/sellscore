export interface RadarChartItem {
  label: string;
  score: number; // 0~10
}

const SIZE = 400;
const CENTER = SIZE / 2;
const MAX_R = 115;

function splitLabel(label: string): [string, string | null] {
  if (label.length <= 9) return [label, null];

  const ampIdx = label.indexOf('&');
  if (ampIdx > 0) {
    return [label.slice(0, ampIdx).trim(), label.slice(ampIdx).trim()];
  }

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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[420px] mx-auto">
      <defs>
        {/* Design 3: 중심(warm/orange) → 외곽(cool/cyan) 방사형 그라디언트 */}
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251,146,60,0.6)" />
          <stop offset="45%" stopColor="rgba(34,197,94,0.38)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.2)" />
        </radialGradient>
        {/* 스트로크 글로우 필터 */}
        <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* 바깥 구역 미묘한 배경색 그라디언트 */}
        <radialGradient id="zoneBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.07)" />
          <stop offset="50%" stopColor="rgba(249,115,22,0.04)" />
          <stop offset="80%" stopColor="rgba(250,204,21,0.03)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.04)" />
        </radialGradient>
      </defs>

      {/* 존 배경 (Design 3: 구역별 색감) */}
      <circle cx={CENTER} cy={CENTER} r={MAX_R} fill="url(#zoneBg)" />

      {/* Design 2: 원형 링 그리드 (polygon 대신 circle) */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={ratio}
          cx={CENTER}
          cy={CENTER}
          r={MAX_R * ratio}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.75}
        />
      ))}

      {/* 스포크 */}
      {items.map((_, i) => {
        const [x, y] = pointFor(i, 1);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.75}
          />
        );
      })}

      {/* 데이터 fill — 방사형 그라디언트 */}
      <polygon points={dataPath} fill="url(#radarFill)" />

      {/* 데이터 스트로크 + 글로우 (Design 3 스타일) */}
      <polygon
        points={dataPath}
        fill="none"
        stroke="rgba(56,189,248,0.9)"
        strokeWidth={1.75}
        filter="url(#radarGlow)"
      />

      {/* 데이터 꼭짓점 dot */}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3.5}
          fill="rgba(56,189,248,1)"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth={1}
        />
      ))}

      {/* 축 끝 번호 배지 (Design 3 핵심 요소) */}
      {items.map((_, i) => {
        const [bx, by] = pointFor(i, 1.17);
        return (
          <g key={`badge-${i}`}>
            <circle
              cx={bx}
              cy={by}
              r={9}
              fill="rgba(10,18,35,0.92)"
              stroke="rgba(56,189,248,0.45)"
              strokeWidth={1}
            />
            <text
              x={bx}
              y={by}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7.5}
              fontWeight={800}
              fill="rgba(255,255,255,0.85)"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* 라벨 텍스트 */}
      {items.map((item, i) => {
        const [x, y] = pointFor(i, 1.45);
        const [line1, line2] = splitLabel(item.label);
        return (
          <text
            key={item.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10.5}
            fontWeight={700}
            fill="rgba(255,255,255,0.82)"
          >
            <tspan x={x} dy={line2 ? '-0.55em' : 0}>
              {line1}
            </tspan>
            {line2 && (
              <tspan x={x} dy="1.2em">
                {line2}
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}
