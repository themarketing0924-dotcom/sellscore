import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { Em } from './Section';
import { useSeo } from '../../hooks/useSeo';

const problems = [
  '홈페이지는 있는데 구글·네이버에서 잘 보이지 않음',
  '광고를 해도 문의·예약·결제가 늘지 않음',
  '어디를 먼저 고쳐야 할지 몰라 계속 감으로 수정함',
];

const pillars = [
  {
    title: '검색 봇에게 발견되는 구조',
    desc: 'SEO·AEO·GEO 기준으로 title, meta, H1/H2, 이미지, 영상, 색인, 내부링크를 점검합니다.',
  },
  {
    title: '고객에게 설득되는 구조',
    desc: '후킹, 카피 흐름, 신뢰 신호, CTA, 구매전환 시나리오가 행동을 만들고 있는지 봅니다.',
  },
  {
    title: '1분 안에 보는 우선순위',
    desc: '점수만 보여주지 않고 무엇을 왜 고쳐야 하는지, AI 수정 지시문까지 제공합니다.',
  },
];

const valueStack = [
  '44개 항목 자동 진단',
  'SEO·AEO·GEO 검색 구조 점검',
  '세일즈 카피·CTA·신뢰 요소 점검',
  '감점 이유와 수정 우선순위',
  'Claude·Cursor·ChatGPT용 수정 지시문',
];

export function VideoSalesPage() {
  useSeo({
    title: '세일즈스코어 영상 설명 — 사이트가 안 팔리는 이유를 3분 안에 이해하기',
    description:
      '홈페이지는 있는데 검색 유입과 구매전환이 없는 이유를 SEO 구조와 세일즈 구조 관점에서 설명합니다. Salesscore가 44개 항목으로 무엇을 진단하는지 확인하세요.',
    path: '/video',
  });

  return (
    <main className="bg-black text-white overflow-hidden">
      <section className="relative px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 text-center">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(0,100,255,0.22),transparent_70%)]" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[#7bd6ff]/80 text-[13px] tracking-[0.24em] font-extrabold mb-5">
            3분 영상 설명
          </p>
          <h1
            className="font-black tracking-tight leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(34px, 7vw, 72px)' }}
          >
            홈페이지는 있는데,
            <span className="block gradient-text-static">왜 검색도 전환도 안 될까요?</span>
          </h1>
          <p className="text-[#9a9aa0] text-[17px] sm:text-[21px] leading-[1.45] max-w-2xl mx-auto font-medium mb-9">
            사이트가 안 팔리는 이유는 디자인 하나가 아닙니다. <Em>검색 봇에게 발견되는 구조</Em>와
            <Em> 고객에게 설득되는 구조</Em>가 함께 맞아야 합니다.
          </p>
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/12 bg-white/[0.04] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="aspect-video rounded-[1.5rem] border border-white/10 bg-[#07090f] flex flex-col items-center justify-center px-6">
              <div className="w-16 h-16 rounded-full bg-[#0064ff] flex items-center justify-center mb-5 shadow-[0_0_45px_rgba(0,100,255,0.45)]">
                <Icon name="spark" size={28} className="text-white ml-1" />
              </div>
              <p className="text-white font-bold text-[18px] sm:text-[22px] mb-2">3분 홍보 영상 삽입 영역</p>
              <p className="text-white/45 text-[13px] sm:text-[14px]">영상 파일이 준비되면 이 영역에 바로 연결합니다.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/diagnose" className="h-14 px-8 rounded-full bg-[#0064ff] text-white font-bold flex items-center justify-center">
              무료로 내 사이트 진단받기 →
            </Link>
            <Link to="/pricing" className="h-14 px-8 rounded-full border border-white/15 text-white/80 font-bold flex items-center justify-center">
              가격 보기
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">현실 문제</p>
            <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[48px] mb-5">
              많은 홈페이지는 만들고 끝납니다
            </h2>
            <p className="text-[#8d8d93] text-[16px] sm:text-[18px] leading-[1.65] font-medium">
              정부와 지자체가 온라인 판로와 디지털 전환을 계속 지원하는 이유가 있습니다. 고객은 검색하고,
              비교하고, 확인한 뒤 구매합니다. 하지만 홈페이지 제작 이후 <Em>검색 구조와 전환 구조</Em>까지
              점검하는 경우는 많지 않습니다.
            </p>
          </div>
          <div className="grid gap-3">
            {problems.map((problem, i) => (
              <motion.div
                key={problem}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 flex items-start gap-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon name="check" size={16} className="text-[#7bd6ff] mt-1 shrink-0" />
                <p className="text-white/75 text-[15px] sm:text-[16px] font-semibold leading-snug">{problem}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 border-y border-white/10 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">핵심 메커니즘</p>
          <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[54px] mb-5">
            검색 봇에게는 발견되고,
            <span className="block">고객에게는 <span className="gradient-text-static">설득</span>되어야 합니다</span>
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 30, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white font-bold text-[19px] mb-3">{pillar.title}</p>
              <p className="text-white/55 text-[14px] leading-relaxed font-medium">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">가치 대비</p>
            <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[52px] mb-5">
              수백만원짜리 점검 전에,
              <span className="block gradient-text-static">먼저 12,900원부터 확인하세요</span>
            </h2>
            <p className="text-[#8d8d93] text-[16px] sm:text-[18px] leading-[1.65] font-medium">
              전문가에게 맡기면 비용과 시간이 크게 듭니다. Salesscore는 먼저 자동 진단으로 문제와
              우선순위를 확인하게 해, 불필요한 제작·수정 비용을 줄이는 데 초점을 둡니다.
            </p>
          </div>
          <div className="rounded-3xl border border-[#d7ff00]/45 bg-[#d7ff00]/[0.045] p-6 sm:p-8">
            <p className="text-[#d7ff00] text-[12px] font-black tracking-[0.18em] mb-4">포함되는 것</p>
            <ul className="grid gap-3">
              {valueStack.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/78 text-[15px] font-semibold">
                  <Icon name="check" size={15} className="text-[#d7ff00] mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.22em] font-extrabold mb-4">다음 단계</p>
          <h2 className="text-white font-black tracking-tight leading-[1.12] text-[32px] sm:text-[54px] mb-5">
            광고비를 더 쓰기 전에,
            <span className="block gradient-text-static">먼저 문제부터 확인하세요</span>
          </h2>
          <p className="text-[#8d8d93] text-[16px] sm:text-[19px] leading-[1.6] font-medium mb-8">
            홈페이지를 다시 만들기 전에, 어디서 유입이 막히고 어디서 전환이 끊기는지 확인하세요.
          </p>
          <Link to="/diagnose" className="inline-flex h-14 px-9 rounded-full bg-[#0064ff] text-white font-bold items-center justify-center">
            무료로 내 사이트 진단받기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
