import { NavLink } from 'react-router-dom';
import Icon, { IconName } from './ui/Icon';

interface Tab {
  to: string;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { to: '/home',       label: '首頁', icon: 'home'    },
  { to: '/explore',    label: '探索', icon: 'compass' },
  { to: '/dreamscape', label: '夢景', icon: 'layers'  },
  { to: '/capture',    label: '記錄', icon: 'feather' },
];

export default function BottomTabBar(): JSX.Element {
  return (
    <nav
      aria-label="主導覽"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-base/98 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              aria-label={tab.label}
              className="relative flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-fast outline-none focus-visible:bg-inset"
            >
              {({ isActive }) => (
                <>
                  {/* 頂部細線指示器 */}
                  <span
                    className={`absolute top-0 left-6 right-6 h-px transition-all duration-normal ${
                      isActive ? 'bg-accent-default' : 'bg-transparent'
                    }`}
                  />

                  <Icon
                    name={tab.icon}
                    size={20}
                    strokeWidth={isActive ? 1.75 : 1.25}
                    className={`transition-colors duration-fast ${
                      isActive ? 'text-accent' : 'text-tertiary'
                    }`}
                  />

                  <span
                    className={`font-ui text-caption tracking-wide transition-colors duration-fast ${
                      isActive ? 'text-accent' : 'text-tertiary'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
