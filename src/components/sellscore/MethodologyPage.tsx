import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Section, Em } from './Section';
import { Icon, IconBadge } from './Icon';
import { BarChart } from '../charts/BarChart';
import { RadarChart } from '../charts/RadarChart';
import { AlgorithmFlow } from './AlgorithmFlow';
import { FloatingFormulaOrb } from './FloatingFormulaOrb';
import { LOADING_FRAMEWORK_NAMES } from '../../config/sellscore';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

const PIPELINE_STEPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'search', title: '수집', desc: '입력한 URL의 공개 페이지 텍스트와 구조를 가져옵니다.' },
  { icon: 'spark', title: '대조', desc: '10개 설득 프레임워크 기준과 하나씩 대조합니다.' },
  { icon: 'chart', title: '채점', desc: '항목별 0~10점을 매기고 가중 평균으로 종합 점수를 냅니다.' },
  { icon: 'check', title: '등급 산정', desc: '100점 기준 S/A/B/C/D 등급과 근거 문장을 붙입니다.' },
];

const GRADE_TABLE: { grade: string; range: string; pct: number; color: string; bar: string }[] = [
  { grade: 'S', range: '90 ~ 100점', pct: 10, color: 'text-emerald-300', bar: 'bg-emerald-300' },
  { grade: 'A', range: '75 ~ 89점', pct: 15, color: 'text-emerald-400', bar: 'bg-emerald-400/80' },
  { grade: 'B', range: '60 ~ 74점', pct: 15, color: 'text-amber-300', bar: 'bg-amber-300' },
  { grade: 'C', range: '45 ~ 59점', pct: 15, color: 'text-orange-300', bar: 'bg-orange-300' },
  { grade: 'D', range: '45점 미만', pct: 45, color: 'text-rose-300', bar: 'bg-rose-400' },
];

const STANDARDS: { icon: IconName; name: string; desc: string }[] = [
  { icon: 'shield', name: 'WCAG 2.2', desc: '색상 대비, 최소 폰트 크기 등 접근성 기준' },
  { icon: 'search', name: 'Google Search Essentials', desc: '검색 크롤링·색인 공식 가이드' },
  { icon: 'check', name: '네이버 서치어드바이저', desc: '한국 검색 환경 최적화 가이드' },
];

const SAMPLE_FRAMEWORK_SCORES = [6.7, 3.7, 7.8, 8.6, 4.1, 3.8, 6.0, 7.8, 6.7, 5.4];

const FRAMEWORK_DETAILS: { focus: string; weight: number }[] = [
  { focus: '전문성 신호와 환불·보장 문구', weight: 12 },
  { focus: '상품 단계 구성과 첫 문장 후킹력', weight: 11 },
  { focus: '직접 설득 대신 스토리로 유도하는 흐름', weight: 8 },
  { focus: '차별화 포지셔닝과 즉시 반응 유도 문구', weight: 11 },
  { focus: '구매 전 가치를 먼저 체감시키는 장치', weight: 9 },
  { focus: '스크롤 흐름과 정보 밀도 배분', weight: 8 },
  { focus: '메타데이터·구조화 데이터·크롤링 최적화', weight: 10 },
  { focus: '감정 곡선 설계와 숫자 근거 제시', weight: 9 },
  { focus: '한정성·마감 요소의 설득력', weight: 10 },
  { focus: '가격 앵커링과 재구매 유도 구조', weight: 12 },
];

const SEGMENT_COLORS = ['#0064ff', '#5b9bff', '#7bd6ff', '#a389ff', '#00c2a8'];

