import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../api.js';

export default function Layout() {
  const navigate = useNavigate();
  const loggedIn = !!getToken();
  const link = ({ isActive }) => `text-sm ${isActive ? 'font-semibold text-lotus' : 'text-stone-600 hover:text-ink'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-serif text-2xl font-bold tracking-wide text-lotus-dark">
            White Lotus <span className="hidden font-medium text-stone-500 sm:inline">Group</span>
          </Link>
          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={link}>Properties</NavLink>
            <NavLink to="/admin" className={link}>Admin</NavLink>
            {loggedIn && (
              <button
                className="text-sm text-stone-500 hover:text-ink"
                onClick={() => { clearToken(); navigate('/admin/login'); }}
              >
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        White Lotus Group · Bespoke residences in Bengaluru
      </footer>
    </div>
  );
}
