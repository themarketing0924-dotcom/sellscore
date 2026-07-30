import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { Em } from './Section';
import { useSeo } from '../../hooks/useSeo';

const marketRanges = [
  {
    label: '단순 홈페이지 제작',
    price: '약 100만~700만원',
    desc: '소규모·중규모 기업 홈페이지 기준. 디자인과 기본 기능 중심입니다.',
  },
  {
    label: '맞춤 개발·쇼핑몰·플랫폼',
    price: '약 600만~5,000만원+',
    desc: '회원, 결제, 관리자, 예약, 쇼핑 기능이 들어가면 범위가 커집니다.',
  },
  {
    label: 'SEO·AEO·GEO 운영',
    price: '월 50만~250만원+',
    desc: '검색·AI 노출 모니터링과 최적화는 보통 월 운영비가 붙습니다.',
  },
  {
    label: '풀스펙 SEO/GEO 프로젝트',
    price: '약 190만~7,530만원',
    desc: '재구축, 콘텐츠, 구조화 데이터, 리포트, 장기 운영이 결합된 공개 사례 기준입니다.',
  },
];

const deliverables = [
  '사이트 목적·고객·오퍼 재정의',
  '검색 유입을 위한 SEO·AEO·GEO 구조 설계',
  '첫 화면 후킹 카피와 세일즈 시나리오 작성',
  '랜딩페이지·홈페이지 제작 또는 리뉴얼',
  'CTA, 문의, 예약, 결제 전환 흐름 설계',
  '오픈 후 Salesscore 재진단과 수정 우선순위 리포트',
];

const process = [
  ['1', '진단', '현재 사이트 또는 새 사업 아이디어를 기준으로 유입·전환 병목을 먼저 확인합니다.'],
  ['2', '설계', '검색 봇이 이해하는 구조와 고객이 설득되는 구조를 함께 기획합니다.'],
  ['3', '제작', '카피, 디자인, 페이지 구조, SEO 기본 세팅을 실제 화면으로 구현합니다.'],
  ['4', '최적화', '오픈 후 다시 진단해 무엇이 개선됐고 무엇이 남았는지 확인합니다.'],
];

const fit = [
  '홈페이지를 만들었지만 검색 유입과 문의가 없는 분',
  'AI로 사이트를 만들었지만 실제 판매 구조가 불안한 분',
  '랜딩페이지, 카피, SEO 세팅을 한 번에 맡기고 싶은 분',
  '저가 제작보다 유입과 구매전환까지 보는 구조가 필요한 분',
];

const notFit = [
  '가장 싼 제작비만 찾는 경우',
  '검색·콘텐츠·카피 수정 없이 디자인만 바꾸려는 경우',
  '업종, 상품, 고객 정보 제공 없이 결과만 원하는 경우',
];

const sources = [
  ['마그네틱소프트', '랜딩페이지 100~400만원, 기업 홈페이지 400~1,500만원, 쇼핑몰/플랫폼 800~5,000만원'],
  ['위시켓', '홈페이지 솔루션 100~600만원, 자체 개발 600~2,000만원, 자사몰 200~1,000만원'],
  ['SEO/AEO 서비스', 'SEO/GEO 시나리오별 190만원~7,530만원 공개 사례'],
  ['GPTO', 'AEO/GEO 최적화 월 200만원부터, 최소 6개월 기준'],
  ['NNT Insights', 'SEO·AEO·GEO 대시보드 50만원~250만원/월'],
];

