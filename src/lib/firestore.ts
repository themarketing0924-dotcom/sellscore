// ============================================================
// Firestore Data Models & Helper Functions — TEMPLATE
// ============================================================
// Firestore 컬렉션 구조와 CRUD 헬퍼 함수 정의
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  FrameworkResult,
  PerformanceSnapshot,
  HardCheckItem,
  OfficialLink,
  TrafficInfra,
  TechSeoScore,
} from './scoreEngine';

// ── Collection Names ──
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  SUBSCRIPTIONS: 'subscriptions',
  PRODUCTS: 'products',
  REPORTS: 'reports',
  REFERRAL_CODES: 'referralCodes',
  REFERRALS: 'referrals',
} as const;

// ── Data Types ──

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subscription?: {
    planId: string;
    status: 'active' | 'cancelled' | 'expired';
    paypalSubscriptionId: string;
    startDate: Timestamp;
    endDate?: Timestamp;
  };
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paypalOrderId: string;
  paypalPayerId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  paypalSubscriptionId: string;
  status: 'active' | 'cancelled' | 'suspended' | 'expired';
  startDate: Timestamp;
  nextBillingDate?: Timestamp;
  cancelledAt?: Timestamp;
}

// ── User Helpers ──

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(ref, {
    uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Order Helpers ──

export async function createOrder(order: Omit<Order, 'createdAt'>): Promise<void> {
  const ref = doc(db, COLLECTIONS.ORDERS, order.id);
  await setDoc(ref, {
    ...order,
    createdAt: serverTimestamp(),
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paypalPayerId?: string
): Promise<void> {
  const ref = doc(db, COLLECTIONS.ORDERS, orderId);
  const updates: DocumentData = { status };
  if (status === 'completed') {
    updates.completedAt = serverTimestamp();
  }
  if (paypalPayerId) {
    updates.paypalPayerId = paypalPayerId;
  }
  await updateDoc(ref, updates);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Order);
}

// ── Subscription Helpers ──

export async function createSubscriptionRecord(
  sub: Omit<SubscriptionRecord, 'startDate'>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, sub.id);
  await setDoc(ref, {
    ...sub,
    startDate: serverTimestamp(),
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId);
  await updateDoc(ref, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  });
}

export async function getActiveSubscription(
  userId: string
): Promise<SubscriptionRecord | null> {
  const q = query(
    collection(db, COLLECTIONS.SUBSCRIPTIONS),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as SubscriptionRecord);
}

// ── Product Helpers ──

export async function deleteProduct(productId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(ref);
}

// ── 세일즈스코어: 진단 리포트 저장 ──
// 실제 AI 진단 결과 전체(프레임워크·SEO 점수·하드체크 등)를 그대로 저장한다.
// (예전엔 domain/answers만 저장하고 나중에 mock 엔진으로 재계산했는데, 그러면
// 다시 열 때마다 실제 진단과 다른 가짜 내용이 나오는 문제가 있었다 — 전체를
// 저장해두면 언제 다시 열어도 그때 봤던 진짜 결과가 그대로 나온다.)
// traffic 스냅샷만 domain+answers로 결정론적으로 재현 가능해서 저장하지 않는다.

export interface SavedReport {
  id: string;
  userId: string;
  domain: string;
  answers: Record<string, string>;
  overallScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  oneLiner: string;
  frameworks: FrameworkResult[];
  performance?: PerformanceSnapshot | null;
  hardChecks?: HardCheckItem[];
  officialLinks?: OfficialLink[];
  trafficInfra?: TrafficInfra;
  techSeoScore?: TechSeoScore;
  /** 정식 리포트 결제/포인트 언락 여부 — 서버(결제 승인 함수)만 true로 바꿀 수 있다 */
  paidUnlocked?: boolean;
  createdAt: Timestamp;
}

export async function saveReport(
  data: Omit<SavedReport, 'id' | 'createdAt' | 'paidUnlocked'>
): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.REPORTS));
  await setDoc(ref, { ...data, id: ref.id, paidUnlocked: false, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getReport(reportId: string): Promise<SavedReport | null> {
  const ref = doc(db, COLLECTIONS.REPORTS, reportId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SavedReport) : null;
}

export async function getUserReports(userId: string): Promise<SavedReport[]> {
  const q = query(
    collection(db, COLLECTIONS.REPORTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SavedReport);
}

// ── 세일즈스코어: 리퍼럴(친구 초대) 추적 ──
// referralCodes/{code}      → 코드 소유자(ownerUid) 매핑
// referrals/{referredUid}   → 문서 ID를 "초대받은 사람"으로 고정해 중복 카운트 방지

export async function ensureReferralCode(uid: string): Promise<string> {
  const code = uid.slice(0, 8);
  const ref = doc(db, COLLECTIONS.REFERRAL_CODES, code);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { code, ownerUid: uid, createdAt: serverTimestamp() });
  }
  return code;
}

export async function getReferralOwner(code: string): Promise<string | null> {
  const ref = doc(db, COLLECTIONS.REFERRAL_CODES, code);
  const snap = await getDoc(ref);
  return snap.exists() ? ((snap.data().ownerUid as string) ?? null) : null;
}

/** 새로 가입한 유저(referredUid)를 code 소유자에게 귀속시킨다. 자기 자신 초대·중복 귀속은 무시. */
export async function recordReferral(code: string, referredUid: string): Promise<boolean> {
  const ownerUid = await getReferralOwner(code);
  if (!ownerUid || ownerUid === referredUid) return false;

  const ref = doc(db, COLLECTIONS.REFERRALS, referredUid);
  const existing = await getDoc(ref);
  if (existing.exists()) return false;

  await setDoc(ref, { code, ownerUid, referredUid, createdAt: serverTimestamp() });
  return true;
}

export async function getReferralCount(ownerUid: string): Promise<number> {
  const q = query(collection(db, COLLECTIONS.REFERRALS), where('ownerUid', '==', ownerUid));
  const snap = await getDocs(q);
  return snap.size;
}
