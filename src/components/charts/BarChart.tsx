import { motion } from 'framer-motion';

export interface BarChartItem {
  label: string;
  score: number; // 0~10
  locked?: boolean;
}

export function BarChart({ items }: { items: BarChartItem[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-[120px] sm:w-[180px] shrink-0 text-[13px] sm:text-[14px] font-semibold text-white/70 truncate">
            {item.label}
          </div>
          <div className="flex-1 h-3 bg-white/[0.14] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                item.locked ? 'bg-white/25' : barColor(item.score)
              }`}
              style={item.locked ? undefined : { boxShadow: glowFor(item.score) }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.score / 10) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
              viewport={{ once: true }}
            />
          </div>
          <div className="w-[36px] shrink-0 text-right text-[14px] font-bold text-white tabular-nums">
            {item.score.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}

function barColor(score: number): string {
  if (score >= 7) return 'bg-emerald-400';
  if (score >= 5) return 'bg-amber-400';
  return 'bg-rose-400';
}

function glowFor(score: number): string {
  if (score >= 7) return '0 0 10px rgba(52,211,153,0.7)';
  if (score >= 5) return '0 0 10px rgba(251,191,36,0.7)';
  return '0 0 10px rgba(251,113,133,0.7)';
}
