import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { getPost, BLOG_POSTS, categoryLabel, BLOG_AUTHOR, isNewPost } from '../../config/blog';
import { Icon, IconBadge } from './Icon';
import { BlogBanner } from './BlogBanner';

const TOC = [
  { id: 'why', label: '왜 방문은 있는데 수익이 없을까' },
  { id: 'reason-1', label: '1. 오퍼가 명확하지 않다' },
  { id: 'reason-2', label: '2. 신뢰 신호가 없다' },
  { id: 'reason-3', label: '3. 결제 단계가 복잡하다' },
  { id: 'checklist', label: '체크리스트' },
  { id: 'faq', label: '자주 묻는 질문' },
];

const FAQ = [
  {
    q: '방문자는 늘었는데 왜 매출은 그대로일까요?',
    a: '트래픽과 전환은 완전히 다른 문제입니다. 유입 채널을 아무리 늘려도 페이지 안에서 설득이 끊기면 매출로 이어지지 않습니다.',
  },
  {
    q: '부업 사이트도 진단이 필요한가요?',
    a: '네. 오히려 예산과 시간이 적은 부업일수록 어디를 먼저 고쳐야 하는지 우선순위를 아는 게 더 중요합니다.',
  },
  {
    q: '지금 바로 확인할 수 있는 방법이 있나요?',
    a: '세일즈스코어에 URL을 입력하면 10초 안에 설득 전환 지수와 병목 지점을 확인할 수 있습니다.',
  },
];

