import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { DiagnosisReport, FrameworkResult, HardCheckItem } from '../../lib/scoreEngine';
import { BarChart } from '../charts/BarChart';
import { RadarChart } from '../charts/RadarChart';
import TossCheckoutButton from '../payment/TossCheckoutButton';
import PayPalCheckoutButton from '../payment/PayPalCheckoutButton';
import { AuthModal } from '../AuthModal';
import { ShareBannerModal } from './ShareBannerModal';
import { useAuth } from '../../contexts/AuthContext';
import { saveReport } from '../../lib/firestore';
import { BRAND, PRICING } from '../../config/sellscore';
import { TOSS_PRODUCTS } from '../../lib/toss';
import { PRODUCTS as PAYPAL_PRODUCTS } from '../../lib/paypal';
import { Icon, IconBadge } from './Icon';
import { useCountUp } from '../../hooks/useCountUp';

interface ResultScreenProps {
  report: DiagnosisReport;
  /** Firestore에 리포트를 저장할 때 함께 저장한다 (재현용 answers) */
  answers?: Record<string, string>;
  /** 이미 저장된 리포트를 다시 볼 때(SavedReportPage) 전달 — 결제 시 이 리포트를 언락 대상으로 지정한다 */
  reportId?: string;
  /** 이미 저장된 리포트를 다시 볼 때, Firestore에 기록된 결제 언락 여부 */
  initialPaidUnlocked?: boolean;
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
  channel_strategy: 'share',
  expert_authority: 'shield',
};

// 프롬프트 언락 경제: 즉시 3개 무료(상호성 원칙) → 회원가입 시 +2(리드 확보) →
// 친구 초대 시 +2(바이럴 루프) → 나머지는 정식 리포트 결제로만 오픈.
// 점수가 낮은(=가장 시급한) 프레임워크부터 순서대로 배치해 "가장 아픈 곳"을 먼저 무료로 보여준다.
const FREE_COUNT = 3;
const SIGNUP_UNLOCK_COUNT = 2;
const REFERRAL_UNLOCK_COUNT = 2;

