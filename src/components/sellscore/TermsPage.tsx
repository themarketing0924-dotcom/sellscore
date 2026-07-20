import { useSeo } from '../../hooks/useSeo';

const SECTION_CLASS = 'mb-10';
const H2_CLASS = 'text-white font-bold text-[18px] mb-3';
const P_CLASS = 'text-white/60 text-[14px] leading-relaxed mb-2';
const LI_CLASS = 'text-white/60 text-[14px] leading-relaxed';

export function TermsPage() {
  useSeo({
    title: '이용약관 | 세일즈스코어',
    description: '세일즈스코어(캐시홀딩스) 서비스 이용약관입니다.',
    path: '/terms',
  });

  return (
    <section className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-white/40 text-[12px] tracking-[0.18em] uppercase mb-2 font-semibold">
          LEGAL
        </p>
        <h1 className="text-white font-black text-[28px] sm:text-[32px] mb-3">이용약관</h1>
        <p className="text-white/40 text-[13px] mb-12">시행일: 2026년 7월 20일</p>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제1조 (목적)</h2>
          <p className={P_CLASS}>
            본 약관은 캐시홀딩스(이하 "회사")가 운영하는 세일즈스코어(이하 "서비스")의 이용과
            관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제2조 (정의)</h2>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>"서비스"란 회사가 제공하는 웹사이트 진단·분석 및 관련 부가 서비스를 말합니다.</li>
            <li className={LI_CLASS}>"이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li className={LI_CLASS}>"회원"이란 이메일 또는 소셜 계정으로 가입하여 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제3조 (서비스의 내용)</h2>
          <p className={P_CLASS}>
            회사는 이용자가 입력한 URL을 기반으로 AI 및 자동화된 기술적 분석을 통해 웹사이트의
            설득력·전환 구조·검색 최적화 상태 등을 진단하는 리포트를 제공합니다. 본 진단 결과는
            AI 기반 참고 자료이며, 실제 매출·전환율·검색 순위를 보장하지 않습니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제4조 (이용계약의 성립)</h2>
          <p className={P_CLASS}>
            이용계약은 이용자가 본 약관에 동의하고 회원가입을 신청한 후, 회사가 이를 승낙함으로써
            성립합니다. 무료 진단은 별도 가입 없이 IP당 제한된 횟수 내에서 이용할 수 있습니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제5조 (서비스 이용료 및 결제)</h2>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>무료 진단: 비회원은 동일 IP 기준 3회까지 무료로 이용할 수 있습니다.</li>
            <li className={LI_CLASS}>유료 리포트: 결제 후 즉시 전체 리포트가 제공되는 디지털 콘텐츠입니다.</li>
            <li className={LI_CLASS}>결제는 토스페이먼츠(원화) 또는 PayPal(해외 카드)을 통해 처리됩니다.</li>
            <li className={LI_CLASS}>
              디지털 콘텐츠 특성상 결제 즉시 콘텐츠가 제공되므로, 「전자상거래법」에 따라 콘텐츠를
              이미 열람·다운로드한 경우 청약철회가 제한될 수 있습니다. 단, 서비스에 중대한 하자가
              있는 경우 관련 법령에 따라 환불을 요청할 수 있습니다.
            </li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제6조 (이용자의 의무)</h2>
          <ul className="flex flex-col gap-1.5 list-disc pl-5">
            <li className={LI_CLASS}>타인의 정보를 도용하거나 허위 정보를 등록하지 않습니다.</li>
            <li className={LI_CLASS}>서비스를 이용해 자동화된 방식으로 과도한 요청을 보내거나 무료 이용 제한을 우회하지 않습니다.</li>
            <li className={LI_CLASS}>회사의 사전 동의 없이 진단 결과·콘텐츠를 상업적으로 재배포하지 않습니다.</li>
          </ul>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제7조 (면책조항)</h2>
          <p className={P_CLASS}>
            회사가 제공하는 진단 결과는 AI 및 자동화 분석에 기반한 참고 자료이며, 실제 웹사이트의
            매출·전환율·검색 순위 등의 성과를 보장하지 않습니다. 회사는 이용자가 진단 결과를
            바탕으로 내린 의사결정에 대해 책임을 지지 않습니다. 다만 회사의 고의 또는 중대한
            과실로 인한 손해에는 그러하지 아니합니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>제8조 (분쟁해결)</h2>
          <p className={P_CLASS}>
            본 약관과 관련하여 분쟁이 발생한 경우 회사와 이용자는 원만한 해결을 위해 성실히
            협의하며, 협의가 이루어지지 않을 경우 관련 법령이 정하는 관할 법원에 소를 제기할 수
            있습니다.
          </p>
        </div>

        <div className={SECTION_CLASS}>
          <h2 className={H2_CLASS}>사업자 정보</h2>
          <p className={P_CLASS}>
            상호: 캐시홀딩스(KASH HOLDINGS) · 대표: 이대영
            <br />
            사업자등록번호: 616-37-73094
            <br />
            문의: themarketing0924@gmail.com
          </p>
        </div>
      </div>
    </section>
  );
}
