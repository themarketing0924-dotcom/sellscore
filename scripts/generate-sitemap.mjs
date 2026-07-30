// ============================================================
// sitemap.xml 자동 생성 — 매 빌드(npm run build)마다 실행된다.
// src/config/blog.ts에 새 글을 추가하고 hasArticle: true로만 표시하면,
// sitemap.xml을 손으로 고치지 않아도 다음 빌드에서 자동으로 반영된다.
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SITE_ORIGIN = 'https://salesscore.cloud';

// ── 고정 페이지 ──
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/guide', changefreq: 'monthly', priority: '0.7' },
  { path: '/diagnose', changefreq: 'monthly', priority: '0.9' },
  { path: '/methodology', changefreq: 'monthly', priority: '0.8' },
  { path: '/seo-aeo-geo', changefreq: 'monthly', priority: '0.8' },
  { path: '/search-methodology', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
];

// ── src/config/blog.ts에서 hasArticle: true인 글의 slug만 추출 ──
// (정규식 파싱 — 이 스크립트는 vite/tsx 없이 plain Node로 돌기 때문에
// TypeScript를 직접 import하지 않는다)
function extractBlogSlugs() {
  const blogTs = readFileSync(join(root, 'src/config/blog.ts'), 'utf8');
  const postBlocks = blogTs.split(/\{\s*\n\s*slug:/).slice(1);
  const slugs = [];
  for (const block of postBlocks) {
    const slugMatch = block.match(/^\s*'([^']+)'/);
    const hasArticle = /hasArticle:\s*true/.test(block.split(/\n\s*slug:/)[0] ?? block);
    if (slugMatch && hasArticle) {
      slugs.push(slugMatch[1]);
    }
  }
  return slugs;
}

function buildSitemap() {
  const blogSlugs = extractBlogSlugs();
  const urls = [
    ...STATIC_PAGES,
    ...blogSlugs.map((slug) => ({ path: `/blog/${slug}`, changefreq: 'monthly', priority: '0.6' })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE_ORIGIN}${u.path}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const xml = buildSitemap();
writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf8');
console.log(`[generate-sitemap] public/sitemap.xml 생성 완료 (${xml.match(/<url>/g)?.length ?? 0}개 URL)`);
