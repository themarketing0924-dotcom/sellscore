// ============================================================
// PayPal 결제 버튼 컴포넌트
// ============================================================
// 결제 승인(capture)은 서버(capturePayPalOrder 함수)가 한다 — 클라이언트는
// 주문 생성과 구매자 승인(approve)까지만 담당한다. 예전엔 클라이언트가 직접
// actions.order.capture()를 호출하고 그 결과를 그대로 믿었는데, 이러면
// devtools에서 onSuccess를 그냥 호출해 결제 없이 "성공"으로 위장할 수 있었다.
//
// 사용법:
//   <PayPalCheckoutButton
//     product={product}
//     onSuccess={() => ...}
//     onError={(err) => console.error(err)}
//   />
// ============================================================

import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../AuthModal';
import type { PayPalProduct } from '../../lib/paypal';

interface PayPalCheckoutButtonProps {
  product: PayPalProduct;
  /** 이 결제로 언락할 리포트 문서 ID — 있으면 결제 승인 시 서버가 해당 리포트를 언락 처리한다 */
  reportId?: string;
  onSuccess: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  product,
  reportId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => setAuthOpen(true)}
        className="w-full max-w-md mx-auto h-[50px] rounded-lg font-medium text-[15px] bg-white/10 text-white border border-white/15 cursor-pointer"
        type="button"
      >
        로그인 후 페이팔로 결제하기
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </button>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 50,
          tagline: false,
        }}
        disabled={processing}
        createOrder={async (_data, actions) => {
          const orderId = await actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                description: product.description,
                custom_id: product.id,
                amount: {
                  currency_code: product.currency,
                  value: product.price,
                  breakdown: {
                    item_total: {
                      currency_code: product.currency,
                      value: product.price,
                    },
                  },
                },
                items: [
                  {
                    name: product.name,
                    unit_amount: {
                      currency_code: product.currency,
                      value: product.price,
                    },
                    quantity: '1',
                    category: 'DIGITAL_GOODS' as const,
                  },
                ],
              },
            ],
            application_context: {
              brand_name: '세일즈스코어',
              shipping_preference: 'NO_SHIPPING' as const,
              user_action: 'PAY_NOW' as const,
            },
          });

          // 서버가 나중에 이 주문이 어떤 상품인지 알 수 있도록, 결제창이 뜨기
          // 전에 pending 상태로 먼저 기록해둔다 (토스 결제와 동일한 패턴).
          await setDoc(doc(db, 'payments', orderId), {
            userId: user.uid,
            orderId,
            productId: product.id,
            productName: product.name,
            amount: product.price,
            currency: product.currency,
            status: 'pending',
            ...(reportId ? { reportId } : {}),
            createdAt: serverTimestamp(),
          });

          return orderId;
        }}
        onApprove={async (data) => {
          setProcessing(true);
          try {
            const capture = httpsCallable(functions, 'capturePayPalOrder', { timeout: 30000 });
            await capture({ orderId: data.orderID });
            onSuccess();
          } catch (error) {
            console.error('[PayPal] 승인 실패:', error);
            onError?.(error);
          } finally {
            setProcessing(false);
          }
        }}
        onError={(err) => {
          console.error('[PayPal] Error:', err);
          onError?.(err);
        }}
        onCancel={() => {
          onCancel?.();
        }}
      />
    </div>
  );
};

export default PayPalCheckoutButton;
