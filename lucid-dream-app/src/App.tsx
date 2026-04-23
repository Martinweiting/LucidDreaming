import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeContext } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import DreamDetail from './pages/DreamDetail';
import Capture from './pages/Capture';
import Settings from './pages/Settings';
import LucidLab from './pages/LucidLab';
import Explore from './pages/Explore';
import Dreamscape from './pages/Dreamscape';
import DesignTokensShowcase from './components/_dev/DesignTokensShowcase';
import { useAutoBackup } from './hooks/useAutoBackup';

export default function App(): JSX.Element {
  const themeValue = useTheme();
  useAutoBackup();

  return (
    <ThemeContext.Provider value={themeValue}>
      {/* 環境質感底層：paper texture（light）/ stardust（dark） */}
      <div className="ambient-layer" aria-hidden="true" />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dreams/:id" element={<DreamDetail />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lab" element={<LucidLab />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dreamscape" element={<Dreamscape />} />
        <Route path="/dev/tokens" element={<DesignTokensShowcase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeContext.Provider>
  );
}

function NotFound(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-heading text-primary">找不到頁面</h1>
      <p className="font-ui text-body text-secondary">您造訪的路徑不存在</p>
      <Link
        to="/"
        className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md px-4 py-2 font-ui text-body text-accent transition-colors duration-normal hover:text-accent-hover"
      >
        返回首頁
      </Link>
    </main>
  );
}
