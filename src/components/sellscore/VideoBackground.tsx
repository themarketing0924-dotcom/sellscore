// ============================================================
// 섹션 배경 영상 컴포넌트
// ============================================================
// 애플 제품 페이지처럼 풀블리드 영상 위에 텍스트가 얹히는 히어로를 만들 때 쓴다.
// videoUrl이 없으면 그라데이션만 남아 자연스럽게 저하된다.
//
// iOS에서 자동재생이 되려면 muted + playsInline + autoPlay가 전부 있어야 한다.
// ============================================================

interface VideoBackgroundProps {
  videoUrl?: string;
  /** 영상이 없을 때(또는 variant="aurora" 강제 지정 시) CSS만으로 움직이는 오로라 그라데이션을 대신 그린다 */
  variant?: 'video' | 'aurora';
  /** 텍스트 가독성을 위한 오버레이 강도 */
  overlay?: 'none' | 'soft' | 'strong';
  poster?: string;
}

const OVERLAY_STYLE: Record<NonNullable<VideoBackgroundProps['overlay']>, string> = {
  none: '',
  soft: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 55%, #000 100%)',
  strong: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 55%, #000 100%)',
};

export function VideoBackground({ videoUrl, variant, overlay = 'soft', poster }: VideoBackgroundProps) {
  const useAurora = variant === 'aurora' || !videoUrl;

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
          src={videoUrl}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      {overlay !== 'none' && (
        <div className="absolute inset-0" style={{ background: OVERLAY_STYLE[overlay] }} />
      )}
    </div>
  );
}
