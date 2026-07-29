import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSeo } from '../../hooks/useSeo';
import { IconBadge } from './Icon';
import { Section, Em } from './Section';

// ============================================================
// 대표 소개 페이지 (E-E-A-T 신뢰 신호)
// ============================================================
// 이 페이지는 "누가 만들었는가"보다 "왜 만들었는가"를 먼저 보여준다.
// 사진과 책 표지는 public/about 아래의 실제 파일을 사용한다.
// ============================================================

const STORY_STEPS = [
  {
    title: '예쁜 사이트가 많았지만, 팔리는 사이트는 적었습니다',
    desc: '좋은 디자인처럼 보여도 실제 전환이 낮은 사이트를 너무 많이 봤습니다. 그때부터 "왜 고객은 멈추는가"를 먼저 묻기 시작했습니다.',
    icon: 'search' as const,
  },
  {
    title: '문제는 감이 아니라 구조와 기준이었습니다',
    desc: '수정은 계속했지만 사람마다 답이 달랐습니다. 카피, 전환, 검색 노출, 신뢰 요소를 한 번에 볼 기준이 필요했습니다.',
    icon: 'chart' as const,
  },
  {
    title: '그래서 숫자와 프레임워크로 정리했습니다',
    desc: '좋은 말보다 재현 가능한 시스템이 필요했습니다. 그래서 44개 항목과 12개 프레임워크로 진단 기준을 만들었습니다.',
    icon: 'spark' as const,
  },
  {
    title: '그 결과가 세일즈스코어입니다',
    desc: '감이 아니라 근거로, 추측이 아니라 점수로, 한 번의 판단이 아니라 수정 가능한 지시문으로 바꿨습니다.',
    icon: 'check' as const,
  },
] as const;

const PROOF_POINTS = [
  {
    title: '마케팅 실무 10년',
    desc: '브랜드의 카피, 전환, 검색 노출 문제를 직접 다뤘습니다.',
  },
  {
    title: '교육비만 1억',
    desc: '난다 긴다 하는 실전 전문가들에게 배우며 시행착오를 줄였습니다.',
  },
  {
    title: '저서 2권',
    desc: '《YouTube로 알리고 Zoom으로 소통하라》, 《ZOOM 온라인 혁명》을 출간했습니다.',
  },
  {
    title: '44개 진단 항목',
    desc: '세일즈스코어의 기준은 실제 실행과 점검에 맞춰 설계했습니다.',
  },
] as const;

const BOOKS = [
  {
    src: '/about/9791164841240.jpg',
    alt: '책 「YouTube로 알리고 Zoom으로 소통하라」 표지',
    title: 'YouTube로 알리고 Zoom으로 소통하라',
    note: '유튜브로 잠재 고객을 모으고 Zoom으로 연결하는 구조를 다룹니다.',
  },
  {
    src: '/about/9791164841615.jpg',
    alt: '책 「Zoom 온라인 혁명」 표지',
    title: 'ZOOM 온라인 혁명',
    note: 'Zoom을 활용해 비즈니스를 운영하는 온라인 마케팅 방식을 정리한 책입니다.',
  },
] as const;

