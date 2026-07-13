// ============================================================
// 섹션 배경 영상 컴포넌트
// ============================================================
// 애플 제품 페이지처럼 풀블리드 영상 위에 텍스트가 얹히는 히어로를 만들 때 쓴다.
// videoUrl이 없으면 그라데이션만 남아 자연스럽게 저하된다.
//
// iOS에서 자동재생이 되려면 muted + playsInline + autoPlay가 전부 있어야 한다.
// 영상 로드/재생이 실패하면(네트워크, 코덱, 자동재생 차단 등) 조용히
// 오로라 그라데이션으로 대체해서 "빈 화면"이 뜨는 상황 자체를 없앤다.
// ============================================================

import { useState } from 'react';

interface VideoBackgroundProps {
  videoUrl?: string;
  /** 영상이 없을 때(또는 variant="aurora" 강제 지정 시) CSS만으로 움직이는 오로라 그라데이션을 대신 그린다 */
  variant?: 'video' | 'aurora';
  /** 텍스트 가독성을 위한 오버레이 강도 */
  overlay?: 'none' | 'soft' | 'strong';
  poster?: string;
  /** 재생 속도 배율 (1 = 원본 속도, 0.5 = 절반 속도로 슬로우) */
  speed?: number;
}

const OVERLAY_STYLE: Record<NonNullable<VideoBackgroundProps['overlay']>, string> = {
  none: '',
  soft: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 55%, #000 100%)',
  strong: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 55%, #000 100%)',
};

export function VideoBackground({
  videoUrl,
  variant,
  overlay = 'soft',
  poster,
  speed = 1,
}: VideoBackgroundProps) {
  const [errored, setErrored] = useState(false);
  const useAurora = variant === 'aurora' || !videoUrl || errored;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {useAurora ? (
        <div className="absolute inset-0 sellscore-aurora">
          <span className="aurora-blob aurora-blob-1" />
          <span className="aurora-blob aurora-blob-2" />
          <span className="aurora-blob aurora-blob-3" />
        </div>
      ) : (
        <video
          key={videoUrl}
          src={videoUrl}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErrored(true)}
          ref={(el) => {
            if (!el) return;
            el.playbackRate = speed;
            // 자동재생이 브라우저 정책으로 막히면(promise reject) 조용히 아로라로 대체한다.
            const playPromise = el.play();
            if (playPromise) playPromise.catch(() => setErrored(true));
          }}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = speed;
          }}
        />
      )}
      {overlay !== 'none' && (
        <div className="absolute inset-0" style={{ background: OVERLAY_STYLE[overlay] }} />
      )}
    </div>
  );
}
