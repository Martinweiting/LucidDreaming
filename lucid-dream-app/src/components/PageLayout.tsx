import Navbar from './Navbar';
import BottomTabBar from './BottomTabBar';

interface PageLayoutProps {
  title?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
  showTabBar?: boolean;
  transparentNav?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({
  title,
  showBack = false,
  onBackClick,
  rightActions,
  showTabBar = false,
  transparentNav = false,
  children,
  className = '',
}: PageLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Navbar
        title={title}
        showBack={showBack}
        onBackClick={onBackClick}
        rightActions={rightActions}
        transparent={transparentNav}
      />
      <main
        className={`flex-1 overflow-y-auto ${showTabBar ? 'pb-24' : 'pb-6'} ${className}`}
      >
        {children}
      </main>
      {showTabBar && <BottomTabBar />}
    </div>
  );
}
