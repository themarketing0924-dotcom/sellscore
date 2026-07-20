import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import {
  getPost,
  BLOG_POSTS,
  categoryLabel,
  BLOG_AUTHOR,
  isNewPost,
  type BlogSectionVisual,
} from '../../config/blog';
import { Icon } from './Icon';
import { BlogBanner } from './BlogBanner';

// ============================================================
// 블로그 아티클 페이지 — 글마다 다른 본문을 config/blog.ts의
// 구조화된 데이터(sections/checklist/faq)로부터 렌더링한다.
// 배너·요약박스·목차·CTA·관련글 등 틀은 공용이고 내용만 글마다 다르다.
// ============================================================

/** "**강조**" 구문만 최소 지원 — 별도 마크다운 파서 없이 굵게만 처리한다 */
function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function SectionVisualBlock({ visual }: { visual: BlogSectionVisual }) {
  if (visual.kind === 'table' && visual.table) {
    return (
      <figure className="rounded-2xl border border-white/10 overflow-hidden mb-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[420px]">
            <thead>
              <tr className="bg-white/[0.04]">
                {visual.table.headers.map((h) => (
                  <th key={h} className="text-left text-white/60 font-semibold px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.table.rows.map((row, i) => (
                <tr key={i} className="border-t border-white/[0.06]">
                  {row.map((cell, j) => (
                    <td key={j} className="text-white/70 px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visual.caption && (
          <figcaption className="text-white/35 text-[11px] px-4 py-2.5 bg-white/[0.02]">
            {visual.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (visual.kind === 'bars' && visual.bars) {
    return (
      <figure className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-3">
        <div className="flex flex-col gap-3">
          {visual.bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/60 text-[12.5px]">{bar.label}</span>
                <span className="text-white/70 text-[12.5px] font-semibold tabular-nums">
                  {bar.valueLabel ?? `${bar.value}%`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, bar.value))}%`,
                    background: 'linear-gradient(90deg, #0064ff, #7bd6ff)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {visual.caption && (
          <figcaption className="text-white/35 text-[11px] mt-4">{visual.caption}</figcaption>
        )}
      </figure>
    );
  }

  return null;
}

export function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = slug ? getPost(slug) : undefined;
  const [tocOpen, setTocOpen] = useState(false);

  const toc = [
    ...(post?.sections?.map((s) => ({ id: s.id, label: s.heading })) ?? []),
    ...(post?.checklist?.length ? [{ id: 'checklist', label: '체크리스트' }] : []),
    ...(post?.faq?.length ? [{ id: 'faq', label: '자주 묻는 질문' }] : []),
  ];

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
          ...(post.faq?.length
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: post.faq.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                },
              ]
            : []),
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

  if (!post.hasArticle || !post.sections?.length) {
    return (
      <div className="px-6 pt-32 pb-24 text-center">
        <p className="text-white/60 mb-2">아직 준비 중인 글입니다.</p>
        <p className="text-white/35 text-[13px] mb-6">{post.title}</p>
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
      {!!post.summary?.length && (
        <div className="rounded-2xl border border-[#0064ff]/25 bg-[#0064ff]/[0.06] p-5 mb-10">
          <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
            핵심 요약
          </p>
          <ul className="flex flex-col gap-2">
            {post.summary.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-white/75 text-[13px] leading-relaxed">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-[2px] bg-[#5b9bff] shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 목차 */}
      {toc.length > 0 && (
        <nav id="toc" aria-label="목차" className="rounded-2xl border border-white/10 p-5 mb-10">
          <p className="text-white/45 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
            목차
          </p>
          <ol className="flex flex-col gap-1.5">
            {toc.map((t, i) => (
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
      )}

      {/* 본문 — post.sections 데이터로부터 렌더링 */}
      {post.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-10">
          <h2 className="text-white font-bold text-[20px] mb-3">{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} className="text-white/60 text-[14px] leading-relaxed mb-3 last:mb-0">
              {renderInlineBold(paragraph)}
            </p>
          ))}
          {section.visual && (
            <div className="mt-4">
              <SectionVisualBlock visual={section.visual} />
            </div>
          )}
        </section>
      ))}

      {/* 체크리스트 */}
      {!!post.checklist?.length && (
        <section id="checklist" className="mb-10">
          <h2 className="text-white font-bold text-[20px] mb-4">체크리스트</h2>
          <div className="flex flex-col gap-2.5">
            {post.checklist.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Icon name="check" size={15} className="text-[#5b9bff] mt-0.5 shrink-0" />
                <span className="text-white/70 text-[13px] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {!!post.faq?.length && (
        <section id="faq" className="mb-12">
          <h2 className="text-white font-bold text-[20px] mb-4">자주 묻는 질문</h2>
          <div className="flex flex-col gap-3">
            {post.faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-white font-bold text-[14px] mb-1.5">{item.q}</p>
                <p className="text-white/50 text-[13px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <motion.div
        className="rounded-3xl border border-[#0064ff]/25 bg-[#0064ff]/[0.06] p-7 text-center mb-12"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-white font-bold text-[15px] mb-4">
          내 사이트는 어디가 문제인지 10초 안에 확인해보세요
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
      {tocOpen && toc.length > 0 && (
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
              {toc.map((t, i) => (
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
