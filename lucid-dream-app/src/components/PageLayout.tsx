import Navbar from './Navbar';

interface PageLayoutProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({
  title,
  showBack = false,
  onBackClick,
  rightActions,
  children,
  className = '',
}: PageLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-primary">
      <Navbar
        title={title}
        showBack={showBack}
        onBackClick={onBackClick}
        rightActions={rightActions}
      />
      <main
        className={`flex-1 overflow-y-auto px-4 py-6 ${className}`}
      >
        {children}
      </main>
    </div>
  );
}
