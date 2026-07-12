import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  buildReferralLink,
  getReferralCode,
  renderShareBannerToCanvas,
  type ShareBannerData,
} from '../../lib/shareBanner';
import { Icon, IconBadge } from './Icon';

interface ShareBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ShareBannerData;
  /** 이미지를 저장하거나 공유하면 호출된다 (친구 초대 프롬프트 언락 트리거) */
  onShared: () => void;
}

export function ShareBannerModal({ isOpen, onClose, data, onShared }: ShareBannerModalProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const code = getReferralCode(user?.uid);
  const link = buildReferralLink(code);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderShareBannerToCanvas(canvasRef.current, data);
    }
  }, [isOpen, data]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sellscore-share.png';
      a.click();
      URL.revokeObjectURL(url);
      onShared();
    }, 'image/png');
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    onShared();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const shareText = '10초 만에 우리 사이트가 안 팔리는 이유를 확인해보세요 — 세일즈스코어';
      try {
        if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'sellscore.png', { type: 'image/png' })] })) {
          const file = new File([blob], 'sellscore-share.png', { type: 'image/png' });
          await navigator.share({ title: '세일즈스코어', text: shareText, url: link, files: [file] });
        } else if (navigator.share) {
          await navigator.share({ title: '세일즈스코어', text: shareText, url: link });
        } else {
          await navigator.clipboard.writeText(link);
          alert('공유 기능을 지원하지 않는 브라우저입니다. 링크가 복사되었습니다.');
        }
        onShared();
      } catch {
        // 사용자가 공유를 취소한 경우 — 언락하지 않음
      }
    }, 'image/png');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none text-[18px]"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <IconBadge name="share" tint="blue" size="sm" />
              <div>
                <p className="text-white font-bold text-[16px] leading-tight">친구에게 공유하기</p>
                <p className="text-white/40 text-[12px] mt-0.5">
                  이미지를 저장하거나 링크를 공유하면 프롬프트 2개가 열립니다
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 mb-5 bg-black">
              <canvas ref={canvasRef} className="w-full h-auto block" />
            </div>

            <div className="flex items-center gap-2 mb-5 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
              <Icon name="share" size={14} className="text-white/30 shrink-0" />
              <span className="text-white/50 text-[12px] truncate flex-1 font-mono">{link}</span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 text-[#7bd6ff] text-[12px] font-bold bg-transparent border-none cursor-pointer whitespace-nowrap"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="flex-1 h-12 rounded-xl bg-white text-black font-bold text-[14px] hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              >
                <Icon name="share" size={15} />
                카카오톡 · SNS로 공유
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 h-12 rounded-xl border border-white/15 text-white/80 font-medium text-[14px] hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                이미지 저장
              </button>
            </div>

            <p className="text-white/25 text-[11px] text-center mt-5 leading-relaxed">
              이 이미지를 카카오톡 프로필/스토리, 인스타그램 등에 올리거나
              <br className="hidden sm:block" /> 링크를 채팅방에 붙여넣기만 해도 홍보가 됩니다.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
