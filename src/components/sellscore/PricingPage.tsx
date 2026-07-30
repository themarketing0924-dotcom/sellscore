import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { Section, FaqAccordion, Em } from './Section';
import { useSeo } from '../../hooks/useSeo';
import { PRICING, PRICING_TIERS, REDIAGNOSIS_WINDOW_DAYS } from '../../config/sellscore';

// ============================================================
// 요금제 페이지 — Claude 가격 페이지 구조 벤치마킹
// ============================================================
// 상단: 카드 4장(무료 + 라이트/추천/프로), 각 카드는 짧은 요약만.
// 하단: 카테고리별로 묶은 상세 비교표 — "카피라이터가 하던 일"과
// "SEO 엔지니어가 하던 일" 두 직군으로 나눠서, AI가 대신하는 일을
// 명시적으로 보여준다. 44개 진단 항목은 전부 무료 공개(정직한 지점)이고,
// 유료의 차이는 수정 지시문 개수 · 재진단 기간 · 우선 지원뿐이다.
// 결제는 이 페이지가 아니라 진단 결과 화면(ResultScreen)에서 리포트 단위로
// 이루어진다 — 그래서 모든 CTA는 /diagnose로 보낸다.
// ============================================================

const FREE_FEATURES = [
  '월 3회까지 무료 진단 (IP 기준)',
  '44개 진단 항목 전체 열람 (카피·SEO·성능)',
  '12개 프레임워크 중 가장 시급한 3개 수정 지시문',
];

const tierFeatures = (id: string) => PRICING_TIERS.find((t) => t.id === id)?.features ?? [];

// ── 실제 진단 항목 전체 나열 (functions/src/index.ts 기준, 하나도 지어내지 않음) ──

const FRAMEWORK_LABELS = [
  '권위 포지셔닝 & 리스크 리버설',
  '가치 사다리 & 훅-스토리-오퍼',
  '측면 세일즈 레터 구조',
  '포지셔닝 & 다이렉트 리스폰스 카피',
  '결과 선체험 설계',
  '주의력 경제 & 콘텐츠 리듬',
  '검색 유입 구조',
  '감정 모멘텀 & 스케일 프레이밍',
  '챌린지 퍼널 & 긴급성 설계',
  '가격 구조 & LTV 설계',
  '채널 전략 진단',
  '전문가 신뢰 자산화',
];

const SITE_SEO_LABELS = [
  'H1 제목 태그',
  'canonical 태그',
  'SNS 공유 미리보기(OG 태그)',
  '모바일 대응(viewport)',
  '파비콘',
  '방문자 추적(애널리틱스)',
  '네이버 서치어드바이저 등록',
  '구글 서치콘솔 등록',
  'SNS/채널 연결',
  '연락 채널(전화/이메일/카카오)',
  'HTTPS 혼합 콘텐츠 없음',
  'XML 사이트맵',
  'robots.txt 크롤링 허용',
  '사이트 이름 구조화 데이터',
  '탐색경로(breadcrumb) 구조화 데이터',
  'URL 구조',
];

const CONTENT_SEO_LABELS = [
  'title 길이 최적화',
  'meta description 분량',
  '헤딩 계층 구조(H2+)',
  '본문 텍스트 충분성',
  '언어(lang) 속성',
  'FAQ 구조화 데이터',
  '아티클 구조화 데이터',
  '내부 링크 연결',
  '콘텐츠 날짜 표시',
  'H1 내용의 충분성',
  '단락(p) 구조',
  '리뷰·평점 구조화 데이터',
];

const PSI_LABELS = ['성능 점수 (Core Web Vitals)', 'SEO 점수', '접근성 점수', '권장사항 점수'];

type Col = 'free' | 'report' | 'standard' | 'pro';
interface ComparisonRow {
  label: string;
  free: string;
  report: string;
  standard: string;
  pro: string;
}
interface ComparisonGroup {
  category: string;
  rows: ComparisonRow[];
}

const allOpen = (labels: string[]): ComparisonRow[] =>
  labels.map((label) => ({ label, free: '점수', report: 'O', standard: 'O', pro: 'O' }));

