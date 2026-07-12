import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BLOG_AUTHOR, BLOG_CATEGORIES, BLOG_POSTS, isNewPost } from '../../config/blog';
import { useSeo } from '../../hooks/useSeo';
import { Icon } from './Icon';
import { BlogBanner } from './BlogBanner';
import { SiteFooter } from './SiteFooter';

export function BlogPage() {
  const [active, setActive] = useState('all');

  useSeo({
    title: '블로그 | 세일즈스코어 — 전환율, 카피, SEO 실전 가이드',
    description:
      '랜딩페이지 진단, 카피라이팅, 전환율 개선, SEO/AEO, 온라인 부업·재테크까지 — 사이트를 파는 구조로 만드는 실전 가이드.',
  });

  const posts = active === 'all' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === active);

  return (
    <>
    <div className="px-6 pt-28 pb-24 max-w-5xl mx-auto">
      {/* 브레드크럼 */}
      <nav aria-label="breadcrumb" className="text-white/35 text-[12px] mb-8 flex items-center gap-2">
        <Link to="/" className="text-white/35 no-underline hover:text-white/60">
          홈
        </Link>
        <span>/</span>
        <span className="text-white/55">블로그</span>
      </nav>

      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-white/45 text-[12px] tracking-[0.3em] uppercase mb-5 font-semibold">
          BLOG
        </p>
        <h1
          className="text-white font-bold leading-[1.2] tracking-[-0.03em] mb-4"
          style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
        >
          <span className="block mx-auto max-w-[9em]">사이트를 파는 구조로</span>
          <span className="block gradient-text-static">바꾸는 실전 가이드</span>
        </h1>
        <p className="text-white/50 text-[14px] sm:text-[15px] max-w-lg mx-auto">
          진단 리포트에서 자주 나오는 질문을 글로 정리했습니다.
        </p>
      </motion.div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {BLOG_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`h-9 px-4 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
              active === c.id
                ? 'bg-[#0064ff] border-[#0064ff] text-white'
                : 'bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post, i) => {
          const card = (
            <motion.div
              className={`h-full rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col ${
                post.hasArticle ? 'hover:border-[#5b9bff]/40 hover:bg-white/[0.04] transition-colors' : ''
              }`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
            >
              <BlogBanner
                category={post.category}
                isNew={post.hasArticle && isNewPost(post.slug)}
                compact
                className="aspect-[16/9] w-full"
              />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/30 text-[11px] flex items-center gap-1">
                    <Icon name="clock" size={11} />
                    {post.readMinutes}분 읽기
                  </span>
                  {!post.hasArticle && (
                    <span className="text-white/30 text-[10px] border border-white/10 rounded-full px-2 py-0.5">
                      곧 공개
                    </span>
                  )}
                </div>
                <h2 className="text-white font-bold text-[16px] leading-snug mb-2 flex-1">
                  {post.title}
                </h2>
                <p className="text-white/45 text-[13px] leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2.5 pt-4 border-t border-white/[0.06]">
                  <span className="w-7 h-7 rounded-full bg-[#0064ff]/15 border border-[#0064ff]/25 text-[#7bd6ff] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {BLOG_AUTHOR.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white/60 text-[12px] font-medium truncate">{BLOG_AUTHOR.name}</p>
                    <p className="text-white/30 text-[11px]">{post.date}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );

          return post.hasArticle ? (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="no-underline">
              {card}
            </Link>
          ) : (
            <div key={post.slug} className="opacity-70 cursor-not-allowed">
              {card}
            </div>
          );
        })}
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
