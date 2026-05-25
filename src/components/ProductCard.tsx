import { Link } from 'react-router-dom';
import { Package, CheckCircle, ArrowRight, Thermometer } from 'lucide-react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onQuote?: (product: Product) => void;
}

const TEMP_COLORS: Record<string, string> = {
  'Ambiante':   'bg-stone-700/70 text-stone-100',
  'Réfrigéré':  'bg-blue-600/80 text-blue-50',
  'Frais':      'bg-cyan-600/80 text-cyan-50',
  'Surgelé':    'bg-indigo-700/80 text-indigo-100',
};

export default function ProductCard({ product, onQuote }: Props) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 overflow-hidden flex flex-col">

      {/* ── Wholesaler / Supplier header ─────────────────────────────────── */}
      {product.supplier?.name && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-1.5">
          <span className="text-xs font-bold text-stone-800 uppercase tracking-wide truncate">
            {product.supplier.name}
          </span>
        </div>
      )}

      {/* ── Image ────────────────────────────────────────────────────────── */}
      <Link to={`/product/${product.id}`} className="relative mt-2 mx-3 h-40 bg-stone-100 overflow-hidden rounded-xl block shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-stone-300" />
          </div>
        )}

        {/* Status badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && (
            <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-md shadow">NOUVEAU</span>
          )}
          {product.is_promo && (
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-md shadow">PROMO</span>
          )}
        </div>

        {/* Temperature — bottom right */}
        {product.temperature && product.temperature !== 'Ambiante' && (
          <span className={`absolute bottom-2 right-2 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${TEMP_COLORS[product.temperature] || TEMP_COLORS['Ambiante']}`}>
            <Thermometer className="w-3 h-3" />
            {product.temperature}
          </span>
        )}
      </Link>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">

        {/* Brand */}
        {product.brand?.name && (
          <p className="text-xs text-blue-600 font-semibold mb-0.5 truncate">{product.brand.name}</p>
        )}

        {/* Product name */}
        <Link to={`/product/${product.id}`} className="hover:text-amber-600 transition-colors">
          <h3 className="font-semibold text-stone-800 text-sm leading-snug">{product.name}</h3>
        </Link>

        {/* Régimes */}
        {product.regimes && product.regimes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {product.regimes.slice(0, 2).map(r => (
              <span key={r} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-stone-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{product.description}</p>
        )}

        {/* Details checklist */}
        {product.details && product.details.length > 0 && (
          <ul className="mt-2.5 space-y-1 flex-1">
            {product.details.slice(0, 3).map((d, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
            {product.details.length > 3 && (
              <li className="text-xs text-stone-400 pl-4">+{product.details.length - 3} autres</li>
            )}
          </ul>
        )}

        {/* MOQ + origin footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-50 text-xs text-stone-400">
          {product.commande_min > 1 && <span>MOQ : {product.commande_min}</span>}
          {product.pays_origine && <span className="ml-auto">{product.pays_origine}</span>}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link to={`/product/${product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-medium py-2 rounded-lg transition-colors border border-stone-200">
            Voir détails <ArrowRight className="w-3 h-3" />
          </Link>
          {onQuote && (
            <button onClick={() => onQuote(product)}
              className="flex-1 bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 border border-amber-200 hover:border-amber-500">
              Devis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
