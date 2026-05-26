import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Brand } from '../types';

interface Props {
  brand: Brand;
  productCount?: number;
}

export default function BrandCard({ brand, productCount }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [slide, setSlide] = useState(0);
  const [animated, setAnimated] = useState(true);
  const fetchedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startTimer = (count: number) => {
    stop();
    if (count < 2) return;
    timerRef.current = setInterval(() => {
      setAnimated(true);
      setSlide(s => s + 1);
    }, 1600);
  };

  const handleMouseEnter = async () => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      const { data } = await supabase
        .from('products')
        .select('image_url')
        .eq('marque_id', brand.id)
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .limit(7);
      const imgs = (data || []).map((p: { image_url: string }) => p.image_url).filter(Boolean) as string[];
      setImages(imgs);
      startTimer(imgs.length);
    } else {
      startTimer(images.length);
    }
  };

  const handleMouseLeave = () => {
    stop();
    setAnimated(false);
    setSlide(0);
  };

  const handleTransitionEnd = () => {
    if (images.length > 1 && slide >= images.length) {
      setAnimated(false);
      setSlide(0);
    }
  };

  useEffect(() => () => stop(), []);

  const strip = images.length > 1 ? [...images, images[0]] : images;
  const N = Math.max(strip.length, 1);
  const translatePct = (slide * 100) / N;
  const activeIdx = images.length > 0 ? slide % images.length : 0;

  return (
    <Link
      to={`/brand/${brand.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-ma-sand/60"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-[#0F2044] to-[#1A3570] overflow-hidden">

        {strip.length > 0 ? (
          <div
            className="absolute inset-0 flex h-full"
            style={{
              width: `${N * 100}%`,
              transform: `translateX(-${translatePct}%)`,
              transition: animated ? 'transform 550ms cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {strip.map((src, i) => (
              <div key={i} className="relative h-full shrink-0" style={{ width: `${100 / N}%` }}>
                <img src={src} alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {brand.logo_url
              ? <img src={brand.logo_url} alt={brand.name} className="max-h-20 max-w-[70%] object-contain opacity-70" />
              : <Package className="w-12 h-12 text-blue-300" />
            }
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Brand logo overlay */}
        {brand.logo_url && strip.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow">
              <img src={brand.logo_url} alt={brand.name} className="h-6 w-auto object-contain" />
            </div>
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <span key={i} className={`block rounded-full transition-all duration-300 ${
                i === activeIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
              }`} />
            ))}
          </div>
        )}

        {/* Product count badge */}
        {productCount !== undefined && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-bold text-white bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {productCount} produit{productCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-stone-800 text-sm leading-snug group-hover:text-ma-navy transition-colors">
          {brand.name}
        </h3>
        {brand.description && (
          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">{brand.description}</p>
        )}
        <div className="flex items-center gap-1 mt-3 text-ma-green text-xs font-medium">
          <span>Voir les produits</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
