// ============================================================
// 공유용 배너 이미지 (1200×630, OG 카드 표준 규격)
// 카카오톡/SNS에 링크나 이미지를 올렸을 때 보이는 홍보 카드를
// 외부 디자인 툴 없이 canvas로 직접 그린다.
// ============================================================

export const SHARE_BANNER_WIDTH = 1200;
export const SHARE_BANNER_HEIGHT = 630;

export interface ShareBannerData {
  domain?: string;
  score?: number;
  grade?: 'S' | 'A' | 'B' | 'C' | 'D';
}

const GRADE_COLOR: Record<string, string> = {
  S: '#34d399',
  A: '#34d399',
  B: '#fbbf24',
  C: '#fb923c',
  D: '#fb7185',
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

export function drawShareBanner(ctx: CanvasRenderingContext2D, data: ShareBannerData = {}) {
  const W = SHARE_BANNER_WIDTH;
  const H = SHARE_BANNER_HEIGHT;

  // ── 배경 ──
  ctx.fillStyle = '#050507';
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.42, H * 0.3, 0, W * 0.42, H * 0.3, 620);
  glow.addColorStop(0, 'rgba(0,100,255,0.32)');
  glow.addColorStop(1, 'rgba(0,100,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── 브랜드 마크 ──
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(72, 68, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `600 24px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('세일즈스코어', 92, 70);

  // ── 헤드라인 ──
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 62px ${FONT}`;
  ctx.fillText('당신 사이트,', 72, 258);

  const grad = ctx.createLinearGradient(72, 0, 520, 0);
  grad.addColorStop(0, '#5b9bff');
  grad.addColorStop(1, '#7bd6ff');
  ctx.font = `800 62px ${FONT}`;
  ctx.fillStyle = grad;
  ctx.fillText('팔리는 구조', 72, 332);
  const gradWidth = ctx.measureText('팔리는 구조').width;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('입니까?', 72 + gradWidth + 6, 332);

  // ── 서브헤드 ──
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `500 27px ${FONT}`;
  ctx.fillText('10초 만에 설득 전환 지수를 확인하세요', 72, 384);

  // ── CTA 배지 ──
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, 72, 470, 300, 66, 33);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  roundRect(ctx, 72, 470, 300, 66, 33);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 23px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('무료로 진단받기 →', 100, 503);
  ctx.textBaseline = 'alphabetic';

  // ── 점수 카드 (진단 결과가 있을 때만) ──
  if (data.score !== undefined && data.grade) {
    const cardX = 800;
    const cardY = 150;
    const cardW = 328;
    const cardH = 330;

    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.stroke();

    if (data.domain) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = `600 17px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(data.domain.toUpperCase(), cardX + cardW / 2, cardY + 56);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 108px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.round(data.score)), cardX + cardW / 2, cardY + 190);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `500 20px ${FONT}`;
    ctx.fillText('/ 100', cardX + cardW / 2, cardY + 222);

    const chipColor = GRADE_COLOR[data.grade] ?? '#fbbf24';
    ctx.fillStyle = chipColor + '22';
    const chipW = 76;
    const chipH = 48;
    roundRect(ctx, cardX + cardW / 2 - chipW / 2, cardY + 250, chipW, chipH, 14);
    ctx.fill();
    ctx.fillStyle = chipColor;
    ctx.font = `700 26px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(data.grade, cardX + cardW / 2, cardY + 274);
    ctx.textBaseline = 'alphabetic';

    ctx.textAlign = 'left';
  }
}

export function renderShareBannerToCanvas(
  canvas: HTMLCanvasElement,
  data: ShareBannerData = {}
) {
  canvas.width = SHARE_BANNER_WIDTH;
  canvas.height = SHARE_BANNER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawShareBanner(ctx, data);
}

export function getReferralCode(uid?: string | null): string {
  if (uid) return uid.slice(0, 8);
  const key = 'sellscore_ref_code';
  let code = localStorage.getItem(key);
  if (!code) {
    code = Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, code);
  }
  return code;
}

export function buildReferralLink(code: string): string {
  return `${window.location.origin}/diagnose?ref=${code}`;
}
