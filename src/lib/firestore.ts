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
// scoreEngine.generateReport()는 domain+answers만 있으면 항상 같은 결과를
// 재현하는 결정론적 엔진이므로, 전체 리포트를 통째로 저장하지 않고
// domain/answers만 저장해뒀다가 조회 시 다시 계산한다 (문서 용량 절약).

export interface SavedReport {
  id: string;
  userId: string;
  domain: string;
  answers: Record<string, string>;
  overallScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  createdAt: Timestamp;
}

export async function saveReport(
  data: Omit<SavedReport, 'id' | 'createdAt'>
): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.REPORTS));
  await setDoc(ref, { ...data, id: ref.id, createdAt: serverTimestamp() });
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
