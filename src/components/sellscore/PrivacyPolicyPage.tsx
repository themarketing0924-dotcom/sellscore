import { useSeo } from '../../hooks/useSeo';

const SECTION_CLASS = 'mb-10';
const H2_CLASS = 'text-white font-bold text-[18px] mb-3';
const P_CLASS = 'text-white/60 text-[14px] leading-relaxed mb-2';
const LI_CLASS = 'text-white/60 text-[14px] leading-relaxed';

export function PrivacyPolicyPage() {
  useSeo({
    title: '개인정보처리방침 | 세일즈스코어',
    description: '세일즈스코어(캐시홀딩스)의 개인정보 수집·이용·보관 및 이용자 권리에 대한 안내입니다.',
    path: '/privacy',
  });

  return (
    <section className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-white/40 text-[12px] tracking-[0.18em] uppercase mb-2 font-semibold">
          LEGAL
        </p>
        <h1 className="text-white font-black text-[28px] sm:text-[32px] mb-3">개인정보처리방침</h1>
        <p className="text-white/40 text-[13px] mb-12">시행일: 2026년 7월 20일</p>

        <div className={SECTION_CLASS}>
          <p className={P_CLASS}>
            캐시홀딩스(이하 "회사")가 운영하는 세일즈스코어(이하 "서비스")는 이용자의 개인정보를
            중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 회사는 본 방침을 통해
            이용자가 제공하는 개인정보가 어떤 목적과 방식으로 이용되고, 개인정보 보호를 위해 어떤
            조치가 취해지고 있는지 알려드립니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>1. 수집하는 개인정보 항목</h2>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>회원가입 시: 이메일 주소, (소셜 로그인 시) 프로필 이름·프로필 사진</li>
            <li className={LI_CLASS}>서비스 이용 시: 진단 요청 URL, 설문 응답, 진단 결과, 접속 IP(비로그인 무료 횟수 확인 목적, 해시 처리 후 저장)</li>
            <li className={LI_CLASS}>결제 시: 결제 수단 정보는 회사가 직접 저장하지 않으며, 결제대행사(토스페이먼츠, PayPal)가 처리합니다</li>
            <li className={LI_CLASS}>자동 수집 정보: 접속 로그, 쿠키, 브라우저 종류, 방문 일시</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>2. 개인정보의 수집 및 이용 목적</h2>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>회원 식별 및 서비스 제공 (진단 리포트 생성·저장·조회)</li>
            <li className={LI_CLASS}>무료 이용 횟수 관리 및 부정 이용 방지</li>
            <li className={LI_CLASS}>유료 서비스 결제 및 정산</li>
            <li className={LI_CLASS}>서비스 개선, 신규 기능 안내, 고객 문의 응대</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>3. 개인정보의 보유 및 이용 기간</h2>
          <p className={P_CLASS}>
            원칙적으로 개인정보 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 관계 법령에
            따라 보존할 필요가 있는 경우 아래와 같이 보관합니다.
          </p>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li className={LI_CLASS}>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li className={LI_CLASS}>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
            <li className={LI_CLASS}>회원 탈퇴 시: 즉시 파기 (단, 위 법정 보관 항목은 예외)</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>4. 개인정보의 제3자 제공 및 처리위탁</h2>
          <p className={P_CLASS}>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않으며, 서비스 제공을 위해
            아래 업체에 처리를 위탁하고 있습니다.
          </p>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>Google Firebase (Google LLC): 회원 인증, 데이터베이스, 서버 인프라</li>
            <li className={LI_CLASS}>토스페이먼츠: 원화(KRW) 결제 처리</li>
            <li className={LI_CLASS}>PayPal: 해외 카드 결제 처리</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>5. 쿠키(Cookie)의 운영</h2>
          <p className={P_CLASS}>
            서비스는 로그인 상태 유지 및 이용 통계 분석을 위해 쿠키를 사용할 수 있습니다.
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스
            이용에 제한이 있을 수 있습니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>6. 이용자의 권리와 행사 방법</h2>
          <p className={P_CLASS}>
            이용자는 언제든지 자신의 개인정보를 조회·수정·삭제하거나 처리 정지를 요청할 수
            있습니다. 아래 문의처로 연락 주시면 지체 없이 조치합니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>7. 개인정보 보호책임자</h2>
          <p className={P_CLASS}>
            성명: 이대영
            <br />
            회사: 캐시홀딩스(KASH HOLDINGS)
            <br />
            이메일: themarketing0924@gmail.com
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>8. 고지의 의무</h2>
          <p className={P_CLASS}>
            본 방침은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해
            고지합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
