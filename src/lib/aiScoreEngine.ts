// ============================================================
// 실제 Claude API 기반 진단 엔진 — Firebase Cloud Function(analyzeSite)을 호출한다.
// ============================================================
// 분석이 실패하면 가짜 데이터로 대체하지 않고 에러를 그대로 올린다.
// 사용자에게는 "왜 실패했는지"를 정직하게 보여주는 것이 지어낸 리포트보다 낫다.
// ============================================================

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import {
  buildTrafficSnapshot,
  type DiagnosisReport,
  type FrameworkResult,
  type HardCheckItem,
  type OfficialLink,
  type PerformanceSnapshot,
  type TechSeoScore,
  type TrafficInfra,
} from './scoreEngine';

// Cloud Function 자체 제한이 240초이므로 그보다 약간 짧게 잡는다.
const CALL_TIMEOUT_MS = 230000;

interface AnalyzeSiteResponse {
  domain: string;
  overallScore: number;
  grade: DiagnosisReport['grade'];
  oneLiner: string;
  frameworks: FrameworkResult[];
  performance?: PerformanceSnapshot | null;
  hardChecks?: HardCheckItem[];
  officialLinks?: OfficialLink[];
  trafficInfra?: TrafficInfra;
  techSeoScore?: TechSeoScore;
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

/** 분석 실패를 사용자에게 그대로 전달하기 위한 에러 타입 */
export class DiagnosisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiagnosisError';
  }
}

function toUserMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'timeout') {
      return '분석 시간이 너무 오래 걸려 중단됐습니다. 잠시 후 다시 시도해주세요.';
    }
    // Firebase HttpsError는 서버에서 보낸 한국어 메시지를 그대로 담고 있다.
    if (err.message) return err.message;
  }
  return '알 수 없는 오류로 분석에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

/**
 * 실제 URL을 크롤링 + Claude로 분석한 진단 리포트를 반환한다.
 * 실패하면 가짜 데이터로 대체하지 않고 DiagnosisError를 던진다 —
 * 지어낸 리포트를 보여주는 것보다 실패 이유를 정직하게 알리는 쪽을 택한다.
 */
export async function getDiagnosisReport(
  url: string,
  answers: Record<string, string>
): Promise<DiagnosisReport> {
  try {
    // httpsCallable 자체에도 내부 기본 타임아웃(70초)이 있어, 아래 withTimeout과
    // 별개로 여기서도 명시적으로 늘려주지 않으면 크롤링+AI채점이 끝나기 전에
    // "deadline-exceeded"로 끊긴다.
    const analyzeSite = httpsCallable<
      { url: string; answers: Record<string, string> },
      AnalyzeSiteResponse
    >(functions, 'analyzeSite', { timeout: CALL_TIMEOUT_MS });

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
      performance: data.performance ?? null,
      hardChecks: data.hardChecks,
      officialLinks: data.officialLinks,
      trafficInfra: data.trafficInfra,
      techSeoScore: data.techSeoScore,
    };
  } catch (err) {
    console.error('[aiScoreEngine] analyzeSite 호출 실패:', err);
    throw new DiagnosisError(toUserMessage(err));
  }
}

// 참고용으로 남겨둠 — 도메인만 필요한 호출부에서 재사용 가능
export { extractDomainForTraffic };
