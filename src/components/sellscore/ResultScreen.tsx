import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { DiagnosisReport, FrameworkResult } from '../../lib/scoreEngine';
import { BarChart } from '../charts/BarChart';
import { RadarChart } from '../charts/RadarChart';
import TossCheckoutButton from '../payment/TossCheckoutButton';
import { AuthModal } from '../AuthModal';
import { ShareBannerModal } from './ShareBannerModal';
import { useAuth } from '../../contexts/AuthContext';
import { saveReport } from '../../lib/firestore';
import { BRAND, PRICING } from '../../config/sellscore';
import { TOSS_PRODUCTS } from '../../lib/toss';
import { Icon, IconBadge } from './Icon';
import { useCountUp } from '../../hooks/useCountUp';

interface ResultScreenProps {
  report: DiagnosisReport;
  /** Firestore에 리포트를 저장할 때 재계산용으로 함께 저장한다 (answers만 있으면 언제든 동일 리포트 재현 가능) */
  answers?: Record<string, string>;
  onRestart: () => void;
}

const GRADE_STYLE: Record<DiagnosisReport['grade'], { text: string; tint: string }> = {
  S: { text: 'text-emerald-300', tint: 'bg-emerald-400/12 border-emerald-400/25' },
  A: { text: 'text-emerald-300', tint: 'bg-emerald-400/12 border-emerald-400/25' },
  B: { text: 'text-amber-300', tint: 'bg-amber-400/12 border-amber-400/25' },
  C: { text: 'text-orange-300', tint: 'bg-orange-400/12 border-orange-400/25' },
  D: { text: 'text-rose-300', tint: 'bg-rose-400/12 border-rose-400/25' },
};

const FRAMEWORK_ICON: Record<string, Parameters<typeof Icon>[0]['name']> = {
  preeminence: 'shield',
  value_ladder: 'target',
  sideways: 'spark',
  positioning: 'search',
  results_in_advance: 'check',
  attention_rhythm: 'chart',
  seo_infra: 'search',
  emotional_momentum: 'users',
  challenge_funnel: 'clock',
  pricing_ltv: 'chart',
};

// 프롬프트 언락 경제: 즉시 3개 무료(상호성 원칙) → 회원가입 시 +2(리드 확보) →
// 친구 초대 시 +2(바이럴 루프) → 나머지는 정식 리포트 결제로만 오픈.
// 점수가 낮은(=가장 시급한) 프레임워크부터 순서대로 배치해 "가장 아픈 곳"을 먼저 무료로 보여준다.
const FREE_COUNT = 3;
const SIGNUP_UNLOCK_COUNT = 2;
const REFERRAL_UNLOCK_COUNT = 2;

