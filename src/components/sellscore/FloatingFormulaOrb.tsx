import { motion } from 'framer-motion';

// ============================================================
// 로딩 화면용 "떠다니는 수학 공식" 원형 연출
// ============================================================
// 실제 계산을 하는 건 아니지만, 알고리즘이 채점 중인 것처럼 보이도록
// 원 안에 수식/기호를 랜덤 궤도로 떠다니게 한다.
// ============================================================

interface FormulaItem {
  text: string;
  angle: number; // deg, 원 안에서의 위치
  radius: number; // 0~1, 중심으로부터의 거리 비율
  size: number; // px
  duration: number; // s
  delay: number; // s
  color: string;
}

const FORMULAS: FormulaItem[] = [
  { text: 'Σ wᵢxᵢ', angle: 20, radius: 0.72, size: 15, duration: 5.5, delay: 0, color: '#7bd6ff' },
  { text: 'f(x) = σ(z)', angle: 70, radius: 0.55, size: 13, duration: 6.2, delay: 0.4, color: '#a389ff' },
  { text: '∇L(θ)', angle: 130, radius: 0.68, size: 16, duration: 4.8, delay: 0.8, color: '#5b9bff' },
  { text: 'R² ≈ 0.87', angle: 165, radius: 0.4, size: 12, duration: 5.8, delay: 0.2, color: '#7bd6ff' },
  { text: '∫P(x)dx', angle: 210, radius: 0.6, size: 14, duration: 6.5, delay: 1.1, color: '#a389ff' },
  { text: 'argmax', angle: 250, radius: 0.5, size: 12, duration: 5.2, delay: 0.6, color: '#5b9bff' },
  { text: 'w·x + b', angle: 290, radius: 0.7, size: 15, duration: 6.0, delay: 1.4, color: '#7bd6ff' },
  { text: 'Δscore', angle: 330, radius: 0.45, size: 13, duration: 5.4, delay: 0.3, color: '#a389ff' },
  { text: 'O(n log n)', angle: 5, radius: 0.35, size: 11, duration: 6.8, delay: 0.9, color: '#5b9bff' },
  { text: 'λ = 0.15', angle: 95, radius: 0.32, size: 12, duration: 5.0, delay: 1.6, color: '#7bd6ff' },
  { text: 'β₁x₁ + β₂x₂', angle: 190, radius: 0.28, size: 11, duration: 6.3, delay: 0.5, color: '#a389ff' },
  { text: '≈ 100', angle: 45, radius: 0.78, size: 13, duration: 4.6, delay: 1.2, color: '#5b9bff' },
];

export function FloatingFormulaOrb({ size = 260 }: { size?: number }) {
  const center = size / 2;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 원 테두리 글로우 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,100,255,0.10), transparent 70%)',
          border: '1px solid rgba(123,214,255,0.15)',
        }}
      />

      {/* 떠다니는 수식들 — 원 안쪽으로 클립 */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {FORMULAS.map((f, i) => {
          const rad = (f.angle * Math.PI) / 180;
          const x = center + Math.cos(rad) * center * f.radius;
          const y = center + Math.sin(rad) * center * f.radius;
          return (
            <motion.span
              key={i}
              className="absolute font-mono font-medium whitespace-nowrap"
              style={{
                left: x,
                top: y,
                fontSize: f.size,
                color: f.color,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                y: [0, -10, 0, 8, 0],
                x: [0, 6, 0, -6, 0],
                opacity: [0.15, 0.75, 0.4, 0.75, 0.15],
              }}
              transition={{
                duration: f.duration,
                delay: f.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {f.text}
            </motion.span>
          );
        })}
      </div>

      {/* 중심 회전 링 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-14 h-14">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #0064ff, #7bd6ff, transparent 65%)',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}
