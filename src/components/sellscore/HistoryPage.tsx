import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../AuthModal';
import { ShareBannerModal } from './ShareBannerModal';
import {
  getUserReports,
  getReferralCount,
  type SavedReport,
} from '../../lib/firestore';
import { buildReferralLink, getReferralCode } from '../../lib/shareBanner';
import { useSeo } from '../../hooks/useSeo';
import { Icon, IconBadge } from './Icon';

const GRADE_TINT: Record<string, string> = {
  S: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/25',
  A: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/25',
  B: 'text-amber-300 bg-amber-400/12 border-amber-400/25',
  C: 'text-orange-300 bg-orange-400/12 border-orange-400/25',
  D: 'text-rose-300 bg-rose-400/12 border-rose-400/25',
};

function formatDate(ts: SavedReport['createdAt']): string {
  if (!ts || typeof (ts as any).toDate !== 'function') return '방금 전';
  const d = (ts as any).toDate() as Date;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function toMillis(ts: SavedReport['createdAt']): number {
  if (ts && typeof (ts as any).toMillis === 'function') return (ts as any).toMillis();
  return 0;
}

// ── 같은 도메인을 여러 번 진단한 경우 첫 진단과 최근 진단 점수를 비교한다.
// 이미 저장된 점수끼리 비교만 하므로 AI 재호출이 없다 — 추가 비용 0원.
interface DomainProgress {
  domain: string;
  firstScore: number;
  latestScore: number;
  delta: number;
  firstDate: SavedReport['createdAt'];
  latestDate: SavedReport['createdAt'];
  latestReportId: string;
  diagnoseCount: number;
}

function computeDomainProgress(reports: SavedReport[]): DomainProgress[] {
  const byDomain = new Map<string, SavedReport[]>();
  for (const r of reports) {
    const list = byDomain.get(r.domain) ?? [];
    list.push(r);
    byDomain.set(r.domain, list);
  }

  const progress: DomainProgress[] = [];
  for (const [domain, list] of byDomain) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    progress.push({
      domain,
      firstScore: Math.round(first.overallScore),
      latestScore: Math.round(latest.overallScore),
      delta: Math.round(latest.overallScore) - Math.round(first.overallScore),
      firstDate: first.createdAt,
      latestDate: latest.createdAt,
      latestReportId: latest.id,
      diagnoseCount: list.length,
    });
  }

  return progress.sort((a, b) => b.delta - a.delta);
}

