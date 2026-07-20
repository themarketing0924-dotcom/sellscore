import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { Section, FaqAccordion } from './Section';
import { useSeo } from '../../hooks/useSeo';
import { PRICING, PRICING_TIERS } from '../../config/sellscore';
import { TOSS_PRODUCTS } from '../../lib/toss';
import TossCheckoutButton from '../payment/TossCheckoutButton';

// ============================================================
// 요금제 페이지
// ============================================================
// 무료 → 리포트 1회 → 구독 → 에이전시로 이어지는 4단 요금 구조.
// 구독/에이전시는 토스 정기결제(빌링키) 연동 전이라, 매월 수동 결제되는
// 1개월 이용권으로 정직하게 안내한다. (자동 갱신 약속 X)
// ============================================================

const FREE_FEATURES = [
  '월 3회까지 무료 진단 (IP 기준)',
  '종합 설득 전환 점수',
  '가장 큰 핵심 문제 요약',
  '기본 개선 방향',
];

const TIER_FEATURES: Record<string, string[]> = {
  [PRICING.report.id]: PRICING_TIERS.find((t) => t.id === PRICING.report.id)?.features ?? [],
  [PRICING.subscription.id]:
    PRICING_TIERS.find((t) => t.id === PRICING.subscription.id)?.features ?? [],
  [PRICING.agency.id]: PRICING_TIERS.find((t) => t.id === PRICING.agency.id)?.features ?? [],
};

const COMPARISON_ROWS: { label: string; free: string; report: string; subscription: string; agency: string }[] = [
  { label: '월 진단 횟수', free: '3회', report: '1회 리포트', subscription: '30회', agency: '30회' },
  { label: '전체 리포트 열람', free: '×', report: 'O', subscription: 'O', agency: 'O' },
  { label: 'Before/After 수정 프롬프트', free: '×', report: 'O', subscription: 'O', agency: 'O' },
  { label: '개선 전/후 점수 추적', free: '×', report: '×', subscription: 'O', agency: 'O' },
  { label: '사이트 다중 등록', free: '×', report: '×', subscription: '×', agency: 'O' },
  { label: '화이트라벨 PDF', free: '×', report: '×', subscription: '×', agency: 'O' },
];

const PRICING_FAQ = [
  {
    q: '구독은 자동으로 매달 결제되나요?',
    a: '아니요. 현재 구독·에이전시 플랜은 자동 정기결제가 아닌 1개월 이용권입니다. 매월 직접 결제해 주셔야 하며, 자동 갱신 기능은 준비 중입니다.',
  },
  {
    q: '무료 진단과 유료 리포트의 차이는 무엇인가요?',
    a: '무료 진단은 종합 점수와 가장 큰 문제만 보여줍니다. 유료 리포트는 12개 프레임워크 전체 상세 진단과 실제 수정에 쓸 수 있는 Before/After 프롬프트까지 포함합니다.',
  },
  {
    q: '결제 수단은 무엇을 지원하나요?',
    a: '국내 카드는 토스페이먼츠, 해외 카드는 PayPal을 지원합니다.',
  },
  {
    q: '환불이 가능한가요?',
    a: '디지털 콘텐츠 특성상 결제 즉시 열람 가능한 리포트는 전자상거래법에 따라 청약철회가 제한될 수 있습니다. 서비스에 중대한 하자가 있는 경우 문의 주시면 안내해 드립니다. 자세한 내용은 이용약관을 확인해 주세요.',
  },
];

