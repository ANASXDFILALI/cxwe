import { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import {
  Globe, LayoutDashboard, Tag, Package, MessageSquare,
  LogOut, Menu, ChevronRight, Building2, Truck, Handshake,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Catégories', to: '/admin/categories', icon: Tag },
  { label: 'Produits', to: '/admin/products', icon: Package },
  { label: 'Marques', to: '/admin/brands', icon: Building2 },
  { label: 'Fournisseurs', to: '/admin/suppliers', icon: Truck },
  { label: 'Devis', to: '/admin/quotes', icon: MessageSquare },
  { label: 'Partenariats', to: '/admin/partners', icon: Handshake },
];

export default function AdminLayout({ isLoggedIn, onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isLoggedIn) return <Navigate to="/admin" replace />;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-stone-700 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Morocco Food Export"
          className="h-10 w-auto shrink-0"
        />
        <div className="min-w-0">
          <div className="text-white font-bold text-xs truncate">Admin Panel</div>
          <div className="text-stone-400 text-xs truncate">Morocco Food Export</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.to)
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-700'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {isActive(item.to) && <ChevronRight className="w-3 h-3 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-stone-700 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-white hover:bg-stone-700 transition-all"
        >
          <Globe className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-red-400 hover:bg-stone-700 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-stone-800 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-stone-800 flex flex-col">
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-stone-800 text-sm">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

