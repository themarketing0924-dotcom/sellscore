import { useEffect } from 'react';

// ============================================================
// 가벼운 SEO 메타 관리 훅 (react-helmet 없이 직접 head 조작)
// ============================================================
// title, description, JSON-LD 구조화 데이터를 페이지 진입 시 설정한다.
// ============================================================

interface SeoOptions {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSeo({ title, description, jsonLd }: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setMetaTag('description', description);
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      if (script) document.head.removeChild(script);
    };
  }, [title, description, jsonLd]);
}
