import { useNavigate } from 'react-router-dom';
import Icon from './ui/Icon';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
  transparent?: boolean;
}

export default function Navbar({
  title,
  showBack = false,
  onBackClick,
  rightActions,
  transparent = false,
}: NavbarProps): JSX.Element {
  const navigate = useNavigate();

  const handleBack = (): void => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 ${
        transparent
          ? 'bg-transparent'
          : 'border-b border-border-subtle bg-base/98 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側：返回按鈕 */}
        <div className="w-10 flex-shrink-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center text-tertiary transition-colors duration-fast hover:text-secondary"
              aria-label="返回上一頁"
            >
              <Icon name="arrowLeft" size={18} strokeWidth={1.25} />
            </button>
          )}
        </div>

        {/* 中間：頁面標題 */}
        {title ? (
          <h1 className="flex-1 text-center font-serif text-small font-light text-tertiary tracking-wider">
            {title}
          </h1>
        ) : (
          <div className="flex-1" />
        )}

        {/* 右側：操作按鈕 */}
        <div className="flex w-10 flex-shrink-0 items-center justify-end">
          {rightActions}
        </div>
      </div>
    </header>
  );
}
