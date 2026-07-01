import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/philosophers', label: '图鉴' },
  { path: '/quotes', label: '合集' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-ink-100/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-serif-en text-2xl font-semibold text-ink-900 tracking-tight">
            Stoa
          </span>
          <span className="text-ink-400 text-sm font-serif-cn hidden sm:inline">
            斯多亚廊柱
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-serif-cn text-sm tracking-wider transition-colors duration-300 no-underline ${
                location.pathname === item.path
                  ? 'text-ink-900'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
