import { NavLink } from 'react-router-dom';
import Icon, { IconName } from './ui/Icon';

interface Tab {
  to: string;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { to: '/home', label: '首頁', icon: 'home' },
  { to: '/explore', label: '探索', icon: 'compass' },
  { to: '/dreamscape', label: '夢景', icon: 'layers' },
  { to: '/capture', label: '記錄', icon: 'feather' },
];

export default function BottomTabBar(): JSX.Element {
  return (
    <nav
      aria-label="主導覽"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-base/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-fast ${
                  isActive
                    ? 'text-accent'
                    : 'text-tertiary hover:text-secondary active:text-secondary'
                }`
              }
              aria-label={tab.label}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={tab.icon}
                    size={22}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className="text-caption font-ui">{tab.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