export function ResultScreen({ report, answers, onRestart }: ResultScreenProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const [referred, setReferred] = useState(false);
  const reportProduct = TOSS_PRODUCTS.find((p) => p.id === PRICING.report.id)!;
  const animatedScore = useCountUp(report.overallScore, 1100);
  const grade = GRADE_STYLE[report.grade];
  const signedUp = !!user;

  // 로그인된 상태로 진단이 끝나면(또는 진단 도중 로그인하면) 리포트를 1회만 저장한다.
  const savedRef = useRef(false);
  useEffect(() => {
    if (!user || !answers || savedRef.current) return;
    savedRef.current = true;
    saveReport({
      userId: user.uid,
      domain: report.domain,
      answers,
      overallScore: report.overallScore,
      grade: report.grade,
    }).catch((err) => console.error('Failed to save report:', err));
  }, [user, answers, report]);

  const allPrompts = useMemo(
    () => [...report.frameworks].sort((a, b) => a.score - b.score),
    [report.frameworks]
  );

  const tierFree = allPrompts.slice(0, FREE_COUNT);
  const tierSignup = allPrompts.slice(FREE_COUNT, FREE_COUNT + SIGNUP_UNLOCK_COUNT);
  const tierReferral = allPrompts.slice(
    FREE_COUNT + SIGNUP_UNLOCK_COUNT,
    FREE_COUNT + SIGNUP_UNLOCK_COUNT + REFERRAL_UNLOCK_COUNT
  );
  const tierPaid = allPrompts.slice(FREE_COUNT + SIGNUP_UNLOCK_COUNT + REFERRAL_UNLOCK_COUNT);

  const strengths = report.frameworks.filter((f) => f.isStrength).slice(0, 3);
  const risks = [...report.frameworks.filter((f) => !f.isStrength)].sort((a, b) => a.score - b.score);

  const openShare = () => setShareOpen(true);

  return (
    <section className="relative min-h-[100dvh] px-4 sm:px-6 pt-28 pb-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 30% at 50% 8%, rgba(0,100,255,0.14), transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* ── 헤드라인 스코어 ── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-white/55 text-[14px] tracking-[0.2em] uppercase mb-5 font-bold">
            {report.domain}
          </p>
          <div className="flex items-end justify-center gap-3 mb-3">
            <span
              className="font-extrabold tracking-tight leading-none tabular-nums"
              style={{
                fontSize: 'clamp(64px, 15vw, 116px)',
                backgroundImage: 'linear-gradient(160deg, #ffffff, #a9c8ff 70%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {animatedScore}
            </span>
            <span className="text-white/35 text-[20px] sm:text-[24px] mb-3 font-medium">/100</span>
            <span
              className={`text-[22px] sm:text-[28px] font-bold mb-3 px-3.5 py-1 rounded-2xl border ${grade.text} ${grade.tint}`}
            >
              {report.grade}
            </span>
          </div>
          <p className="text-white/55 text-[15px] tracking-[0.15em] uppercase mb-7 font-bold">
            설득 전환 지수
          </p>
          <p className="text-white/85 text-[17px] sm:text-[19px] max-w-lg mx-auto leading-relaxed font-bold">
            {report.oneLiner}
          </p>
        </motion.div>

        {/* ── 트래픽 스냅샷 ── */}
        <motion.div
          className="border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 bg-white/[0.02]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/55 text-[13px] tracking-[0.18em] uppercase mb-6 font-bold text-center sm:text-left">
            트래픽 스냅샷 {report.traffic.isEstimate && '(추정치)'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <SnapshotStat icon="users" label="월 방문자" value={report.traffic.monthlyVisitors} />
            <SnapshotStat icon="chart" label="이탈률" value={report.traffic.bounceRate} />
            <SnapshotStat icon="clock" label="평균 체류시간" value={report.traffic.avgSessionTime} />
          </div>
          <p className="text-white/65 text-[15px] leading-relaxed border-t border-white/10 pt-5 font-medium">
            {report.traffic.insight}
          </p>
        </motion.div>

        {/* ── 차트 ── */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/55 text-[13px] tracking-[0.18em] uppercase mb-6 font-bold text-center">
            10개 프레임워크 진단
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-white/10 rounded-3xl p-6 sm:p-8 bg-white/[0.02]">
            <BarChart items={report.frameworks.map((f) => ({ label: f.koreanName, score: f.score }))} />
            <RadarChart
              items={report.frameworks.map((f) => ({ label: f.koreanName, score: f.score }))}
            />
          </div>
        </motion.div>

        {/* ══════════ 1. 잘하고 계신 부분 (칭찬) ══════════ */}
        <SectionHeading tint="emerald" title="잘하고 계신 부분" sub="컨설턴트가 먼저 짚어드리는 강점입니다" />
        <div className="flex flex-col gap-3 mb-14">
          {strengths.length > 0 ? (
            strengths.map((f, i) => (
              <motion.div
                key={f.id}
                className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex items-start gap-3">
                  <IconBadge name={FRAMEWORK_ICON[f.id] ?? 'check'} tint="emerald" size="sm" />
                  <div className="flex-1">
                    <p className="text-white font-bold text-[16px] mb-1">
                      {f.koreanName}{' '}
                      <span className="text-emerald-300/90 text-[14px] font-bold">
                        {f.score.toFixed(1)}/10
                      </span>
                    </p>
                    <p className="text-white/70 text-[15px] leading-relaxed mb-1.5 font-medium">{f.narrative}</p>
                    <p className="text-emerald-300/70 text-[13px] font-mono font-semibold">
                      → <strong className="font-bold">{f.technique}</strong> 기법이 적용되어 있습니다
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-white/50 text-[13px]">
              아직 뚜렷한 강점보다는 개선 여지가 더 많은 사이트입니다. 아래 위험 요소부터 먼저
              확인해주세요.
            </div>
          )}
        </div>

        {/* ══════════ 2. 지금 당장 위험한 부분 ══════════ */}
        <SectionHeading
          tint="rose"
          title="지금 당장 위험한 부분"
          sub="방치하면 노출과 판매에 직접 영향을 줍니다"
        />
        <div className="flex flex-col gap-3 mb-14">
          {risks.slice(0, 5).map((f, i) => (
            <motion.div
              key={f.id}
              className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="flex items-start gap-3">
                <IconBadge name={FRAMEWORK_ICON[f.id] ?? 'clock'} tint="rose" size="sm" />
                <div className="flex-1">
                  <p className="text-white font-bold text-[16px] mb-1">
                    {f.koreanName}{' '}
                    <span className="text-rose-300/90 text-[14px] font-bold">
                      {f.score.toFixed(1)}/10
                    </span>
                  </p>
                  <p className="text-white/70 text-[15px] leading-relaxed mb-1.5 font-semibold">{f.flaw}</p>
                  <p className="text-rose-300/80 text-[13px] leading-relaxed font-medium">⚠ {f.narrative}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ══════════ 3. 수정할 것 — 실행 프롬프트 ══════════ */}
        <SectionHeading
          tint="blue"
          title="무엇을 고쳐야 할까요"
          sub="Claude Code · Cursor · GPT에 그대로 붙여넣는 실행 프롬프트입니다"
        />

        {/* 단계 1 — 즉시 무료 (상호성 원칙: 먼저 가치를 준다) */}
        <p className="text-white/60 text-[13px] tracking-[0.1em] uppercase mb-4 font-bold">
          가장 시급한 문제 {FREE_COUNT}개 · 지금 바로 무료 공개
        </p>
        <div className="flex flex-col gap-4 mb-9">
          {tierFree.map((f, i) => (
            <PromptCard key={f.id} framework={f} index={i} open />
          ))}
        </div>

        {/* 단계 2 — 회원가입 시 오픈 (리드 수집) */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-white/60 text-[13px] tracking-[0.1em] uppercase font-bold">
            무료 회원가입하면 {SIGNUP_UNLOCK_COUNT}개 더 열립니다
          </p>
          {!signedUp && (
            <button
              onClick={() => setAuthOpen(true)}
              className="shrink-0 text-[#7bd6ff] text-[12px] font-bold bg-transparent border-none cursor-pointer whitespace-nowrap"
            >
              무료 회원가입 →
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 mb-9">
          {tierSignup.map((f, i) => (
            <PromptCard
              key={f.id}
              framework={f}
              index={FREE_COUNT + i}
              open={signedUp}
              onLockedClick={() => setAuthOpen(true)}
            />
          ))}
        </div>

        {/* 단계 3 — 친구 초대 시 오픈 (바이럴 루프) */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-white/60 text-[13px] tracking-[0.1em] uppercase font-bold">
            친구에게 진단을 추천하면 {REFERRAL_UNLOCK_COUNT}개 더 열립니다
          </p>
          {!referred && (
            <button
              onClick={openShare}
              className="shrink-0 text-[#7bd6ff] text-[12px] font-bold bg-transparent border-none cursor-pointer whitespace-nowrap"
            >
              공유하고 열기 →
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 mb-9">
          {tierReferral.map((f, i) => (
            <PromptCard
              key={f.id}
              framework={f}
              index={FREE_COUNT + SIGNUP_UNLOCK_COUNT + i}
              open={referred}
              onLockedClick={openShare}
            />
          ))}
        </div>

        {/* 단계 4 — 결제 전용 (핵심 프롬프트) */}
        <p className="text-white/60 text-[13px] tracking-[0.1em] uppercase mb-4 font-bold">
          정식 리포트 결제 시 나머지 {tierPaid.length}개 오픈
        </p>
        <div className="flex flex-col gap-4 mb-6">
          {tierPaid.map((f, i) => (
            <PromptCard
              key={f.id}
              framework={f}
              index={FREE_COUNT + SIGNUP_UNLOCK_COUNT + REFERRAL_UNLOCK_COUNT + i}
              open={paidUnlocked}
            />
          ))}
        </div>

        {/* ── 결제 CTA ── */}
        {!paidUnlocked && (
          <motion.div
            className="relative rounded-3xl p-[1px] mb-14 overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,100,255,0.5), rgba(123,214,255,0.15), rgba(163,137,255,0.4))',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl bg-[#050507] px-6 sm:px-8 py-8 sm:py-10 text-center">
              <IconBadge name="unlock" tint="blue" />
              <p className="text-white text-[19px] sm:text-[21px] font-black mt-4 mb-2 leading-snug">
                핵심 프롬프트 {tierPaid.length}개는
                <br className="hidden sm:block" /> 정식 리포트에서 바로 열립니다
              </p>
              <p className="text-white/60 text-[15px] mb-7 font-semibold">
                <strong className="text-white font-bold">
                  {reportProduct.price.toLocaleString()}원
                </strong>{' '}
                결제 시 전체 즉시 오픈 · 개선 후 30일 내 재진단 무료
              </p>
              <div className="max-w-sm mx-auto flex flex-col gap-3">
                <TossCheckoutButton
                  product={reportProduct}
                  onError={(err) => console.error('[Toss] 결제 오류:', err)}
                />
              </div>
              <button
                onClick={() => setPaidUnlocked(true)}
                className="mt-5 text-white/25 text-[11px] underline bg-transparent border-none cursor-pointer"
              >
                (개발 미리보기) 전체 잠금 해제된 화면 보기
              </button>
            </div>
          </motion.div>
        )}

        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        <ShareBannerModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          data={{ domain: report.domain, score: report.overallScore, grade: report.grade }}
          onShared={() => setReferred(true)}
        />

        {/* ── 하단 액션 ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${BRAND.name} 진단 결과`,
                  text: `${report.domain} 설득 전환 지수: ${report.overallScore}/100 (${report.grade}등급)`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 복사되었습니다.');
              }
            }}
            className="h-12 px-6 rounded-full border border-white/15 text-white/70 text-[13px] font-medium hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="share" size={15} />
            결과 공유하기
          </button>
          <button
            onClick={onRestart}
            className="h-12 px-6 rounded-full border border-white/15 text-white/70 text-[13px] font-medium hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="refresh" size={15} />
            다른 사이트 진단하기
          </button>
        </div>

        <p className="text-white/25 text-[11px] text-center max-w-md mx-auto leading-relaxed">
          {BRAND.footerNote}
        </p>
      </div>
    </section>
  );
}

function SectionHeading({
  tint,
  title,
  sub,
}: {
  tint: 'emerald' | 'rose' | 'blue';
  title: string;
  sub: string;
}) {
  const color = tint === 'emerald' ? 'text-emerald-300' : tint === 'rose' ? 'text-rose-300' : 'text-[#7bd6ff]';
  return (
    <div className="text-center mb-6">
      <p className={`${color} text-[14px] tracking-[0.18em] uppercase mb-2 font-black`}>{title}</p>
      <p className="text-white/55 text-[14px] font-medium">{sub}</p>
    </div>
  );
}

function SnapshotStat({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <IconBadge name={icon} tint="blue" size="sm" />
      <div>
        <p className="text-white text-[17px] sm:text-[18px] font-black leading-tight">{value}</p>
        <p className="text-white/55 text-[13px] font-semibold">{label}</p>
      </div>
    </div>
  );
}

function PromptCard({
  framework,
  index,
  open,
  onLockedClick,
}: {
  framework: FrameworkResult;
  index: number;
  open: boolean;
  onLockedClick?: () => void;
}) {
  return (
    <motion.div
      className="relative border border-white/10 rounded-3xl p-6 overflow-hidden bg-white/[0.02]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.03 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <IconBadge name={FRAMEWORK_ICON[framework.id] ?? 'spark'} tint="blue" />
          <div>
            <p className="text-white/45 text-[12px] tracking-[0.1em] uppercase mb-0.5 font-bold">
              {framework.promptCategory === 'seo' ? 'SEO / GEO' : '세일즈 구조'} ·{' '}
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="text-white text-[17px] sm:text-[18px] font-black">{framework.koreanName}</p>
          </div>
        </div>
        <span className="text-white text-[21px] font-black shrink-0 ml-4 tabular-nums">
          {framework.score.toFixed(1)}
          <span className="text-white/40 text-[14px] font-semibold">/10</span>
        </span>
      </div>

      <div className={open ? '' : 'blur-sm select-none pointer-events-none'}>
        <p className="text-white/75 text-[15px] leading-relaxed mb-2 font-medium">{framework.currentState}</p>
        <p className="text-white/50 text-[14px] mb-4">
          근거: <strong className="text-white/70 font-semibold">{framework.evidence}</strong>
        </p>
        <div className="bg-white/[0.04] rounded-2xl p-4">
          <p className="text-rose-300/90 text-[14px] mb-3 font-bold">결함: {framework.flaw}</p>
          <p className="text-white/60 text-[14px] mb-1 font-medium">
            현재 → <span className="text-white/90 font-bold">{framework.fixPrompt.current}</span>
          </p>
          <p className="text-white/60 text-[14px] mb-3 font-medium">
            목표 → <span className="text-emerald-300 font-bold">{framework.fixPrompt.target}</span>
          </p>
          <ul className="flex flex-col gap-1.5 mb-3">
            {framework.fixPrompt.alternatives.map((alt) => (
              <li key={alt} className="text-white/55 text-[13px] font-medium pl-3 relative">
                <span className="absolute left-0">·</span>
                {alt}
              </li>
            ))}
          </ul>
          <p className="text-white/40 text-[13px] font-mono bg-black/40 rounded-lg p-3 leading-relaxed">
            {framework.fixPrompt.copyPasteInstruction}
          </p>
        </div>
      </div>

      {!open && (
        <button
          onClick={onLockedClick}
          disabled={!onLockedClick}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] border-none cursor-pointer disabled:cursor-default p-0"
          aria-label="잠긴 프롬프트"
        >
          <IconBadge name="lock" tint="neutral" size="lg" />
        </button>
      )}
    </motion.div>
  );
}
