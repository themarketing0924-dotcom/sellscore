import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { SiteNavbar } from './components/sellscore/SiteNavbar';
import { SiteFooter } from './components/sellscore/SiteFooter';
import { MarketingPage } from './components/sellscore/MarketingPage';
import { GuidePage } from './components/sellscore/GuidePage';
import { DiagnoseFlow } from './components/sellscore/DiagnoseFlow';
import { MethodologyPage } from './components/sellscore/MethodologyPage';
import { PricingPage } from './components/sellscore/PricingPage';
import { BlogPage } from './components/sellscore/BlogPage';
import { BlogPostPage } from './components/sellscore/BlogPostPage';
import { HistoryPage } from './components/sellscore/HistoryPage';
import { SavedReportPage } from './components/sellscore/SavedReportPage';
import { PrivacyPolicyPage } from './components/sellscore/PrivacyPolicyPage';
import { TermsPage } from './components/sellscore/TermsPage';
import { NotFoundPage } from './components/sellscore/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-[100dvh] bg-black flex flex-col">
        <SiteNavbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<MarketingPageRoute />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/diagnose" element={<DiagnoseFlow />} />
            <Route path="/diagnose/history" element={<HistoryPage />} />
            <Route path="/diagnose/report/:reportId" element={<SavedReportPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

function MarketingPageRoute() {
  const navigate = useNavigate();
  return <MarketingPage onStart={() => navigate('/diagnose')} />;
}