export function ResultScreen({
  report,
  answers,
  reportId,
  initialPaidUnlocked,
  onRestart,
}: ResultScreenProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(!!initialPaidUnlocked);
  const [referred, setReferred] = useState(false);
  // 새로 진단한 리포트를 저장하면 그 문서 ID를 여기 담아 결제 언락 대상으로 쓴다.
  const [newlySavedReportId, setNewlySavedReportId] = useState<string | null>(null);
  const activeReportId = reportId ?? newlySavedReportId ?? undefined;
  const reportProduct = TOSS_PRODUCTS.find((p) => p.id === PRICING.report.id)!;
  const paypalProduct = PAYPAL_PRODUCTS.find((p) => p.id === PRICING.report.id)!;
  const animatedScore = useCountUp(report.overallScore, 1100);
  const grade = GRADE_STYLE[report.grade];
  const signedUp = !!user;

  // SavedReportPage는 비동기로 Firestore에서 언락 여부를 가져와 이 prop을 나중에
  // 채워준다 — prop이 true가 되면 반영하되, 이미 이번 세션에서 언락된 걸 되돌리진 않는다.
  useEffect(() => {
    if (initialPaidUnlocked) setPaidUnlocked(true);
  }, [initialPaidUnlocked]);

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
      oneLiner: report.oneLiner,
      frameworks: report.frameworks,
      performance: report.performance ?? null,
      hardChecks: report.hardChecks,
      officialLinks: report.officialLinks,
      trafficInfra: report.trafficInfra,
      techSeoScore: report.techSeoScore,
    })
      .then((id) => setNewlySavedReportId(id))
      .catch((err) => console.error('Failed to save report:', err));
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

  // 리포트 CSV 다운로드 — 무료지만 회원가입이 필요한 리드 마그넷.
  // 잠긴 티어의 프롬프트는 화면과 동일하게 잠김 표시로 내보낸다(언락 사다리 유지).
  const handleDownloadCsv = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const isOpen = (f: FrameworkResult) =>
      tierFree.includes(f) ||
      tierSignup.includes(f) ||
      (referred && tierReferral.includes(f)) ||
      (paidUnlocked && tierPaid.includes(f));
    const esc = (v: unknown) => '"' + String(v).replace(/"/g, '""') + '"';
    const rows: unknown[][] = [
      ['도메인', report.domain, '종합점수', `${report.overallScore}/100`, '등급', report.grade],
      ['한줄 진단', report.oneLiner],
      [],
      ['프레임워크', '점수(0~10)', '현재 상태', '핵심 결함', '수정 프롬프트'],
      ...allPrompts.map((f) => [
        f.koreanName,
        f.score,
        f.currentState,
        f.flaw,
        isOpen(f) ? f.fixPrompt.copyPasteInstruction : '(잠김 — 정식 리포트에서 공개)',
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
    // BOM을 붙여야 한국어가 엑셀에서 깨지지 않는다
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `세일즈스코어_${report.domain}_${report.overallScore}점.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

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

        {/* ── 실측 성능 (Google PageSpeed) ── */}
        {report.performance && report.performance.score != null && (
          <motion.div
            className="border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 bg-white/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/55 text-[13px] tracking-[0.18em] uppercase mb-1.5 font-bold text-center sm:text-left">
              실측 성능 · Google PageSpeed
            </p>
            <p className="text-white/35 text-[12px] mb-6 text-center sm:text-left">
              추정치가 아니라 구글이 직접 측정한 모바일 기준 실측값입니다
            </p>
            {/* 구글 Lighthouse 공식 점수 4종 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <PerfStat
                label="성능 점수"
                value={`${report.performance.score}`}
                unit="/100"
                level={report.performance.score >= 90 ? 'good' : report.performance.score >= 50 ? 'warn' : 'bad'}
              />
              {report.performance.seoScore != null && (
                <PerfStat
                  label="구글 SEO 점수"
                  value={`${report.performance.seoScore}`}
                  unit="/100"
                  level={report.performance.seoScore >= 90 ? 'good' : report.performance.seoScore >= 50 ? 'warn' : 'bad'}
                />
              )}
              {report.performance.accessibilityScore != null && (
                <PerfStat
                  label="접근성 점수"
                  value={`${report.performance.accessibilityScore}`}
                  unit="/100"
                  level={report.performance.accessibilityScore >= 90 ? 'good' : report.performance.accessibilityScore >= 50 ? 'warn' : 'bad'}
                />
              )}
              {report.performance.bestPracticesScore != null && (
                <PerfStat
                  label="권장사항 준수"
                  value={`${report.performance.bestPracticesScore}`}
                  unit="/100"
                  level={report.performance.bestPracticesScore >= 90 ? 'good' : report.performance.bestPracticesScore >= 50 ? 'warn' : 'bad'}
                />
              )}
            </div>
            {/* 핵심 웹 지표 실측 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {report.performance.lcpMs != null && (
                <PerfStat
                  label="최대 콘텐츠 표시(LCP)"
                  value={(report.performance.lcpMs / 1000).toFixed(1)}
                  unit="초"
                  level={report.performance.lcpMs <= 2500 ? 'good' : report.performance.lcpMs <= 4000 ? 'warn' : 'bad'}
                />
              )}
              {report.performance.cls != null && (
                <PerfStat
                  label="화면 흔들림(CLS)"
                  value={report.performance.cls.toFixed(2)}
                  unit=""
                  level={report.performance.cls <= 0.1 ? 'good' : report.performance.cls <= 0.25 ? 'warn' : 'bad'}
                />
              )}
              {report.performance.fcpMs != null && (
                <PerfStat
                  label="첫 콘텐츠 표시(FCP)"
                  value={(report.performance.fcpMs / 1000).toFixed(1)}
                  unit="초"
                  level={report.performance.fcpMs <= 1800 ? 'good' : report.performance.fcpMs <= 3000 ? 'warn' : 'bad'}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── SEO·기술 최적화 점수: 구글/네이버 공식 기준 (AI 판단과 분리) ── */}
        {report.techSeoScore && report.hardChecks && report.hardChecks.length > 0 && (
          <motion.div
            className="border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 bg-white/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/55 text-[13px] tracking-[0.18em] uppercase mb-1.5 font-bold text-center sm:text-left">
              SEO·기술 최적화 점수
            </p>
            <p className="text-white/35 text-[12px] mb-6 text-center sm:text-left">
              AI의 판단이 아니라 구글·네이버 공식 가이드 기준 + PageSpeed 실측을 가중합산한 객관적 점수입니다
            </p>

            <div className="flex items-end gap-3 mb-7">
              <span
                className={`text-[44px] sm:text-[52px] font-black leading-none tabular-nums ${GRADE_STYLE[report.techSeoScore.grade].text}`}
              >
                {report.techSeoScore.score}
              </span>
              <span className="text-white/35 text-[16px] font-medium mb-1.5">/100</span>
              <span
                className={`text-[16px] font-bold mb-1.5 px-2.5 py-0.5 rounded-xl border ${GRADE_STYLE[report.techSeoScore.grade].text} ${GRADE_STYLE[report.techSeoScore.grade].tint}`}
              >
                {report.techSeoScore.grade}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mb-7">
              {report.techSeoScore.items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-[110px] sm:w-[160px] shrink-0 text-[12.5px] sm:text-[13px] font-semibold text-white/70 truncate">
                    {item.label}
                  </div>
                  <div className="flex-1 h-2.5 bg-white/[0.1] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${TECH_ITEM_BAR[item.status]}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.points}%` }}
                      transition={{ duration: 0.7, delay: i * 0.04, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <div className="w-[34px] shrink-0 text-right text-[13px] font-bold text-white tabular-nums">
                    {item.points}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.hardChecks.map((c) => {
                const item = report.techSeoScore!.items.find((i) => i.id === c.id);
                return (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-black ${HARD_CHECK_STYLE[c.status].badge}`}
                    >
                      {HARD_CHECK_STYLE[c.status].glyph}
                    </span>
                    <div>
                      <p className="text-white text-[14px] font-bold mb-0.5">{c.label}</p>
                      {item && (
                        <p className="text-white/35 text-[11px] font-semibold mb-1">
                          출처: {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#7bd6ff]/80 hover:text-[#7bd6ff] underline"
                            >
                              {item.source}
                            </a>
                          ) : (
                            item.source
                          )}
                        </p>
                      )}
                      <p className="text-white/55 text-[12.5px] leading-relaxed font-medium">{c.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── 마케팅 인프라 연결 상태 + 공식 등록 링크 ── */}
        {report.trafficInfra && (
          <motion.div
            className="border border-white/10 rounded-3xl p-6 sm:p-8 mb-10 bg-white/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/55 text-[13px] tracking-[0.18em] uppercase mb-1.5 font-bold text-center sm:text-left">
              마케팅 인프라 연결 상태
            </p>
            <p className="text-white/35 text-[12px] mb-6 text-center sm:text-left">
              사이트는 만들었지만 마케팅 인프라를 연결하지 않은 경우가 많습니다 — 방치되면 트래픽이 있어도 성과를
              추적할 수 없습니다
            </p>

            {report.trafficInfra.missingCount >= 3 && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 mb-5">
                <p className="text-amber-300 text-[14px] font-bold">
                  핵심 인프라 {report.trafficInfra.missingCount}개가 연결되어 있지 않습니다
                </p>
                <p className="text-white/60 text-[12.5px] mt-1 font-medium">
                  방문자가 와도 몇 명이 왔는지, 어디서 왔는지, 무엇을 했는지 전혀 알 수 없는 상태입니다.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <InfraChip label="애널리틱스" ok={report.trafficInfra.hasAnalytics} />
              <InfraChip label="네이버 서치어드바이저" ok={report.trafficInfra.naverVerified} />
              <InfraChip label="구글 서치콘솔" ok={report.trafficInfra.googleVerified} />
              <InfraChip label="SNS·채널 연결" ok={report.trafficInfra.snsChannels.length > 0} />
              <InfraChip label="연락 채널" ok={report.trafficInfra.hasContactChannel} />
            </div>

            {report.officialLinks && report.officialLinks.length > 0 && (
              <div className="border-t border-white/10 pt-5">
                <p className="text-white/50 text-[12px] font-bold mb-3 uppercase tracking-[0.08em]">
                  공식 등록 페이지로 바로 이동
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {report.officialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-semibold border transition-colors ${
                        link.recommended
                          ? 'text-[#7bd6ff] bg-[#0064ff]/10 border-[#0064ff]/25 hover:bg-[#0064ff]/20'
                          : 'text-white/50 bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

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
            12개 프레임워크 진단
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

        {/* ── 리포트 다운로드 (무료 · 회원가입 리드 마그넷) ── */}
        <div className="flex flex-col items-center gap-2 mb-14">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-semibold text-[14px] text-white/90 bg-white/[0.06] border border-white/20 cursor-pointer transition-colors hover:bg-white/[0.1]"
          >
            <Icon name="chart" size={15} className="text-[#7bd6ff]" />
            리포트 엑셀(CSV)로 다운로드
          </button>
          {!signedUp && (
            <p className="text-white/35 text-[11px]">
              무료 회원가입만 하면 바로 저장됩니다 · 결제 필요 없음
            </p>
          )}
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
                  reportId={activeReportId}
                  onError={(err) => console.error('[Toss] 결제 오류:', err)}
                />

                <div className="flex items-center gap-3 my-1">
                  <span className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-[11px] font-medium">또는</span>
                  <span className="flex-1 h-px bg-white/10" />
                </div>

                <PayPalCheckoutButton
                  product={paypalProduct}
                  reportId={activeReportId}
                  onSuccess={() => setPaidUnlocked(true)}
                  onError={(err) => console.error('[PayPal] 결제 오류:', err)}
                />
                <p className="text-white/25 text-[11px]">
                  해외 카드는 페이팔로 ${paypalProduct.price} 결제하실 수 있습니다.
                </p>
              </div>

              {/* 결제 전이라도 다음 행동이 계속 이어지도록 무료 사다리를 함께 보여준다 */}
              {(!signedUp || !referred) && (
                <div className="mt-7 pt-6 border-t border-white/[0.08] max-w-sm mx-auto flex flex-col gap-2.5">
                  {!signedUp && (
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="w-full h-11 rounded-full bg-white/[0.05] border border-white/15 text-white/85 text-[13px] font-semibold cursor-pointer transition-colors hover:bg-white/[0.09]"
                    >
                      무료 회원가입 시 추가 분석 {SIGNUP_UNLOCK_COUNT}개가 열립니다 →
                    </button>
                  )}
                  {!referred && (
                    <button
                      onClick={openShare}
                      className="w-full h-11 rounded-full bg-white/[0.05] border border-white/15 text-white/85 text-[13px] font-semibold cursor-pointer transition-colors hover:bg-white/[0.09]"
                    >
                      친구를 초대하면 더 많은 혜택을 받을 수 있습니다 →
                    </button>
                  )}
                </div>
              )}

              {import.meta.env.DEV && (
                <button
                  onClick={() => setPaidUnlocked(true)}
                  className="mt-5 text-white/25 text-[11px] underline bg-transparent border-none cursor-pointer"
                >
                  (개발 미리보기) 전체 잠금 해제된 화면 보기
                </button>
              )}
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

const HARD_CHECK_STYLE: Record<HardCheckItem['status'], { badge: string; glyph: string }> = {
  pass: { badge: 'bg-emerald-400/15 text-emerald-300', glyph: '✓' },
  warn: { badge: 'bg-amber-400/15 text-amber-300', glyph: '!' },
  fail: { badge: 'bg-rose-400/15 text-rose-300', glyph: '✕' },
};

const TECH_ITEM_BAR: Record<HardCheckItem['status'], string> = {
  pass: 'bg-emerald-400',
  warn: 'bg-amber-400',
  fail: 'bg-rose-400',
};

function InfraChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-center ${
        ok ? 'border-emerald-400/20 bg-emerald-400/[0.05]' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <p className={`text-[12px] font-bold ${ok ? 'text-emerald-300' : 'text-white/40'}`}>
        {ok ? '연결됨' : '미연결'}
      </p>
      <p className="text-white/55 text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );
}

const PERF_LEVEL_STYLE = {
  good: 'text-emerald-300',
  warn: 'text-amber-300',
  bad: 'text-rose-300',
} as const;

function PerfStat({
  label,
  value,
  unit,
  level,
}: {
  label: string;
  value: string;
  unit: string;
  level: keyof typeof PERF_LEVEL_STYLE;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
      <p className={`text-[22px] font-black leading-tight tabular-nums ${PERF_LEVEL_STYLE[level]}`}>
        {value}
        <span className="text-[13px] font-semibold text-white/40 ml-0.5">{unit}</span>
      </p>
      <p className="text-white/50 text-[11px] font-semibold mt-1.5">{label}</p>
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
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(framework.fixPrompt.copyPasteInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div
      className={`relative rounded-3xl p-6 overflow-hidden bg-white/[0.02] border-2 ${
        open ? 'border-white/10' : 'border-white/20'
      }`}
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
        <p className="text-white/50 text-[14px] mb-1">
          근거: <strong className="text-white/70 font-semibold">{framework.evidence}</strong>
        </p>
        {framework.master && (
          <p className="text-[#7bd6ff]/70 text-[12.5px] leading-relaxed mb-4">
            📖 {framework.master.name}
            {framework.master.book && ` · 『${framework.master.book}』`} — {framework.master.theory}
          </p>
        )}
        {!framework.master && <div className="mb-4" />}
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
          <div className="flex items-center justify-between mb-2 mt-1">
            <span className="text-white/40 text-[11px] font-bold tracking-[0.08em] uppercase">
              Claude · Cursor · Codex에 붙여넣기
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1.5 border cursor-pointer transition-colors ${
                copied
                  ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25'
                  : 'text-[#7bd6ff] bg-[#0064ff]/10 border-[#0064ff]/25 hover:bg-[#0064ff]/20'
              }`}
            >
              {copied && <Icon name="check" size={12} />}
              {copied ? '복사됨' : '복사하기'}
            </button>
          </div>
          <p className="text-white/60 text-[13px] font-mono bg-black/40 border border-white/[0.06] rounded-lg p-3.5 leading-relaxed whitespace-pre-line">
            {framework.fixPrompt.copyPasteInstruction}
          </p>
        </div>
      </div>

      {!open && (
        <button
          onClick={onLockedClick}
          disabled={!onLockedClick}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-[3px] border-none cursor-pointer disabled:cursor-default p-0"
          aria-label="잠긴 프롬프트"
        >
          <div
            className="w-20 h-20 rounded-3xl bg-white/[0.08] border-2 border-white/30 flex items-center justify-center"
            style={{ boxShadow: '0 0 32px rgba(255,255,255,0.12)' }}
          >
            <Icon name="lock" size={36} className="text-white" />
          </div>
          <span className="text-white text-[14px] font-bold">잠김 · 결제 후 열람</span>
        </button>
      )}
    </motion.div>
  );
}