const COMPARISON_GROUPS: ComparisonGroup[] = [
  {
    category: '핵심 차이',
    rows: [
      { label: 'Before/After 수정 지시문 개수', free: '3개', report: '12개 전체', standard: '12개 전체', pro: '12개 전체' },
      { label: '이 사이트 무제한 재진단', free: '×', report: '×', standard: `${REDIAGNOSIS_WINDOW_DAYS['sellscore-standard']}일간`, pro: `${REDIAGNOSIS_WINDOW_DAYS['sellscore-pro']}일간` },
      { label: '1:1 문의 우선 응답', free: '×', report: '×', standard: '×', pro: 'O' },
      { label: '리포트 CSV 다운로드 (회원가입 시)', free: '×', report: 'O', standard: 'O', pro: 'O' },
      { label: '리포트 링크 공유', free: '×', report: 'O', standard: 'O', pro: 'O' },
    ],
  },
  {
    category: `카피라이터가 하던 일 — 설득·카피·UX 진단 ${FRAMEWORK_LABELS.length}개 (점수·감점 요인은 전체 공개)`,
    rows: allOpen(FRAMEWORK_LABELS),
  },
  {
    category: `SEO 엔지니어가 하던 일 — 기술 SEO ${SITE_SEO_LABELS.length}개 (구글·네이버 공식 가이드 기준, 전체 무료 공개)`,
    rows: allOpen(SITE_SEO_LABELS),
  },
  {
    category: `SEO 엔지니어가 하던 일 — 콘텐츠 SEO ${CONTENT_SEO_LABELS.length}개 (전체 무료 공개)`,
    rows: allOpen(CONTENT_SEO_LABELS),
  },
  {
    category: `SEO 엔지니어가 하던 일 — Google PageSpeed 실측 ${PSI_LABELS.length}종 (전체 무료 공개)`,
    rows: allOpen(PSI_LABELS),
  },
];

const TOTAL_DIAGNOSTIC_ITEMS =
  FRAMEWORK_LABELS.length + SITE_SEO_LABELS.length + CONTENT_SEO_LABELS.length + PSI_LABELS.length;

const PRICING_FAQ = [
  {
    q: '무료 진단과 유료 리포트의 차이는 무엇인가요?',
    a: `종합 점수, SEO·기술 점수, 12개 프레임워크의 점수·감점 요인은 무료로도 전부 확인할 수 있습니다. 유료 리포트는 12개 프레임워크 전체의 실제 수정 지시문(Before/After, 대안 3개씩) — 카피라이터가 문구를 다듬고 SEO 엔지니어가 기술적으로 고치던 걸 AI가 대신 지시문으로 제공합니다.`,
  },
  {
    q: '"이 사이트 무제한 재진단"은 무슨 뜻인가요?',
    a: '추천·프로 플랜은 결제한 사이트 도메인에 한해 30일 또는 90일 동안 다시 진단할 때마다 자동으로 전체 리포트가 열립니다. 자동 정기결제가 아니라 1회 결제로 정해진 기간만큼 이용하는 방식입니다.',
  },
  {
    q: '결제 수단은 무엇을 지원하나요?',
    a: '국내 카드는 토스페이먼츠, 해외 카드는 PayPal을 지원합니다.',
  },
  {
    q: '환불이 가능한가요?',
    a: '디지털 콘텐츠 특성상 결제 즉시 열람 가능한 리포트는 전자상거래법에 따라 청약철회가 제한될 수 있습니다. 서비스에 중대한 하자가 있는 경우 문의 주시면 안내해 드립니다. 자세한 내용은 이용약관을 확인해 주세요.',
  },
  {
    q: '진단 결과, 그냥 AI가 대충 점수 매기는 거 아닌가요?',
    a: '아닙니다. URL을 실제로 크롤링해서 얻은 정보(타이틀, 메타태그, 본문, 구조화 데이터 등)를 근거로 Claude가 12개 프레임워크를 채점하고, SEO·기술 점수(44개 항목)는 구글·네이버 공식 가이드 기준의 규칙 기반 채점이라 AI 판단과 분리돼 있습니다. 각 항목의 판단 근거도 리포트에서 함께 확인할 수 있습니다.',
  },
  {
    q: '라이트와 추천 중 어떤 걸 선택해야 하나요?',
    a: '지금 사이트를 한 번만 정확히 진단받고 직접 고칠 계획이면 라이트로 충분합니다. 수정한 뒤 점수가 실제로 올랐는지 반복 확인하고 싶다면, 30일간 같은 도메인을 무제한 재진단할 수 있는 추천 플랜이 더 유리합니다.',
  },
  {
    q: '개발 지식이 없어도 사용할 수 있나요?',
    a: '네. 리포트가 주는 수정 지시문은 "무엇을, 어떻게 고쳐라"를 자연어로 설명한 프롬프트입니다. 이걸 그대로 복사해서 Claude Code·Cursor 같은 AI 코딩 도구에 붙여넣으면 AI가 대신 수정합니다. 직접 코드를 몰라도 됩니다.',
  },
  {
    q: '프롬프트는 특정 AI 도구에서만 쓸 수 있나요?',
    a: '아닙니다. Claude Code, Cursor, GPT 등 웹사이트 코드를 수정할 수 있는 AI 코딩 도구라면 어디에 붙여넣어도 동작하도록 범용적으로 작성돼 있습니다.',
  },
  {
    q: '결제한 리포트를 나중에 다시 볼 수 있나요?',
    a: '네. 회원가입 후 결제하면 리포트가 계정에 저장돼 "내 진단 내역"에서 언제든 다시 열람할 수 있습니다. 회원가입 없이 결제한 경우 리포트 링크를 별도로 보관해 주세요.',
  },
  {
    q: '꼭 회원가입을 해야 하나요?',
    a: '비로그인 상태에서는 IP당 평생 3회까지만 무료 진단이 가능합니다. 회원가입하면 하루 5회까지 계속 무료로 진단할 수 있고, 진단 내역도 계정에 저장돼 나중에 다시 확인할 수 있습니다.',
  },
];