export function MethodologyPage() {
  const navigate = useNavigate();
  const goDiagnose = () => navigate('/diagnose');

  const barItems = LOADING_FRAMEWORK_NAMES.map((name, i) => ({
    label: name,
    score: SAMPLE_FRAMEWORK_SCORES[i],
  }));

  const weightedItems = LOADING_FRAMEWORK_NAMES.map((name, i) => ({
    name,
    focus: FRAMEWORK_DETAILS[i].focus,
    weight: FRAMEWORK_DETAILS[i].weight,
  }));

  return (
    <div>
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[56dvh] sm:min-h-[62dvh] flex flex-col items-center justify-center px-6 pt-28 pb-16 sm:pb-20 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 45% at 50% 15%, rgba(0,100,255,0.16), transparent 70%)',
          }}
        />
        <motion.div
          className="relative z-10 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/45 text-[12px] tracking-[0.3em] uppercase mb-6 font-semibold">
            채점 원리
          </p>
          <h1
            className="text-white font-black leading-[1.1] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(32px, 6.8vw, 66px)' }}
          >
            <span className="block mx-auto max-w-[8em]">설득 전환 지수는</span>
            <span className="block gradient-text-static">어떻게 계산되나요?</span>
          </h1>
          <p className="text-white/60 text-[18px] sm:text-[21px] leading-[1.7] max-w-lg mx-auto mb-8">
            핵심 채점 로직은 공개하지 않지만, <Em>어떤 기준으로 어떤 단계를 거쳐</Em> 점수가
            나오는지는 전부 투명하게 보여드립니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {['10개 프레임워크 교차 채점', '공식 가이드 기준 인용', '동일 URL 재현 가능'].map((t) => (
              <span
                key={t}
                className="text-white/50 text-[11px] font-medium flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5"
              >
                <Icon name="check" size={11} className="text-[#5b9bff]" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════ AI 채점 엔진 ══════════ */}
      <Section
        eyebrow="AI 채점 엔진"
        heading={
          <>
            10개 프레임워크를 <span className="gradient-text-static">동시에 대조</span>하는
            가중합 모델입니다
          </>
        }
        sub={
          <>
            각 프레임워크 점수(0~10점)에 사전 정의된 <Em>가중치</Em>를 곱해 더한 뒤{' '}
            <Em>100점 만점</Em>으로 환산합니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center max-w-4xl mx-auto">
          <div className="flex justify-center shrink-0">
            <FloatingFormulaOrb size={220} />
          </div>
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 mb-6 font-mono text-[13px] sm:text-[14px] text-white/80 overflow-x-auto whitespace-nowrap">
              종합 점수 = <span className="text-[#7bd6ff]">Σ</span> ( 프레임워크 점수ᵢ ×{' '}
              <span className="text-[#a389ff]">가중치ᵢ</span> ) × 10
            </div>
            <p className="text-white/40 text-[11px] tracking-[0.1em] uppercase mb-2.5 font-semibold">
              프레임워크별 가중치 분포
            </p>
            <div className="h-3 rounded-full overflow-hidden flex w-full">
              {weightedItems.map((w, i) => (
                <motion.div
                  key={w.name}
                  style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${w.weight}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                  className="h-full"
                />
              ))}
            </div>
            <p className="text-white/30 text-[11px] mt-3 leading-relaxed">
              가중치는 소상공인·1인 창업가 사이트에서 실제 이탈로 이어지는 빈도가 높은
              항목일수록 높게 설정되어 있습니다.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════ 파이프라인 다이어그램 ══════════ */}
      <Section
        eyebrow="처리 과정"
        heading={
          <>
            <span className="gradient-text-static">4단계</span>로 채점됩니다
          </>
        }
      >
        <AlgorithmFlow steps={PIPELINE_STEPS} />
      </Section>

      {/* ══════════ 프레임워크 매핑 표 ══════════ */}
      <Section
        eyebrow="프레임워크 매핑"
        heading={
          <>
            10개 프레임워크가 각각 <span className="gradient-text-static">무엇을 봅니다</span>
          </>
        }
        sub={
          <>
            이름만 그럴듯한 게 아니라, 프레임워크마다 <Em>실제로 채점하는 항목</Em>이 정해져
            있습니다.
          </>
        }
      >
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_1.3fr_auto] gap-4 px-6 py-3 bg-white/[0.04] text-white/40 text-[11px] font-semibold tracking-[0.08em] uppercase">
            <span>프레임워크</span>
            <span>측정 초점</span>
            <span className="text-right">상대 비중</span>
          </div>
          {weightedItems.map((w, i) => (
            <motion.div
              key={w.name}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr_auto] gap-1.5 sm:gap-4 px-6 py-4 border-t border-white/[0.06] items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <span className="text-white text-[13px] font-bold flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                />
                {w.name}
              </span>
              <span className="text-white/50 text-[12px] leading-relaxed">{w.focus}</span>
              <span className="flex sm:justify-end">
                <span className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(w.weight / 12) * 100}%`,
                      background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    }}
                  />
                </span>
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 샘플 차트 ══════════ */}
      <Section
        eyebrow="시각화 예시"
        heading={
          <>
            점수는 <span className="gradient-text-static">막대·레이더 차트</span>로
            보여드립니다
          </>
        }
        sub={
          <>
            아래는 실제 리포트에 쓰이는 것과 <Em>동일한 차트</Em>에 예시 점수를 넣은 것입니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-white/10 rounded-3xl p-6 sm:p-8 bg-white/[0.02] max-w-4xl mx-auto">
          <BarChart items={barItems} />
          <RadarChart items={barItems} />
        </div>
      </Section>

      {/* ══════════ 등급 표 ══════════ */}
      <Section
        eyebrow="등급 기준"
        heading={
          <>
            100점 만점, <span className="gradient-text-static">5단계 등급</span>
          </>
        }
      >
        <div className="max-w-md mx-auto">
          <div className="h-4 rounded-full overflow-hidden flex w-full mb-3">
            {[...GRADE_TABLE].reverse().map((row) => (
              <motion.div
                key={row.grade}
                className={row.bar}
                initial={{ width: 0 }}
                whileInView={{ width: `${row.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </div>
          <div className="flex justify-between text-white/25 text-[10px] mb-8 px-0.5">
            <span>0</span>
            <span>45</span>
            <span>60</span>
            <span>75</span>
            <span>90</span>
            <span>100</span>
          </div>
          <div className="border border-white/10 rounded-3xl overflow-hidden">
            {GRADE_TABLE.map((row, i) => (
              <div
                key={row.grade}
                className={`flex items-center justify-between px-6 py-4 ${
                  i !== GRADE_TABLE.length - 1 ? 'border-b border-white/[0.06]' : ''
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-sm ${row.bar}`} />
                  <span className={`text-[20px] font-extrabold ${row.color}`}>{row.grade}</span>
                </span>
                <span className="text-white/50 text-[13px] tabular-nums">{row.range}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ 공식 기준 ══════════ */}
      <Section
        icon="shield"
        eyebrow="채점 근거"
        heading={
          <>
            감이 아니라 <span className="gradient-text-static">공식 가이드 기준</span>으로
            채점합니다
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {STANDARDS.map((s, i) => (
            <motion.div
              key={s.name}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <IconBadge name={s.icon} tint={(['blue', 'emerald', 'amber'] as const)[i % 3]} size="sm" />
              <p className="text-white font-bold text-[14px] mt-3 mb-1">{s.name}</p>
              <p className="text-white/45 text-[12px] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 재현성 ══════════ */}
      <Section
        eyebrow="재현성"
        heading={
          <>
            같은 사이트는 <span className="gradient-text-static">언제 진단해도</span> 같은
            점수입니다
          </>
        }
        sub={
          <>
            추측이나 랜덤이 아니라 <Em>정해진 기준</Em>으로 채점되기 때문에, 사이트가 바뀌지
            않으면 점수도 바뀌지 않습니다.
          </>
        }
      >
        <div className="text-center">
          <button
            onClick={goDiagnose}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            내 사이트 점수 확인하기 →
          </button>
        </div>
      </Section>

      <footer className="px-6 py-10 border-t border-white/[0.06] text-center">
        <p className="text-white/25 text-[11px] max-w-md mx-auto leading-relaxed">
          채점의 세부 가중치와 알고리즘 로직은 공정성을 위해 비공개로 유지됩니다. 이 페이지는
          진단 과정과 근거 기준을 설명하기 위한 자료입니다.
        </p>
      </footer>
    </div>
  );
}
