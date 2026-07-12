// ============================================================
// 실제 Claude API 기반 진단 엔진 — Firebase Cloud Function(analyzeSite)을 호출한다.
// ============================================================
// functions/src/index.ts의 analyzeSite가 배포되어 있지 않거나, 호출이
// 실패/타임아웃되면 자동으로 scoreEngine.ts의 목업 엔진으로 폴백한다.
// 그래서 백엔드가 아직 없는 개발 환경에서도 제품이 항상 동작한다.
// ============================================================

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import {
  generateReport as generateMockReport,
  buildTrafficSnapshot,
  type DiagnosisReport,
  type FrameworkResult,
} from './scoreEngine';

const CALL_TIMEOUT_MS = 45000;

interface AnalyzeSiteResponse {
  domain: string;
  overallScore: number;
  grade: DiagnosisReport['grade'];
  oneLiner: string;
  frameworks: FrameworkResult[];
}

function extractDomainForTraffic(url: string): string {
  try {
    const withProtocol = /^https?:\/\//.test(url) ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace(/^www\./, '');
  } catch {
    return url || '이 사이트';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * 실제 URL을 크롤링 + Claude로 분석한 진단 리포트를 반환한다.
 * Cloud Function이 없거나 실패하면 조용히 목업 엔진으로 폴백한다.
 */
export async function getDiagnosisReport(
  url: string,
  answers: Record<string, string>
): Promise<DiagnosisReport> {
  try {
    const analyzeSite = httpsCallable<
      { url: string; answers: Record<string, string> },
      AnalyzeSiteResponse
    >(functions, 'analyzeSite');

    const result = await withTimeout(
      analyzeSite({ url, answers }),
      CALL_TIMEOUT_MS
    );

    const data = result.data;
    const traffic = buildTrafficSnapshot(data.domain, answers);

    return {
      domain: data.domain,
      overallScore: data.overallScore,
      grade: data.grade,
      oneLiner: data.oneLiner,
      traffic,
      frameworks: data.frameworks,
    };
  } catch (err) {
    console.warn('[aiScoreEngine] analyzeSite 호출 실패, 목업 엔진으로 폴백합니다:', err);
    return generateMockReport(url, answers);
  }
}

// 참고용으로 남겨둠 — 도메인만 필요한 호출부에서 재사용 가능
export { extractDomainForTraffic };