function MediaCard({
  src,
  alt,
  className = '',
  fit = 'object-cover',
}: {
  src: string;
  alt: string;
  className?: string;
  fit?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] ${className}`}>
      <img src={src} alt={alt} className={`w-full h-full ${fit}`} loading="lazy" />
    </div>
  );
}

function ProofCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-white font-bold text-[16px] mb-2 tracking-tight">{title}</p>
      <p className="text-[#a0a0a8] text-[14px] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

export function AboutPage() {
  const navigate = useNavigate();

  useSeo({
    title: '대표 소개 | 세일즈스코어',
    description:
      '세일즈스코어를 만든 이대영의 이야기. 예쁜데 팔리지 않는 사이트 문제를 해결하기 위해 44개 진단 항목과 12개 프레임워크를 설계했고, 마케팅 실무 10년과 두 권의 저서 경험을 바탕으로 진단 기준을 만들었습니다.',
    path: '/about',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: '이대영',
        jobTitle: '캐시홀딩스(KASH HOLDINGS) 대표',
        description: '세일즈스코어 제작자, 마케팅 실무 10년, 저서 2권 출간',
        worksFor: {
          '@type': 'Organization',
          name: '캐시홀딩스(KASH HOLDINGS)',
        },
      },
    },
  });

  return (
    <div className="min-h-[100dvh]">
      {/* ══════════ HERO ══════════ */}
      <section className="relative px-6 pt-28 sm:pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 42% at 50% 18%, rgba(0,100,255,0.16), transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#7bd6ff]/70 text-[12px] sm:text-[13px] tracking-[0.25em] uppercase mb-5 font-extrabold">
              대표 소개
            </p>
            <h1
              className="text-white font-black tracking-tight leading-[1.06] mb-5 max-w-[10em]"
              style={{ fontSize: 'clamp(34px, 6vw, 58px)' }}
            >
              감이 아니라,
              <span className="block gradient-text-static">팔리는 구조를 만들기까지</span>
            </h1>
            <p className="text-[#a0a0a8] text-[16px] sm:text-[18px] leading-[1.7] max-w-2xl font-medium">
              예쁜데 팔리지 않는 사이트를 너무 많이 봤습니다. 그래서 이 서비스는 단순한 디자인 평점이 아니라,
              고객이 왜 멈추는지, 어디서 이탈하는지, 무엇을 먼저 고쳐야 하는지를 보여주는 진단으로
              만들었습니다. 이 페이지는 그 이유와 근거를 먼저 보여드립니다.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7">
              {['문제 발견', '기준 설계', '시스템화', '신뢰 증거'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-white/65 text-[12px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-12 gap-3">
              <MediaCard
                src="/about/IMG_5545.PNG"
                alt="이대영 대표 프로필 사진"
                className="col-span-12 sm:col-span-7 aspect-[4/5]"
              />
              <div className="col-span-12 sm:col-span-5 grid grid-rows-2 gap-3">
                <MediaCard src="/about/9791164841240.jpg" alt={BOOKS[0].alt} className="aspect-[4/5]" />
                <MediaCard src="/about/9791164841615.jpg" alt={BOOKS[1].alt} className="aspect-[4/5]" />
              </div>
            </div>
            <div className="absolute -bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <p className="text-white font-semibold text-[13px] sm:text-[14px] leading-relaxed">
                디자인은 보이게, 마케팅은 팔리게, 진단은 고치게. 이 페이지는 그 철학을 보여줍니다.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ 스토리 ══════════ */}
      <Section
        eyebrow="세일즈스코어가 만들어진 이유"
        heading={
          <>
            문제를 겪은 사람이, <span className="gradient-text-static">해결 구조를 만들었습니다</span>
          </>
        }
        sub={
          <>
            과거를 자랑하는 페이지가 아니라, <Em>문제 발견 → 고투 → 기준 설계 → 시스템 완성</Em>의
            흐름을 보여드리기 위한 섹션입니다.
          </>
        }
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5">
          {STORY_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <IconBadge name={step.icon} tint="blue" size="sm" />
                <div>
                  <p className="text-white/45 text-[11px] tracking-[0.14em] uppercase font-bold mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-white font-bold text-[18px] sm:text-[20px] leading-snug">{step.title}</h3>
                </div>
              </div>
              <p className="text-[#a0a0a8] text-[14px] sm:text-[15px] leading-relaxed font-medium pl-[52px] sm:pl-[56px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 신뢰 증거 ══════════ */}
      <Section
        eyebrow="대표 소개"
        heading={
          <>
            이 사람이 어떤 사람인지 <span className="gradient-text-static">한눈에 보이게</span> 정리했습니다
          </>
        }
        sub={
          <>
            말보다 먼저 확인되는 것은 이력과 결과입니다. 그래서 이 페이지에서는 <Em>실무, 투자, 출간,
            기준</Em>을 분리해 보여드립니다.
          </>
        }
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROOF_POINTS.map((item) => (
            <ProofCard key={item.title} title={item.title} desc={item.desc} />
          ))}
        </div>
      </Section>

      {/* ══════════ 저서 ══════════ */}
      <Section
        eyebrow="저서"
        heading={
          <>
            책으로도 <span className="gradient-text-static">온라인 마케팅 구조</span>를 증명했습니다
          </>
        }
        sub={
          <>
            <Em>매일경제출판사</Em>를 통해 출간한 두 권의 책은 유입과 전환, 그리고 Zoom 기반 소통 구조를
            다른 각도에서 다룹니다.
          </>
        }
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {BOOKS.map((book) => (
                <div key={book.src} className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                  <img src={book.src} alt={book.alt} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                  <div className="p-4">
                    <p className="text-white font-bold text-[15px] leading-snug mb-2">{book.title}</p>
                    <p className="text-white/45 text-[12.5px] leading-relaxed">{book.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col justify-center">
            <p className="text-white/45 text-[12px] tracking-[0.18em] uppercase font-bold mb-4">출간 스토리</p>
            <h3 className="text-white font-black text-[26px] sm:text-[30px] leading-tight mb-4">
              책은 결과를 정리하는 가장 오래된 방식입니다
            </h3>
            <p className="text-[#a0a0a8] text-[15px] sm:text-[16px] leading-relaxed font-medium mb-5">
              현장에서 직접 확인한 내용을 책으로 정리하고, 그 원리를 다시 서비스로 옮겼습니다. 그래서
              세일즈스코어는 단순한 UI가 아니라, 실제 실행 경험이 반영된 진단 도구를 지향합니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {['유입', '전환', 'Zoom 소통', '실행 구조'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/65 text-[12px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-white font-bold tracking-tight leading-[1.12] mb-6"
            style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
          >
            이 경험을 바탕으로 만든 진단, <span className="gradient-text-static">직접 확인해보세요</span>
          </h2>
          <button
            onClick={() => navigate('/diagnose')}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료로 내 사이트 진단받기 →
          </button>
          <p className="text-white/30 text-[12px] mt-5">
            <Link to="/methodology" className="text-white/40 hover:text-white/70 no-underline">
              채점 원리 보러가기 →
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