export function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = slug ? getPost(slug) : undefined;
  const [tocOpen, setTocOpen] = useState(false);

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { '@type': 'Organization', name: '세일즈스코어' },
          },
          {
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ],
      }
    : undefined;

  useSeo({
    title: post ? `${post.title} | 세일즈스코어 블로그` : '글을 찾을 수 없습니다',
    description: post?.excerpt || '',
    jsonLd,
  });

  if (!post) {
    return (
      <div className="px-6 pt-32 pb-24 text-center">
        <p className="text-white/60 mb-6">글을 찾을 수 없습니다.</p>
        <Link to="/blog" className="text-[#7bd6ff] no-underline">
          블로그로 돌아가기
        </Link>
      </div>
    );
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.hasArticle).slice(0, 2);

  return (
    <>
    <article className="px-6 pt-24 pb-32 max-w-2xl mx-auto">
      {/* 브레드크럼 */}
      <nav aria-label="breadcrumb" className="text-white/35 text-[12px] mb-8 flex flex-wrap items-center gap-2">
        <Link to="/" className="text-white/35 no-underline hover:text-white/60">
          홈
        </Link>
        <span>/</span>
        <Link to="/blog" className="text-white/35 no-underline hover:text-white/60">
          블로그
        </Link>
        <span>/</span>
        <span className="text-white/50">{categoryLabel(post.category)}</span>
        <span>/</span>
        <span className="text-white/55 truncate max-w-[16em]">{post.title}</span>
      </nav>

      {/* 헤더 */}
      <header className="mb-8">
        <span className="text-[#7bd6ff]/70 text-[12px] font-semibold tracking-[0.1em] uppercase">
          {categoryLabel(post.category)}
        </span>
        <h1
          className="text-white font-bold leading-[1.2] tracking-[-0.025em] mt-3 mb-6"
          style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
        >
          {post.title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#0064ff]/15 border border-[#0064ff]/25 text-[#7bd6ff] text-[13px] font-bold flex items-center justify-center shrink-0">
            {BLOG_AUTHOR.initials}
          </span>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold">{BLOG_AUTHOR.name}</p>
            <p className="text-white/40 text-[11px]">{BLOG_AUTHOR.role}</p>
          </div>
          <span className="w-px h-8 bg-white/10 mx-1" />
          <div className="flex flex-col gap-1 text-white/35 text-[11px]">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              <Icon name="clock" size={11} />
              {post.readMinutes}분 읽기
            </span>
          </div>
        </div>
      </header>

      {/* 대표 배너 — 카테고리 그라디언트 + 제목 오버레이 (neilpatel.com 아티클 배너 구조) */}
      <BlogBanner
        category={post.category}
        title={post.title}
        isNew={isNewPost(post.slug)}
        ariaLabel={post.title}
        className="w-full aspect-[16/9] rounded-3xl border border-white/10 mb-8"
      />

      {/* 요약 박스 — AEO(답변엔진 최적화)용 핵심 요약 */}
      <div className="rounded-2xl border border-[#0064ff]/25 bg-[#0064ff]/[0.06] p-5 mb-10">
        <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
          핵심 요약
        </p>
        <ul className="flex flex-col gap-2">
          {[
            '트래픽과 전환은 별개의 문제입니다.',
            '매출이 안 나는 이유는 대부분 오퍼·신뢰·결제 단계 셋 중 하나입니다.',
            '어디가 문제인지는 사이트를 진단해보면 10초 안에 알 수 있습니다.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-white/75 text-[13px] leading-relaxed">
              <span className="w-1.5 h-1.5 mt-1.5 rounded-[2px] bg-[#5b9bff] shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* 목차 */}
      <nav id="toc" aria-label="목차" className="rounded-2xl border border-white/10 p-5 mb-10">
        <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
          목차
        </p>
        <ol className="flex flex-col gap-1.5">
          {TOC.map((t, i) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="text-white/60 text-[13px] no-underline hover:text-white"
              >
                {i + 1}. {t.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 본문 */}
      <section id="why" className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-3">왜 방문은 있는데 수익이 없을까</h2>
        <p className="text-white/60 text-[14px] leading-relaxed">
          온라인 부업으로 사이트나 스마트스토어, 블로그를 운영하시는 분들이 가장 많이 하는
          착각이 "트래픽만 늘리면 매출도 따라온다"는 것입니다. 하지만 방문자 수와 전환율은
          완전히 다른 지표입니다. 사람들이 들어오긴 하는데 사지 않는다면, 문제는 유입이 아니라
          <strong className="text-white font-semibold"> 페이지 안에서 설득이 끊기는 지점</strong>
          에 있습니다.
        </p>
      </section>

      <section id="reason-1" className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-3">1. 오퍼가 명확하지 않다</h2>
        <p className="text-white/60 text-[14px] leading-relaxed">
          "이걸 사면 정확히 무엇을 얻는지"가 3초 안에 전달되지 않으면 방문자는 그대로
          이탈합니다. 특히 부업으로 시작한 사이트는 상품 설명에 공을 들이는 대신, 정작 가장
          중요한 "왜 지금 이걸 사야 하는지"는 비어있는 경우가 많습니다.
        </p>
      </section>

      <section id="reason-2" className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-3">2. 신뢰 신호가 없다</h2>
        <p className="text-white/60 text-[14px] leading-relaxed">
          후기, 실적, 환불 보장 같은 신뢰 신호가 없으면 아무리 좋은 상품이라도 결제 직전에
          망설이게 됩니다. 특히 개인이 운영하는 부업 사이트는 브랜드 신뢰가 낮기 때문에 이
          부분을 더 신경 써야 합니다.
        </p>
      </section>

      <section id="reason-3" className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-3">3. 결제 단계가 복잡하다</h2>
        <p className="text-white/60 text-[14px] leading-relaxed">
          결제 버튼을 누르기까지 클릭이 많거나, 회원가입을 먼저 요구하면 그 사이에 방문자는
          이탈합니다. 결제까지 가는 경로는 짧고 단순할수록 좋습니다.
        </p>
      </section>

      {/* 영상 섹션 — 영상 콘텐츠 자리 (SEO 구조 데모) */}
      <section className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-3">영상으로 보기</h2>
        <figure className="rounded-2xl border border-white/10 bg-white/[0.02] aspect-video flex flex-col items-center justify-center gap-3">
          <IconBadge name="spark" tint="blue" />
          <figcaption className="text-white/35 text-[12px]">
            요약 설명 영상 준비 중입니다
          </figcaption>
        </figure>
      </section>

      {/* 체크리스트 */}
      <section id="checklist" className="mb-10">
        <h2 className="text-white font-bold text-[20px] mb-4">체크리스트</h2>
        <div className="flex flex-col gap-2.5">
          {[
            '헤드라인만 보고 3초 안에 "뭘 파는지" 알 수 있는가',
            '후기나 실적 같은 신뢰 신호가 CTA 근처에 있는가',
            '결제까지 3클릭 이내로 끝나는가',
            '가격이 비교 기준(앵커) 없이 단독으로만 표시되어 있진 않은가',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <Icon name="check" size={15} className="text-[#5b9bff] mt-0.5 shrink-0" />
              <span className="text-white/70 text-[13px] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-12">
        <h2 className="text-white font-bold text-[20px] mb-4">자주 묻는 질문</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-white font-bold text-[14px] mb-1.5">{item.q}</p>
              <p className="text-white/50 text-[13px] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.div
        className="rounded-3xl border border-[#0064ff]/25 bg-[#0064ff]/[0.06] p-7 text-center mb-12"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-white font-bold text-[15px] mb-4">
          내 부업 사이트는 어디가 문제인지 10초 안에 확인해보세요
        </p>
        <button
          onClick={() => navigate('/diagnose')}
          className="h-12 px-7 rounded-full font-semibold text-[14px] text-white border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0064ff, #4f8bff)' }}
        >
          무료로 진단받기 →
        </button>
      </motion.div>

      {/* 관련 글 */}
      {related.length > 0 && (
        <section>
          <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-4 font-semibold">
            관련 글
          </p>
          <div className="flex flex-col gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                className="block rounded-2xl border border-white/10 p-4 no-underline hover:border-[#5b9bff]/40 transition-colors"
              >
                <span className="text-white text-[13px] font-medium">{r.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>

    {/* 하단 고정 바 — neilpatel.com 아티클의 "Table of contents / Want better results?" 스티키 바 구조 */}
    <AnimatePresence>
      {tocOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-16 left-0 right-0 z-40 px-6"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a0e]/95 backdrop-blur-md p-5 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.5)]">
            <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
              목차
            </p>
            <ol className="flex flex-col gap-1.5">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    onClick={() => setTocOpen(false)}
                    className="text-white/60 text-[13px] no-underline hover:text-white"
                  >
                    {i + 1}. {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#08080c]/90 backdrop-blur-md">
      <div className="max-w-2xl mx-auto flex items-stretch divide-x divide-white/10">
        <button
          onClick={() => setTocOpen((o) => !o)}
          className="flex-1 h-14 flex items-center justify-center gap-2 text-white/70 text-[13px] font-medium bg-transparent border-none cursor-pointer"
        >
          <Icon name="chart" size={15} />
          목차
        </button>
        <button
          onClick={() => navigate('/diagnose')}
          className="flex-1 h-14 flex items-center justify-center gap-2 text-[#7bd6ff] text-[13px] font-semibold bg-transparent border-none cursor-pointer"
        >
          <Icon name="spark" size={15} />
          더 나은 결과가 궁금하다면
        </button>
      </div>
    </div>
    </>
  );
}