export function PricingPage() {
  useSeo({
    title: '요금제 | 세일즈스코어',
    description:
      '세일즈스코어 요금제 — 카피라이터와 SEO 엔지니어가 하던 일을 AI로. 44개 진단 항목을 무료/라이트/추천/프로 플랜으로 비교해 보세요.',
    path: '/pricing',
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] pt-14 overflow-x-clip">
      <Section
        eyebrow="PRICING"
        tightEyebrow
        headingSize="hero"
        bgVideo="/marketing-hero-bg.mp4"
        heading={
          <>
            카피라이터와 SEO 엔지니어가 며칠씩 걸리던 일,
            <br className="sm:hidden" />{' '}
            <span className="gradient-text-static">이제 1분이면 됩니다</span>
          </>
        }
        sub={
          <>
            카드 등록 없이 무료로 시작하고, <Em>더 깊은 분석과 실행 지시문이 필요할 때만</Em>{' '}
            결제하세요. 모바일에서도 한눈에 보이도록 핵심만 크게 보여드립니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto px-1 sm:px-0 items-stretch">
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

          <PlanCard
            label="라이트"
            price={PRICING.report.price}
            unit="1회"
            description="지금 이 사이트만 한 번 확인하고 싶다면"
            features={tierFeatures(PRICING.report.id)}
          >
            <button
              onClick={() => navigate('/diagnose')}
              className="w-full h-12 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              무료 진단부터 시작
            </button>
          </PlanCard>

          <PlanCard
            label="추천"
            price={PRICING.standard.price}
            unit="1회"
            description="고치고, 다시 확인하고, 점수가 오를 때까지"
            features={tierFeatures(PRICING.standard.id)}
            popular
          >
            <button
              onClick={() => navigate('/diagnose')}
              className="w-full h-12 rounded-full font-semibold text-[14px] text-white cursor-pointer border-none"
              style={{ background: 'linear-gradient(135deg, #0064ff, #4f8bff)' }}
            >
              무료 진단부터 시작
            </button>
          </PlanCard>

          <PlanCard
            label="프로"
            price={PRICING.pro.price}
            unit="1회"
            description="여러 차례 다듬어서 확실하게 끝내고 싶다면"
            features={tierFeatures(PRICING.pro.id)}
          >
            <button
              onClick={() => navigate('/diagnose')}
              className="w-full h-12 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              무료 진단부터 시작
            </button>
          </PlanCard>
        </div>
        <p className="text-white/30 text-[11px] text-center mt-6">
          결제는 진단 결과 화면에서 리포트 단위로 진행됩니다 — 먼저 무료로 진단해 보세요.
        </p>
      </Section>

      {/* ══════════ 기능 비교 ══════════ */}
      <Section
        eyebrow="기능 비교"
        heading={
          <>
            이 진단이 실제로 보는 <span className="gradient-text-static">{TOTAL_DIAGNOSTIC_ITEMS}개 항목</span>
          </>
        }
        sub={
          <>
            점수와 감점 요인은 <Em>무료로도 전부 공개</Em>합니다. 유료 플랜은 이걸 실제로 고칠
            수 있는 지시문과 재진단 기간을 줍니다.
          </>
        }
      >
        <div className="max-w-5xl mx-auto px-2 sm:px-0 overflow-x-auto rounded-3xl border border-white/[0.16] bg-[#14151b]/70 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_22px_70px_rgba(0,0,0,0.35)]">
          <table className="w-full border-collapse text-[12px] sm:text-[13px] min-w-[560px]">
            <thead>
              <tr className="border-b border-white/15 bg-white/[0.065]">
                <th className="text-left text-white/55 font-bold py-4 pl-5 pr-3 tracking-[0.08em] uppercase">항목</th>
                <th className="text-center text-white/70 font-bold py-4 px-2 w-[4.25rem] sm:w-20">무료</th>
                <th className="text-center text-white/70 font-bold py-4 px-2 w-[4.75rem] sm:w-24">라이트</th>
                <th className="text-center text-white font-bold py-4 px-2 w-[4.75rem] sm:w-24 bg-[#0064ff]/20 border-x border-[#0064ff]/25">추천</th>
                <th className="text-center text-white/70 font-bold py-4 px-2 pr-5 w-[4.75rem] sm:w-24">프로</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_GROUPS.map((group) => (
                <Fragment key={group.category}>
                  <tr className="bg-white/[0.045]">
                    <td
                      colSpan={5}
                      className="text-left text-white/55 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-[0.04em] py-2.5 pl-4 pr-3"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={`${group.category}-${row.label}`} className="border-b border-white/[0.16]">
                      <td className="text-left text-white/70 py-3 pl-4 pr-3 leading-snug">{row.label}</td>
                      <ComparisonCell value={row.free} col="free" />
                      <ComparisonCell value={row.report} col="report" />
                      <ComparisonCell value={row.standard} col="standard" />
                      <ComparisonCell value={row.pro} col="pro" />
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>


      {/* ══════════ VIP 제작 의뢰 ══════════ */}
      <Section
        eyebrow="VIP 의뢰"
        heading={
          <>
            직접 고치기 어렵다면, <span className="gradient-text-static">기획부터 제작까지</span>
            <span className="block">맡기세요</span>
          </>
        }
        sub={
          <>
            자동 진단은 문제를 찾는 도구입니다. 사이트 기획, 카피, 제작, SEO·AEO·GEO 세팅,
            세일즈 전환 최적화까지 필요하다면 별도 VIP 의뢰로 진행할 수 있습니다.
          </>
        }
      >
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#0064ff]/35 bg-[#0064ff]/[0.06] p-6 sm:p-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-white font-bold text-[22px] sm:text-[28px] tracking-tight mb-3">
                홈페이지 제작부터 검색·전환 최적화까지 한 번에
              </p>
              <p className="text-white/55 text-[14px] sm:text-[15px] leading-relaxed font-medium mb-5">
                단순 제작이 아니라 Salesscore 진단 기준을 바탕으로 검색 봇에게 발견되고, 고객에게 설득되는 구조를 설계합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {['사이트 기획', '랜딩 카피', '홈페이지 제작', 'SEO·AEO·GEO', '전환 CTA', '재진단 리포트'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/70 text-[12px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/consulting"
              className="inline-flex h-14 px-8 rounded-full bg-[#0064ff] text-white font-bold items-center justify-center whitespace-nowrap no-underline hover:brightness-110"
            >
              VIP 제작 의뢰 보기 →
            </Link>
          </div>
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
            className="text-white font-bold tracking-tight leading-[1.12] mb-6"
            style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
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
      className="relative flex flex-col rounded-3xl p-5 sm:p-7 text-left border"
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
        <span className="text-white font-black text-[30px] sm:text-[28px] tracking-tight">
          {price === 0 ? '무료' : `₩${price.toLocaleString()}`}
        </span>
        {unit && price > 0 && <span className="text-white/40 text-[13px] mb-1.5">/{unit}</span>}
      </div>
      <p className="text-white/50 text-[13px] leading-relaxed mb-6 max-w-[18em]">{description}</p>

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

function ComparisonCell({ value, col }: { value: string; col: Col }) {
  const highlight = col === 'standard';
  if (value === 'O') {
    return (
      <td className="text-center py-3 px-2">
        <Icon
          name="check"
          size={15}
          className={highlight ? 'text-[#7bd6ff] mx-auto' : 'text-white/50 mx-auto'}
        />
      </td>
    );
  }
  if (value === '×') {
    return <td className="text-center text-white/20 py-3 px-2">—</td>;
  }
  if (value === '점수') {
    return (
      <td className="text-center py-3 px-2">
        <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-white/45">
          점수
        </span>
      </td>
    );
  }
  return (
    <td className={`text-center py-3 px-2 font-semibold ${highlight ? 'text-[#7bd6ff]' : 'text-white/70'}`}>
      {value}
    </td>
  );
}