export function HistoryPage() {
  useSeo({
    title: '내 진단 내역 — 세일즈스코어',
    description: '지금까지 진단한 사이트 목록과 친구 초대 현황을 확인하세요.',
  });

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[] | null>(null);
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserReports(user.uid).then(setReports).catch(() => setReports([]));
    getReferralCount(user.uid).then(setReferralCount).catch(() => setReferralCount(0));
  }, [user]);

  const referralLink = user ? buildReferralLink(getReferralCode(user.uid)) : '';
  const domainProgress = useMemo(() => computeDomainProgress(reports ?? []), [reports]);

  if (!authLoading && !user) {
    return (
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
        <IconBadge name="users" tint="blue" size="lg" />
        <p className="text-white text-[19px] font-bold mt-5 mb-2">로그인이 필요합니다</p>
        <p className="text-white/45 text-[14px] mb-7 max-w-sm">
          로그인하면 지금까지 진단한 사이트 내역과 친구 초대 현황을 확인할 수 있어요.
        </p>
        <button
          onClick={() => setAuthOpen(true)}
          className="h-12 px-7 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 transition-colors cursor-pointer border-none"
        >
          로그인 / 회원가입
        </button>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </section>
    );
  }

  return (
    <section className="relative min-h-[100dvh] px-4 sm:px-6 pt-28 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-white/45 text-[12px] tracking-[0.18em] uppercase mb-2 font-semibold">
          MY SELLSCORE
        </p>
        <h1 className="text-white font-bold text-[26px] sm:text-[30px] tracking-[-0.02em] mb-10">
          내 진단 내역
        </h1>

        {/* 개선 추이 — 같은 사이트를 재진단했을 때 점수가 얼마나 올랐는지 */}
        {domainProgress.length > 0 && (
          <div className="mb-10">
            <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold">
              개선 추이
            </p>
            <div className="flex flex-col gap-3">
              {domainProgress.map((p, i) => {
                const improved = p.delta > 0;
                const unchanged = p.delta === 0;
                return (
                  <motion.button
                    key={p.domain}
                    onClick={() => navigate(`/diagnose/report/${p.latestReportId}`)}
                    className="text-left rounded-2xl border p-5 sm:p-6 cursor-pointer transition-colors"
                    style={{
                      borderColor: improved ? 'rgba(48,209,88,0.3)' : 'rgba(255,255,255,0.1)',
                      background: improved ? 'rgba(48,209,88,0.06)' : 'rgba(255,255,255,0.02)',
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <p className="text-white font-bold text-[14px] truncate">{p.domain}</p>
                      <span
                        className={`text-[13px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                          improved
                            ? 'text-emerald-300 bg-emerald-400/12'
                            : unchanged
                              ? 'text-white/50 bg-white/[0.06]'
                              : 'text-rose-300 bg-rose-400/12'
                        }`}
                      >
                        {improved ? '+' : ''}
                        {p.delta}점
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-white/40 text-[20px] font-extrabold tabular-nums">
                        {p.firstScore}
                      </span>
                      <span className="text-white/20 text-[16px]">→</span>
                      <span className="text-white text-[20px] font-extrabold tabular-nums">
                        {p.latestScore}
                      </span>
                      <span className="text-white/30 text-[12px] font-medium ml-1">/100</span>
                    </div>
                    <p className="text-white/30 text-[11px] mt-2">
                      {formatDate(p.firstDate)} → {formatDate(p.latestDate)} · 총 {p.diagnoseCount}회 진단
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* 리퍼럴 요약 카드 */}
        <motion.div
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <IconBadge name="share" tint="blue" size="sm" />
              <div>
                <p className="text-white font-bold text-[15px] leading-tight">친구 초대 현황</p>
                <p className="text-white/40 text-[12px] mt-0.5">
                  내 링크로 가입한 친구 수
                </p>
              </div>
            </div>
            <p className="text-white text-[28px] font-extrabold tabular-nums">
              {referralCount ?? '–'}
              <span className="text-white/30 text-[13px] font-medium ml-1">명</span>
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 mb-4">
            <span className="text-white/50 text-[12px] truncate flex-1 font-mono">
              {referralLink}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('링크가 복사되었습니다.');
              }}
              className="shrink-0 text-[#7bd6ff] text-[12px] font-bold bg-transparent border-none cursor-pointer"
            >
              복사
            </button>
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="w-full h-11 rounded-xl bg-white text-black font-bold text-[13px] hover:bg-white/90 transition-colors cursor-pointer border-none"
          >
            공유 배너 만들기
          </button>
        </motion.div>

        {/* 진단 내역 리스트 */}
        <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold">
          진단한 사이트 {reports ? `· ${reports.length}건` : ''}
        </p>

        {reports === null && (
          <p className="text-white/30 text-[13px] py-10 text-center">불러오는 중…</p>
        )}

        {reports?.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-white/50 text-[13px] mb-4">아직 진단한 사이트가 없습니다.</p>
            <button
              onClick={() => navigate('/diagnose')}
              className="h-10 px-5 rounded-full bg-white/10 text-white/85 text-[13px] font-medium border-none cursor-pointer hover:bg-white/15 transition-colors"
            >
              지금 무료로 진단받기
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {reports?.map((r, i) => (
            <motion.button
              key={r.id}
              onClick={() => navigate(`/diagnose/report/${r.id}`)}
              className="text-left rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.045] transition-colors cursor-pointer flex items-center justify-between gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className="min-w-0">
                <p className="text-white font-bold text-[14px] truncate mb-1">{r.domain}</p>
                <p className="text-white/35 text-[12px]">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-white text-[18px] font-extrabold tabular-nums">
                  {Math.round(r.overallScore)}
                  <span className="text-white/30 text-[11px] font-medium">/100</span>
                </span>
                <span
                  className={`text-[13px] font-bold px-2.5 py-1 rounded-lg border ${GRADE_TINT[r.grade]}`}
                >
                  {r.grade}
                </span>
                <Icon name="share" size={14} className="text-white/20 rotate-90" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <ShareBannerModal isOpen={shareOpen} onClose={() => setShareOpen(false)} onShared={() => {}} />
    </section>
  );
}
