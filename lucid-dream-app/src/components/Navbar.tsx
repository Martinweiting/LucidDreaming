import { useLocation, useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
}

export default function Navbar({
  title,
  showBack = false,
  onBackClick,
  rightActions,
}: NavbarProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (): void => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-4">
        {/* 左側：返回按鈕或空間 */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-normal hover:bg-bg-secondary hover:text-text-primary active:scale-95"
              title="返回"
              aria-label="返回上一頁"
            >
              ←
            </button>
          )}
        </div>

        {/* 中間：頁面標題 */}
        <h1 className="flex-1 text-center font-serif text-title font-light text-text-primary">
          {title}
        </h1>

        {/* 右側：操作按鈕 */}
        <div className="flex w-10 justify-end">
          {rightActions ? (
            rightActions
          ) : (
            <div className="flex gap-2">
              {/* 主頁時不顯示預設按鈕 */}
              {location.pathname !== '/home' && location.pathname !== '/' && (
                <Link
                  to="/home"
                  className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors duration-normal hover:bg-bg-secondary hover:text-text-primary"
                  title="首頁"
                  aria-label="返回首頁"
                >
                  🏠
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
