/**
 * Moderation Layout - Sidebar cho steward pages
 */

import { NavLink, Outlet } from 'react-router-dom';

export default function ModerationLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-stone-50">
      <aside
        aria-label="Moderation navigation"
        className="w-64 border-r border-stone-200 bg-white"
      >
        <div className="p-4 border-b border-stone-200">
          <h2 className="text-sm font-semibold text-stone-900 uppercase">
            Moderation
          </h2>
        </div>
        <nav className="p-2">
          <NavItem to="/steward/moderation/queue" label="Queue" />
          <NavItem to="/steward/moderation/stats" label="Stats" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? 'bg-amber-100 text-amber-900 font-medium'
            : 'text-stone-700 hover:bg-stone-100'
        }`
      }
    >
      {label}
    </NavLink>
  );
}