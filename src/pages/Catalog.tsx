import { useEffect, useState } from 'react';
import { Search, LayoutGrid, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CategoryCard from '../components/CategoryCard';
import BrandCard from '../components/BrandCard';
import type { Category, Brand } from '../types';

export default function Catalog() {
  const [view, setView] = useState<'categories' | 'brands'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('brands').select('*').eq('is_active', true).order('name'),
    ]).then(([{ data: cats }, { data: brnds }]) => {
      setCategories(cats || []);
      setBrands(brnds || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (view !== 'brands' || brands.length === 0) return;
    Promise.all(
      brands.map(b =>
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('marque_id', b.id)
          .eq('is_active', true)
          .then(({ count }) => ({ id: b.id, count: count ?? 0 }))
      )
    ).then(results => {
      const map: Record<string, number> = {};
      results.forEach(r => { map[r.id] = r.count; });
      setBrandCounts(map);
    });
  }, [view, brands]);

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-800 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Catalogue produits</h1>
          <p className="text-stone-400 text-sm max-w-xl mx-auto mb-6">
            Parcourez nos produits alimentaires marocains authentiques disponibles à l'export.
          </p>

          {/* View toggle */}
          <div className="inline-flex bg-stone-700 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setView('categories'); setSearch(''); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'categories' ? 'bg-amber-500 text-white shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Catégories
            </button>
            <button
              onClick={() => { setView('brands'); setSearch(''); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'brands' ? 'bg-amber-500 text-white shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Marques
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={view === 'categories' ? 'Rechercher une catégorie…' : 'Rechercher une marque…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-200 animate-pulse h-52" />
            ))}
          </div>
        ) : view === 'categories' ? (
          filteredCats.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-lg font-medium">Aucune catégorie trouvée</p>
              <p className="text-sm mt-2">Essayez un autre terme</p>
            </div>
          ) : (
            <>
              <p className="text-stone-500 text-sm mb-6">
                {filteredCats.length} {filteredCats.length === 1 ? 'catégorie' : 'catégories'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredCats.map((cat, i) => (
                  <CategoryCard key={cat.id} category={cat} index={i} />
                ))}
              </div>
            </>
          )
        ) : (
          filteredBrands.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-lg font-medium">Aucune marque trouvée</p>
              <p className="text-sm mt-2">Essayez un autre terme</p>
            </div>
          ) : (
            <>
              <p className="text-stone-500 text-sm mb-6">
                {filteredBrands.length} {filteredBrands.length === 1 ? 'marque' : 'marques'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBrands.map(b => (
                  <BrandCard key={b.id} brand={b} productCount={brandCounts[b.id]} />
                ))}
              </div>
            </>
          )
        )}

        {/* Contact note */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-medium text-sm">
            Contactez-nous pour les tailles, conditionnements et tarifs spécifiques.
          </p>
          <p className="text-amber-600 text-xs mt-1">
            filalianas0001@gmail.com — +212 605 268 946
          </p>
        </div>
      </div>
    </div>
  );
}
