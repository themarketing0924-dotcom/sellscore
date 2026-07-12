import { motion } from 'framer-motion';

export interface BarChartItem {
  label: string;
  score: number; // 0~10
  locked?: boolean;
}

export function BarChart({ items }: { items: BarChartItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-[120px] sm:w-[180px] shrink-0 text-[11px] sm:text-[12px] text-white/50 truncate">
            {item.label}
          </div>
          <div className="flex-1 h-6 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                item.locked ? 'bg-white/20' : barColor(item.score)
              }`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.score / 10) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
              viewport={{ once: true }}
            />
          </div>
          <div className="w-[32px] shrink-0 text-right text-[12px] text-white/70 tabular-nums">
            {item.score.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}

function barColor(score: number): string {
  if (score >= 7) return 'bg-emerald-400/80';
  if (score >= 5) return 'bg-amber-400/80';
  return 'bg-rose-400/80';
}