export function ConsultingPage() {
  useSeo({
    title: 'VIP 사이트 제작 의뢰 — 기획부터 SEO·세일즈 최적화까지 | Salesscore',
    description:
      '홈페이지 제작, 랜딩페이지 카피, SEO·AEO·GEO 구조, 세일즈 전환 최적화까지 함께 맡기는 VIP 맞춤 의뢰 페이지입니다.',
    path: '/consulting',
  });

  return (
    <main className="bg-black text-white overflow-hidden">
      <section className="relative px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 text-center">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(0,100,255,0.24),transparent_72%)]" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[#7bd6ff]/80 text-[13px] tracking-[0.24em] font-extrabold mb-5">
            VIP 맞춤 제작 의뢰
          </p>
          <h1
            className="font-black tracking-tight leading-[1.08] mb-6 text-balance"
            style={{ fontSize: 'clamp(34px, 7vw, 72px)' }}
          >
            사이트를 다시 만드는 게 아니라,
            <span className="block gradient-text-static">팔리는 구조로 설계합니다</span>
          </h1>
          <p className="text-[#9a9aa0] text-[16px] sm:text-[21px] leading-[1.48] max-w-2xl mx-auto font-medium mb-9 text-balance">
            Salesscore 진단으로 문제를 확인했다면, 이제 직접 고치지 않아도 됩니다. 기획, 카피,
            홈페이지 제작, SEO·AEO·GEO, 세일즈 전환 구조까지 <Em>하나의 프로젝트</Em>로 설계합니다.
          </p>
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/12 bg-white/[0.04] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="aspect-video rounded-[1.5rem] border border-white/10 bg-[#07090f] flex flex-col items-center justify-center px-6">
              <div className="w-16 h-16 rounded-full bg-[#0064ff] flex items-center justify-center mb-5 shadow-[0_0_45px_rgba(0,100,255,0.45)]">
                <Icon name="spark" size={28} className="text-white" />
              </div>
              <p className="text-white font-bold text-[18px] sm:text-[22px] mb-2">VIP 의뢰 설명 영상 영역</p>
              <p className="text-white/45 text-[13px] sm:text-[14px]">회원에게 문자·이메일로 보낼 고액 의뢰용 영상이 들어갑니다.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a href="mailto:themarketing0924@gmail.com?subject=Salesscore VIP 제작 의뢰 문의" className="h-14 px-8 rounded-full bg-[#0064ff] text-white font-bold flex items-center justify-center">
              VIP 제작 상담 신청하기 →
            </a>
            <Link to="/diagnose" className="h-14 px-8 rounded-full border border-white/15 text-white/80 font-bold flex items-center justify-center">
              먼저 무료 진단하기
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">왜 따로 의뢰하나요</p>
            <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[50px] mb-5 text-balance">
              진단은 시작이고,
              <span className="block">실제 매출은 실행에서 갈립니다</span>
            </h2>
            <p className="text-[#8d8d93] text-[16px] sm:text-[18px] leading-[1.65] font-medium">
              리포트를 받아도 직접 고치기 어렵다면, 문제는 다시 실행력으로 넘어갑니다. VIP 의뢰는 단순 제작이 아니라
              <Em> 검색 유입과 구매전환을 목표로 한 설계·제작·최적화 프로젝트</Em>입니다.
            </p>
          </div>
          <div className="grid gap-3">
            {deliverables.map((item, i) => (
              <motion.div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 flex items-start gap-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon name="check" size={16} className="text-[#7bd6ff] mt-1 shrink-0" />
                <p className="text-white/75 text-[15px] sm:text-[16px] font-semibold leading-snug">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 border-y border-white/10 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">시장 가격 기준</p>
          <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[54px] mb-5 text-balance">
            따로 맡기면 비용은
            <span className="block gradient-text-static">생각보다 빠르게 커집니다</span>
          </h2>
          <p className="text-[#8d8d93] text-[16px] sm:text-[18px] leading-[1.6] max-w-2xl mx-auto font-medium">
            아래 금액은 국내 공개 가격과 비용 가이드를 바탕으로 한 참고 범위입니다. 실제 견적은 업종, 기능,
            페이지 수, 콘텐츠 범위, SEO·AEO·GEO 운영 여부에 따라 달라집니다.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketRanges.map((range, i) => (
            <motion.div
              key={range.label}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 30, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white/55 text-[12px] font-bold mb-2">{range.label}</p>
              <p className="text-white font-black text-[26px] sm:text-[32px] tracking-tight mb-3">{range.price}</p>
              <p className="text-white/55 text-[14px] leading-relaxed font-medium">{range.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">우리 방식</p>
            <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[52px] mb-5 text-balance">
              제작 전에 먼저,
              <span className="block gradient-text-static">팔릴 구조를 확정합니다</span>
            </h2>
            <p className="text-[#8d8d93] text-[16px] sm:text-[18px] leading-[1.65] font-medium">
              일반 제작은 화면부터 만들기 쉽습니다. 우리는 먼저 고객, 검색 키워드, 첫 화면 후킹, 신뢰 요소,
              CTA, 리포트 재진단 기준을 잡고 제작합니다. 그래서 예쁜 사이트가 아니라 <Em>유입과 전환을 설명할 수 있는 사이트</Em>를 목표로 합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {process.map(([num, title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <p className="text-[#7bd6ff] text-[13px] font-black mb-5">STEP {num}</p>
                <p className="text-white text-[20px] font-bold mb-3">{title}</p>
                <p className="text-white/55 text-[14px] leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 border-y border-white/10 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-[#d7ff00]/40 bg-[#d7ff00]/[0.045] p-6 sm:p-8">
            <p className="text-[#d7ff00] text-[12px] font-black tracking-[0.18em] mb-5">이런 분께 맞습니다</p>
            <ul className="grid gap-3">
              {fit.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/78 text-[15px] font-semibold">
                  <Icon name="check" size={15} className="text-[#d7ff00] mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <p className="text-white/55 text-[12px] font-black tracking-[0.18em] mb-5">이런 경우는 맞지 않습니다</p>
            <ul className="grid gap-3">
              {notFit.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/60 text-[15px] font-semibold">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-white/35 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">상담 신청</p>
          <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[54px] mb-5 text-balance">
            먼저 진단하고,
            <span className="block gradient-text-static">필요한 범위만 의뢰하세요</span>
          </h2>
          <p className="text-[#8d8d93] text-[16px] sm:text-[19px] leading-[1.6] font-medium mb-8">
            VIP 의뢰는 상담 후 범위를 확정합니다. 이미 진단 리포트가 있다면 더 빠르게 견적과 작업 우선순위를 잡을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href="mailto:themarketing0924@gmail.com?subject=Salesscore VIP 제작 의뢰 문의" className="inline-flex h-14 px-9 rounded-full bg-[#0064ff] text-white font-bold items-center justify-center">
              VIP 제작 상담 신청하기 →
            </a>
            <Link to="/diagnose" className="inline-flex h-14 px-9 rounded-full border border-white/15 text-white/80 font-bold items-center justify-center">
              무료 진단 먼저 하기
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <p className="text-white/45 text-[12px] leading-relaxed font-medium">
            참고한 공개 가격: {sources.map(([name, text], i) => `${i ? ' / ' : ''}${name}: ${text}`)}. 실제 Salesscore VIP 의뢰 비용은 진단 범위와 제작 범위 확정 후 별도 안내합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
