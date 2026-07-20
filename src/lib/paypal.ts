// ============================================================
// PayPal Configuration — @paypal/react-paypal-js 기반
// ============================================================
// 
// 설정 방법:
// 1. https://developer.paypal.com/dashboard 에서 앱 생성
// 2. Client ID를 .env 파일에 넣기:
//    VITE_PAYPAL_CLIENT_ID=실제_클라이언트_ID
// 3. 프로덕션: VITE_PAYPAL_CLIENT_ID에 Live Client ID 사용
//
// ============================================================

export const PAYPAL_CONFIG = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
  currency: 'USD',
  intent: 'capture' as const,
};

// ── 상품 타입 정의 ──

export interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  price: string; // '29.99' 형식
  currency: string;
}

// ── 구독 플랜 타입 정의 ──

export interface PayPalSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  planId: string; // PayPal에서 생성한 구독 Plan ID
  price: string;
  currency: string;
  interval: 'MONTH' | 'YEAR';
}

// ── 세일즈스코어 상품 (토스는 KRW, 페이팔은 해외 결제용 USD) ──

export const PRODUCTS: PayPalProduct[] = [
  {
    id: 'sellscore-report',
    name: 'SellScore Full Report',
    description: '설득 전환 지수 전체 리포트 — 12개 프레임워크 상세 진단 + 수정 프롬프트',
    price: '6.90',
    currency: 'USD',
  },
];

// ── 예시 구독 플랜 — 여기를 수정하세요 ──

export const SUBSCRIPTION_PLANS: PayPalSubscriptionPlan[] = [
  {
    id: 'connect-ai-monthly',
    name: 'Connect AI Monthly',
    description: 'Monthly access to full neural-AI suite',
    planId: 'YOUR_PAYPAL_PLAN_ID', // PayPal에서 생성한 구독 플랜 ID
    price: '49.99',
    currency: 'USD',
    interval: 'MONTH',
  },
  {
    id: 'connect-ai-yearly',
    name: 'Connect AI Yearly',
    description: 'Annual access — save 20%',
    planId: 'YOUR_PAYPAL_YEARLY_PLAN_ID',
    price: '479.99',
    currency: 'USD',
    interval: 'YEAR',
  },
];
