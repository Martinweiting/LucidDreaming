import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon, { IconName } from './ui/Icon';

interface Tab {
  to: string;
  label: string;
  icon: IconName;
  isModal?: boolean;
}

const TABS: Tab[] = [
  { to: '/home',        label: '首頁', icon: 'home'      },
  { to: '/explore',     label: '探索', icon: 'compass'   },
  { to: '/capture',     label: '記錄', icon: 'feather',   isModal: true },
  { to: '/incubation',  label: '孵化', icon: 'seedling'  },
  { to: '/lab',         label: '實驗', icon: 'flask'     },
];

export default function BottomTabBar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  function handleTabClick(tab: Tab): void {
    if (tab.isModal) {
      navigate(tab.to, { state: { backgroundLocation: location } });
    } else {
      navigate(tab.to);
    }
  }

  return (
    <nav
      aria-label="主導覽"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'color-mix(in srgb, var(--bg-base) 72%, transparent)',
        backdropFilter: 'blur(20px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.15)',
        borderTop: '1px solid color-mix(in srgb, var(--border-subtle) 55%, transparent)',
      }}
    >
      <ul style={{ display: 'flex', alignItems: 'stretch', margin: 0, padding: 0, listStyle: 'none' }}>
        {TABS.map((tab) => (
          <li key={tab.to} style={{ flex: 1 }}>
            <NavLink
              to={tab.to}
              aria-label={tab.label}
              onClick={(e) => {
                if (tab.isModal) {
                  e.preventDefault();
                  handleTabClick(tab);
                }
              }}
              style={{ display: 'block', textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: '10px 0 8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Top indicator line */}
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: '30%',
                    right: '30%',
                    height: 1,
                    borderRadius: 1,
                    background: isActive ? 'var(--accent-default)' : 'transparent',
                    transition: 'background 180ms cubic-bezier(0.2,0,0,1)',
                  }} />

                  <Icon
                    name={tab.icon}
                    size={20}
                    strokeWidth={isActive ? 1.75 : 1.25}
                    style={{
                      color: isActive ? 'var(--accent-default)' : 'var(--text-tertiary)',
                      transition: 'color 150ms cubic-bezier(0.2,0,0,1)',
                    }}
                  />

                  <span style={{
                    fontFamily: 'var(--font-ui, system-ui)',
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    color: isActive ? 'var(--accent-default)' : 'var(--text-tertiary)',
                    transition: 'color 150ms cubic-bezier(0.2,0,0,1)',
                  }}>
                    {tab.label}
                  </span>
                </button>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
