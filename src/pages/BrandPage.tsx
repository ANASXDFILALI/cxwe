import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MessageSquare, Tag, Truck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Brand, Product } from '../types';

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: br } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!br) { navigate('/catalog', { replace: true }); return; }
      setBrand(br);

      const { data: prods } = await supabase
        .from('products')
        .select('*, category:categories(name,slug), brand:brands(name,slug), supplier:suppliers(name,slug)')
        .eq('marque_id', br.id)
        .eq('is_active', true)
        .order('sort_order');

      setProducts((prods || []) as Product[]);
      setLoading(false);
    })();
  }, [slug, navigate]);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => { if (p.category?.name) map.set(p.category.name, p.category.name); });
    return [...map.keys()].sort();
  }, [products]);

  const supplierNames = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => { if (p.supplier?.name) map.set(p.supplier.name, p.supplier.name); });
    return [...map.keys()].sort();
  }, [products]);

  const filtered = useMemo(() => products.filter(p => {
    if (filterCategory && p.category?.name !== filterCategory) return false;
    if (filterSupplier && p.supplier?.name !== filterSupplier) return false;
    return true;
  }), [products, filterCategory, filterSupplier]);

  const hasFilters = filterCategory || filterSupplier;
  const hasFilterOptions = categoryNames.length > 0 || supplierNames.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-ma-cream pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-8 bg-stone-200 rounded w-48 animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-ma-sand animate-pulse h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="min-h-screen bg-ma-cream">
      {/* Header */}
      <div className="bg-gradient-to-b from-ma-navy to-[#0A1833] pt-24 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Catalogue
          </Link>
          <div className="flex items-center gap-4">
            {brand.logo_url && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 shrink-0">
                <img src={brand.logo_url} alt={brand.name} className="h-12 w-auto object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{brand.name}</h1>
              {brand.description && (
                <p className="text-stone-400 mt-1 text-sm max-w-xl">{brand.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Filters */}
        {hasFilterOptions && (
          <div className="mb-6 space-y-3">
            {supplierNames.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide shrink-0">
                  <Truck className="w-3.5 h-3.5" /> Grossiste
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {supplierNames.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterSupplier(filterSupplier === s ? '' : s)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        filterSupplier === s
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {categoryNames.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide shrink-0">
                  <Tag className="w-3.5 h-3.5" /> Catégorie
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categoryNames.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilterCategory(filterCategory === c ? '' : c)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        filterCategory === c
                          ? 'bg-ma-red text-white border-ma-red'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-ma-red'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilters && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-stone-400">
                  {filtered.length} produit{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => { setFilterCategory(''); setFilterSupplier(''); }}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <X className="w-3 h-3" /> Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-14 h-14 text-stone-300 mx-auto mb-4" />
            <h3 className="text-stone-500 font-medium mb-2">Aucun produit disponible</h3>
            <p className="text-stone-400 text-sm mb-6">
              Contactez-nous pour la disponibilité des produits {brand.name}.
            </p>
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 bg-ma-red hover:bg-[#9B1E24] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Demander un devis
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">Aucun produit pour ces filtres</p>
            <button
              onClick={() => { setFilterCategory(''); setFilterSupplier(''); }}
              className="mt-3 text-sm text-ma-red hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {!hasFilters && (
              <p className="text-stone-500 text-sm mb-6">
                {products.length} produit{products.length !== 1 ? 's' : ''} — {brand.name}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuote={p => setQuoteProduct(p)}
                />
              ))}
            </div>
          </>
        )}

        {/* CTA banner */}
        <div className="mt-12 bg-gradient-to-br from-ma-navy to-[#0A1833] rounded-2xl p-8 text-center">
          <h3 className="text-white font-semibold mb-2">Intéressé par {brand.name} ?</h3>
          <p className="text-stone-400 text-sm mb-5">
            Obtenez un devis personnalisé avec tailles, conditionnement et tarifs export.
          </p>
          <Link
            to={`/quote?brand=${encodeURIComponent(brand.name)}`}
            className="inline-flex items-center gap-2 bg-ma-red hover:bg-[#9B1E24] text-white text-sm font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Devis pour {brand.name}
          </Link>
        </div>
      </div>

      {/* Quick quote modal */}
      {quoteProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setQuoteProduct(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-stone-800 mb-1">Demande de devis</h3>
            {quoteProduct.supplier?.name && (
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wide mb-2">
                {quoteProduct.supplier.name}
              </p>
            )}
            <p className="text-stone-500 text-sm mb-4">
              Produit sélectionné : <strong>{quoteProduct.name}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setQuoteProduct(null)}
                className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
              <Link
                to={`/quote?product=${encodeURIComponent(quoteProduct.name)}&brand=${encodeURIComponent(brand.name)}`}
                className="flex-1 bg-ma-red hover:bg-[#9B1E24] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
              >
                Continuer
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
