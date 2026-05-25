import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Package, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  categories: number;
  products: number;
  quotes: number;
  newQuotes: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ categories: 0, products: 0, quotes: 0, newQuotes: 0 });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catRes, prodRes, quoteRes, newQuoteRes, recentRes] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('quote_requests').select('id', { count: 'exact', head: true }),
        supabase.from('quote_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('quote_requests').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        categories: catRes.count || 0,
        products: prodRes.count || 0,
        quotes: quoteRes.count || 0,
        newQuotes: newQuoteRes.count || 0,
      });
      setRecentQuotes(recentRes.data || []);
      setLoading(false);
    })();
  }, []);

  const STAT_CARDS = [
    { label: 'Categories', value: stats.categories, icon: Tag, to: '/admin/categories', color: 'bg-amber-500' },
    { label: 'Products', value: stats.products, icon: Package, to: '/admin/products', color: 'bg-emerald-500' },
    { label: 'Total Quotes', value: stats.quotes, icon: MessageSquare, to: '/admin/quotes', color: 'bg-blue-500' },
    { label: 'New Quotes', value: stats.newQuotes, icon: TrendingUp, to: '/admin/quotes', color: 'bg-red-500' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-red-100 text-red-700',
    in_review: 'bg-amber-100 text-amber-700',
    responded: 'bg-blue-100 text-blue-700',
    closed: 'bg-stone-100 text-stone-600',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome to the Morocco Food Export admin panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(card => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-800">
              {loading ? <span className="text-stone-300">—</span> : card.value}
            </div>
            <div className="text-stone-500 text-xs mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800 text-sm">Recent Quote Requests</h2>
          <Link to="/admin/quotes" className="text-amber-600 hover:text-amber-700 text-xs font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentQuotes.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-sm">
            No quote requests yet.
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {recentQuotes.map(q => (
              <Link
                key={q.id}
                to="/admin/quotes"
                className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
              >
                <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 text-sm truncate">{q.company_name}</div>
                  <div className="text-stone-400 text-xs truncate">{q.contact_name} — {q.country}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>
                    {q.status.replace('_', ' ')}
                  </span>
                  <span className="text-stone-400 text-xs hidden sm:block">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Add Category', to: '/admin/categories', icon: Tag },
          { label: 'Add Product', to: '/admin/products', icon: Package },
          { label: 'View Quotes', to: '/admin/quotes', icon: MessageSquare },
        ].map(a => (
          <Link
            key={a.label}
            to={a.to}
            className="bg-white border border-stone-100 rounded-xl px-5 py-4 flex items-center gap-3 hover:border-amber-200 hover:bg-amber-50 transition-all text-sm font-medium text-stone-700 hover:text-amber-700"
          >
            <a.icon className="w-4 h-4" />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

