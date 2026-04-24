import { Route, Routes, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import DreamDetail from './pages/DreamDetail';
import Capture from './pages/Capture';
import Settings from './pages/Settings';
import LucidLab from './pages/LucidLab';
import Explore from './pages/Explore';
import Dreamscape from './pages/Dreamscape';
import Incubation from './pages/Incubation';
import SleepRitual from './pages/SleepRitual';
import DesignTokensShowcase from './components/_dev/DesignTokensShowcase';
import BottomTabBar from './components/BottomTabBar';
import { useAutoBackup } from './hooks/useAutoBackup';

export default function App(): JSX.Element {
  const themeValue = useTheme();
  useAutoBackup();
  const location = useLocation();
  const locationState = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = locationState?.backgroundLocation;
  const isSleepRitual = location.pathname.startsWith('/sleep-ritual');

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="ambient-layer" aria-hidden="true" />

      {/* Main routes — when modal is open, render the background page */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dreams/:id" element={<DreamDetail />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lab" element={<LucidLab />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dreamscape" element={<Dreamscape />} />
        <Route path="/incubation" element={<Incubation />} />
        <Route path="/sleep-ritual/:id" element={<SleepRitual />} />
        <Route path="/dev/tokens" element={<DesignTokensShowcase />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Capture modal sheet — only when navigated with backgroundLocation state */}
      {backgroundLocation && (
        <Routes>
          <Route path="/capture" element={<CaptureModal />} />
        </Routes>
      )}

      {/* Bottom tab bar — hidden during full-screen sleep ritual */}
      {!isSleepRitual && <BottomTabBar />}
    </ThemeContext.Provider>
  );
}

function CaptureBackdrop(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(-1)}
      aria-label="關閉"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'color-mix(in srgb, var(--bg-overlay) 55%, transparent)',
        backdropFilter: 'blur(8px) saturate(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(0.8)',
        animation: 'backdrop-in 200ms cubic-bezier(0.2, 0, 0, 1) both',
      }}
    />
  );
}

function CaptureModal(): JSX.Element {
  return (
    <>
      <CaptureBackdrop />
      <div
        style={{
          position: 'fixed',
          top: '8dvh',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 45,
          borderRadius: '20px 20px 0 0',
          background: 'var(--bg-raised)',
          boxShadow: '0 -2px 48px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheet-up 260ms cubic-bezier(0.2, 0, 0, 1) both',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px', flexShrink: 0 }}>
          <div style={{ width: 32, height: 3.5, borderRadius: 2, background: 'var(--border-default)' }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Capture isSheet />
        </div>
      </div>
    </>
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