export function PricingPage() {
  useSeo({
    title: '요금제 | 세일즈스코어',
    description:
      '세일즈스코어 요금제 — 무료 진단부터 리포트, 구독, 에이전시 플랜까지 내 사이트에 맞는 플랜을 확인하세요.',
    path: '/pricing',
  });

  const navigate = useNavigate();
  const subscriptionProduct = TOSS_PRODUCTS.find((p) => p.id === PRICING.subscription.id)!;
  const agencyProduct = TOSS_PRODUCTS.find((p) => p.id === PRICING.agency.id)!;

  return (
    <div className="min-h-[100dvh] pt-14">
      <Section
        eyebrow="PRICING"
        heading={
          <>
            내 사이트에 맞는 <span className="gradient-text-static">플랜을 선택하세요</span>
          </>
        }
        sub="카드 등록 없이 무료로 시작하고, 더 깊은 분석이 필요할 때만 결제하세요."
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 max-w-6xl mx-auto items-stretch">
          {/* 무료 */}
          <PlanCard
            label="무료"
            price={0}
            unit=""
            description="처음 확인하는 사이트라면"
            features={FREE_FEATURES}
          >
            <button
              onClick={() => navigate('/diagnose')}
              className="w-full h-12 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              무료로 시작하기
            </button>
          </PlanCard>

          {/* 리포트 1회 */}
          <PlanCard
            label="리포트 1회"
            price={PRICING.report.price}
            unit="1회"
            description="지금 이 사이트만 확인하고 싶다면"
            features={TIER_FEATURES[PRICING.report.id]}
          >
            <button
              onClick={() => navigate('/diagnose')}
              className="w-full h-12 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              무료 진단부터 시작
            </button>
            <p className="text-white/30 text-[11px] text-center mt-2.5">
              진단 결과 화면에서 리포트를 결제할 수 있습니다
            </p>
          </PlanCard>

          {/* 구독 (인기) */}
          <PlanCard
            label="구독"
            price={PRICING.subscription.price}
            unit="월"
            description="여러 사이트를 계속 개선하고 싶다면"
            features={TIER_FEATURES[PRICING.subscription.id]}
            popular
          >
            <TossCheckoutButton
              product={subscriptionProduct}
              className="!h-12 !text-[14px]"
              onError={(err) => console.error('[Toss] 구독 결제 오류:', err)}
            />
            <p className="text-white/30 text-[11px] text-center mt-2.5">
              자동 갱신 없는 1개월 이용권 · 매월 직접 결제
            </p>
          </PlanCard>

          {/* 에이전시 */}
          <PlanCard
            label="에이전시"
            price={PRICING.agency.price}
            unit="월"
            description="여러 클라이언트를 관리하는 팀이라면"
            features={TIER_FEATURES[PRICING.agency.id]}
          >
            <TossCheckoutButton
              product={agencyProduct}
              className="!h-12 !text-[14px]"
              onError={(err) => console.error('[Toss] 에이전시 결제 오류:', err)}
            />
            <p className="text-white/30 text-[11px] text-center mt-2.5">
              자동 갱신 없는 1개월 이용권 · 매월 직접 결제
            </p>
          </PlanCard>
        </div>
      </Section>

      {/* ══════════ 기능 비교 ══════════ */}
      <Section eyebrow="기능 비교" heading="플랜별로 무엇이 다른가요?">
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 font-semibold py-3 pr-4">항목</th>
                <th className="text-center text-white/70 font-semibold py-3 px-3">무료</th>
                <th className="text-center text-white/70 font-semibold py-3 px-3">리포트</th>
                <th className="text-center text-[#7bd6ff] font-semibold py-3 px-3">구독</th>
                <th className="text-center text-white/70 font-semibold py-3 px-3">에이전시</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-white/[0.06]">
                  <td className="text-left text-white/70 py-3.5 pr-4 font-medium">{row.label}</td>
                  <ComparisonCell value={row.free} />
                  <ComparisonCell value={row.report} />
                  <ComparisonCell value={row.subscription} highlight />
                  <ComparisonCell value={row.agency} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section eyebrow="자주 묻는 질문" heading="요금제 관련 질문">
        <FaqAccordion items={PRICING_FAQ} />
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-white font-bold tracking-tight mb-6"
            style={{ fontSize: 'clamp(24px, 4.5vw, 38px)' }}
          >
            아직 고민 중이라면, <span className="gradient-text-static">무료로 먼저</span> 확인하세요
          </h2>
          <Link
            to="/diagnose"
            className="inline-flex items-center h-14 px-9 rounded-full font-semibold text-[15px] text-white no-underline whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료로 내 사이트 진단받기 →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function PlanCard({
  label,
  price,
  unit,
  description,
  features,
  popular,
  children,
}: {
  label: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  popular?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative flex flex-col rounded-3xl p-6 sm:p-7 text-left border"
      style={
        popular
          ? { borderColor: 'rgba(0,100,255,0.4)', background: 'rgba(0,100,255,0.06)' }
          : { borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }
      }
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {popular && (
        <span
          className="absolute -top-3 left-6 text-[11px] font-bold text-white px-3 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #0064ff, #4f8bff)' }}
        >
          가장 많이 선택
        </span>
      )}
      <p className="text-white/50 text-[12px] tracking-[0.1em] uppercase font-bold mb-3">{label}</p>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-white font-black text-[30px] tracking-tight">
          {price === 0 ? '무료' : `₩${price.toLocaleString()}`}
        </span>
        {unit && price > 0 && <span className="text-white/40 text-[13px] mb-1.5">/{unit}</span>}
      </div>
      <p className="text-white/40 text-[12.5px] mb-6">{description}</p>

      <ul className="flex flex-col gap-2.5 mb-7 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-white/70 text-[13px] leading-relaxed">
            <Icon name="check" size={13} className="text-[#7bd6ff] mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="flex flex-col">{children}</div>
    </motion.div>
  );
}

function ComparisonCell({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === 'O') {
    return (
      <td className="text-center py-3.5 px-3">
        <Icon
          name="check"
          size={15}
          className={highlight ? 'text-[#7bd6ff] mx-auto' : 'text-white/50 mx-auto'}
        />
      </td>
    );
  }
  if (value === '×') {
    return <td className="text-center text-white/20 py-3.5 px-3">—</td>;
  }
  return (
    <td className={`text-center py-3.5 px-3 font-semibold ${highlight ? 'text-[#7bd6ff]' : 'text-white/70'}`}>
      {value}
    </td>
  );
}
