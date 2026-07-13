import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { SiteNavbar } from './components/sellscore/SiteNavbar';
import { MarketingPage } from './components/sellscore/MarketingPage';
import { GuidePage } from './components/sellscore/GuidePage';
import { DiagnoseFlow } from './components/sellscore/DiagnoseFlow';
import { MethodologyPage } from './components/sellscore/MethodologyPage';
import { BlogPage } from './components/sellscore/BlogPage';
import { BlogPostPage } from './components/sellscore/BlogPostPage';
import { HistoryPage } from './components/sellscore/HistoryPage';
import { SavedReportPage } from './components/sellscore/SavedReportPage';
import { NotFoundPage } from './components/sellscore/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-[100dvh] bg-black">
        <SiteNavbar />
        <Routes>
          <Route path="/" element={<MarketingPageRoute />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/diagnose" element={<DiagnoseFlow />} />
          <Route path="/diagnose/history" element={<HistoryPage />} />
          <Route path="/diagnose/report/:reportId" element={<SavedReportPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function MarketingPageRoute() {
  const navigate = useNavigate();
  return <MarketingPage onStart={() => navigate('/diagnose')} />;
}
