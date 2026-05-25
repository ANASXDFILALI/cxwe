import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Award, Truck, Users, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CategoryCard from '../components/CategoryCard';
import type { Category } from '../types';

const STATS = [
  { value: '33+', label: 'Catégories produits' },
  { value: '100+', label: 'Références disponibles' },
  { value: '50+', label: 'Pays desservis' },
  { value: '15+', label: "Années d'expérience" },
];

const FEATURES = [
  {
    icon: Award,
    title: 'Qualité Certifiée',
    description: 'Produits sourcés auprès de producteurs marocains certifiés, conformes aux normes internationales.',
  },
  {
    icon: Globe,
    title: 'Export Mondial',
    description: 'Nous gérons la logistique et la documentation pour une livraison fluide partout dans le monde.',
  },
  {
    icon: Truck,
    title: 'Conditionnement Sur Mesure',
    description: 'Tailles, emballages et étiquetages personnalisés selon vos marchés cibles.',
  },
  {
    icon: Users,
    title: 'Suivi Dédié',
    description: 'Un interlocuteur dédié et des proformas générées sous 24 h pour chaque demande.',
  },
];

/* ── Moroccan SVG pattern defs ─────────────────────────────────────────────── */

function MoroccanPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* ── Zellige tile: 8-pointed star ── */}
        <pattern id="zellige" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" />
          {/* outer square cross */}
          <line x1="40" y1="0"  x2="40" y2="80" stroke="#C89B3C" strokeWidth="0.4" strokeOpacity="0.25" />
          <line x1="0"  y1="40" x2="80" y2="40" stroke="#C89B3C" strokeWidth="0.4" strokeOpacity="0.25" />
          <line x1="0"  y1="0"  x2="80" y2="80" stroke="#C89B3C" strokeWidth="0.3" strokeOpacity="0.15" />
          <line x1="80" y1="0"  x2="0"  y2="80" stroke="#C89B3C" strokeWidth="0.3" strokeOpacity="0.15" />
          {/* 8-pointed star at centre */}
          <polygon
            points="40,20 45,35 60,35 48,44 52,59 40,50 28,59 32,44 20,35 35,35"
            fill="none" stroke="#D4A853" strokeWidth="0.6" strokeOpacity="0.3"
          />
          {/* inner diamond */}
          <polygon points="40,28 47,40 40,52 33,40" fill="none" stroke="#D4A853" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* corner dots */}
          <circle cx="0"  cy="0"  r="1.5" fill="#C89B3C" fillOpacity="0.2" />
          <circle cx="80" cy="0"  r="1.5" fill="#C89B3C" fillOpacity="0.2" />
          <circle cx="0"  cy="80" r="1.5" fill="#C89B3C" fillOpacity="0.2" />
          <circle cx="80" cy="80" r="1.5" fill="#C89B3C" fillOpacity="0.2" />
        </pattern>

        {/* ── Finer arabesque grid ── */}
        <pattern id="arabesque" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q10 10 20 20 Q30 30 40 20" fill="none" stroke="#C89B3C" strokeWidth="0.35" strokeOpacity="0.18" />
          <path d="M0 20 Q10 30 20 20 Q30 10 40 20" fill="none" stroke="#C89B3C" strokeWidth="0.35" strokeOpacity="0.18" />
          <path d="M20 0 Q30 10 20 20 Q10 30 20 40" fill="none" stroke="#C89B3C" strokeWidth="0.35" strokeOpacity="0.18" />
          <path d="M20 0 Q10 10 20 20 Q30 30 20 40" fill="none" stroke="#C89B3C" strokeWidth="0.35" strokeOpacity="0.18" />
        </pattern>

        {/* ── Radial vignette ── */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="#1C0F00" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#0D0700" stopOpacity="0.85" />
        </radialGradient>

        {/* ── Top glow ── */}
        <radialGradient id="topGlow" cx="50%" cy="0%" r="60%">
          <stop offset="0%"   stopColor="#C89B3C" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C89B3C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* arabesque fine layer */}
      <rect width="100%" height="100%" fill="url(#arabesque)" />

      {/* zellige bold layer */}
      <rect width="100%" height="100%" fill="url(#zellige)" />

      {/* vignette */}
      <rect width="100%" height="100%" fill="url(#vignette)" />

      {/* top amber glow */}
      <rect width="100%" height="100%" fill="url(#topGlow)" />

      {/* ── Decorative arched border ── */}
      {/* top border line */}
      <line x1="0" y1="2" x2="100%" y2="2" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="0" y1="6" x2="100%" y2="6" stroke="#C89B3C" strokeWidth="0.4" strokeOpacity="0.2" />
      {/* bottom border line */}
      <line x1="0" y1="calc(100% - 2px)" x2="100%" y2="calc(100% - 2px)" stroke="#C89B3C" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="0" y1="calc(100% - 6px)" x2="100%" y2="calc(100% - 6px)" stroke="#C89B3C" strokeWidth="0.4" strokeOpacity="0.2" />
    </svg>
  );
}

/* ── Corner ornament (4 corners) ───────────────────────────────────────────── */
function CornerOrnament({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms: Record<string, string> = {
    tl: 'translate(24,24)',
    tr: 'translate(calc(100% - 24px),24) scale(-1,1) translate(-120,0)',
    bl: 'translate(24,calc(100% - 24px)) scale(1,-1) translate(0,-120)',
    br: 'translate(calc(100% - 24px),calc(100% - 24px)) scale(-1,-1) translate(-120,-120)',
  };
  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top:    pos.startsWith('t') ? 0 : undefined,
        bottom: pos.startsWith('b') ? 0 : undefined,
        left:   pos.endsWith('l')   ? 0 : undefined,
        right:  pos.endsWith('r')   ? 0 : undefined,
        width: 140, height: 140,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={transforms[pos]} opacity="0.55">
        {/* L-bracket lines */}
        <line x1="0"  y1="0" x2="80" y2="0"  stroke="#C89B3C" strokeWidth="1.2" />
        <line x1="0"  y1="0" x2="0"  y2="80" stroke="#C89B3C" strokeWidth="1.2" />
        <line x1="6"  y1="6" x2="50" y2="6"  stroke="#C89B3C" strokeWidth="0.5" strokeOpacity="0.6" />
        <line x1="6"  y1="6" x2="6"  y2="50" stroke="#C89B3C" strokeWidth="0.5" strokeOpacity="0.6" />
        {/* corner star mini */}
        <polygon points="0,0 5,12 18,12 8,19 12,32 0,24 -12,32 -8,19 -18,12 -5,12"
          fill="none" stroke="#D4A853" strokeWidth="0.8" strokeOpacity="0.7" />
        {/* small diamond */}
        <polygon points="0,-6 6,0 0,6 -6,0" fill="#C89B3C" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

/* ── Central medallion (horseshoe arch outline) ─────────────────────────────── */
function CentralMedallion() {
  return (
    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[min(520px,90vw)] h-[min(520px,90vw)]"
      viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
      {/* outer ring */}
      <circle cx="260" cy="260" r="240" fill="none" stroke="#C89B3C" strokeWidth="0.6" strokeOpacity="0.18" strokeDasharray="4 6" />
      {/* middle ring */}
      <circle cx="260" cy="260" r="200" fill="none" stroke="#C89B3C" strokeWidth="0.5" strokeOpacity="0.12" />
      {/* 16-point star — outer */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * 360) / 16 * Math.PI / 180;
        const a2 = ((i + 0.5) * 360) / 16 * Math.PI / 180;
        const x1 = 260 + 240 * Math.cos(a);
        const y1 = 260 + 240 * Math.sin(a);
        const x2 = 260 + 205 * Math.cos(a2);
        const y2 = 260 + 205 * Math.sin(a2);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C89B3C" strokeWidth="0.5" strokeOpacity="0.22" />;
      })}
      {/* 8-point inner star */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a  = ((i * 45) - 90) * Math.PI / 180;
        const a2 = ((i * 45 + 22.5) - 90) * Math.PI / 180;
        const ox = 260 + 200 * Math.cos(a);
        const oy = 260 + 200 * Math.sin(a);
        const ix = 260 + 140 * Math.cos(a2);
        const iy = 260 + 140 * Math.sin(a2);
        return (
          <g key={i}>
            <line x1={ox} y1={oy} x2={ix} y2={iy} stroke="#D4A853" strokeWidth="0.6" strokeOpacity="0.25" />
            <circle cx={ox} cy={oy} r="3" fill="#C89B3C" fillOpacity="0.3" />
          </g>
        );
      })}
      {/* inner medallion circle */}
      <circle cx="260" cy="260" r="90" fill="none" stroke="#D4A853" strokeWidth="0.7" strokeOpacity="0.2" />
    </svg>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Dark overlay + Moroccan pattern overlay */}
        <div className="absolute inset-0 bg-stone-900/60" />
        <MoroccanPattern />

        {/* Corner ornaments */}
        <CornerOrnament pos="tl" />
        <CornerOrnament pos="tr" />
        <CornerOrnament pos="bl" />
        <CornerOrnament pos="br" />

        {/* Central medallion rings */}
        <CentralMedallion />

        {/* Horizontal separator lines */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
          <div className="flex items-center gap-0 opacity-20">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-400" />
            <div className="w-2 h-2 rotate-45 bg-amber-400 mx-3 shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>

        {/* ── Hero content ── */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

          {/* Decorative top divider */}
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-amber-400 opacity-80">
              <polygon points="10,1 12.5,7.5 19,7.5 13.5,12 15.5,19 10,15 4.5,19 6.5,12 1,7.5 7.5,7.5"
                fill="currentColor" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/35 rounded-full px-5 py-1.5 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">
              Exportateur Certifié — Maroc
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white leading-tight mb-3 tracking-tight">
            Catalogue Export
            <span className="block mt-1" style={{ color: '#D4A853' }}>
              Produits Marocains
            </span>
          </h1>

          {/* Arabic ornamental subtitle */}
          <p className="text-amber-600/70 text-[10px] sm:text-sm tracking-[0.12em] sm:tracking-[0.3em] mb-5 font-light select-none">
            ✦ &nbsp; المغرب &nbsp; · &nbsp; جودة عالمية &nbsp; · &nbsp; تصدير &nbsp; ✦
          </p>

          <p className="text-stone-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-10 leading-relaxed px-2">
            33+ catégories de produits alimentaires authentiques — huiles d'olive, argan,
            dattes, thés, fruits de mer surgelés et bien plus. Proforma sous 24 h.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="group relative overflow-hidden bg-amber-500 hover:bg-amber-400 text-white font-bold px-9 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/40"
            >
              {/* shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Explorer le Catalogue</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/quote"
              className="bg-white/8 hover:bg-white/15 text-white font-semibold px-9 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-amber-500/30 hover:border-amber-500/60"
            >
              Demander une Proforma
            </Link>
          </div>

          {/* Decorative bottom divider */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/40" />
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-amber-500/50">
              <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.2 9.8,12 6,9.2 2.2,12 3.5,7.2 0,4.5 4.5,4.5" fill="currentColor" />
            </svg>
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-amber-500/30">
              <polygon points="4,0 5,3 8,3 5.5,4.8 6.5,8 4,6 1.5,8 2.5,4.8 0,3 3,3" fill="currentColor" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-amber-500/50">
              <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.2 9.8,12 6,9.2 2.2,12 3.5,7.2 0,4.5 4.5,4.5" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-amber-500/50 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden py-10" style={{ background: 'linear-gradient(135deg,#7C4A1A 0%,#9C5E22 40%,#7C4A1A 100%)' }}>
        {/* mini pattern overlay on stats bar */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
          <pattern id="statsPat" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <polygon points="15,2 18,11 27,11 20,17 23,26 15,21 7,26 10,17 3,11 12,11" fill="none" stroke="#D4A853" strokeWidth="0.7" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#statsPat)" />
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-amber-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-300" />
            <svg width="14" height="14" viewBox="0 0 14 14" className="text-amber-500"><polygon points="7,0 8.5,5 14,5 9.5,8 11,14 7,10.5 3,14 4.5,8 0,5 5.5,5" fill="currentColor" /></svg>
            <div className="h-px w-10 bg-amber-300" />
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-3">Catégories de Produits</h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm leading-relaxed">
            Parcourez notre gamme complète de produits alimentaires marocains à l'export.
            Contactez-nous pour les tailles, conditionnements et tarifs.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-100 animate-pulse h-52" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm transition-colors"
          >
            Voir le catalogue complet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* subtle corner motif */}
        <svg className="absolute right-0 top-0 opacity-5 pointer-events-none" width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx="300" cy="0" r={40 + i * 40} fill="none" stroke="#C89B3C" strokeWidth="1" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45) * Math.PI / 180;
            return <line key={i} x1="300" y1="0" x2={300 + 280 * Math.cos(a)} y2={280 * Math.sin(a)} stroke="#C89B3C" strokeWidth="0.5" />;
          })}
        </svg>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-amber-300" />
              <svg width="14" height="14" viewBox="0 0 14 14" className="text-amber-500"><polygon points="7,0 8.5,5 14,5 9.5,8 11,14 7,10.5 3,14 4.5,8 0,5 5.5,5" fill="currentColor" /></svg>
              <div className="h-px w-10 bg-amber-300" />
            </div>
            <h2 className="text-3xl font-bold text-stone-800 mb-3">Pourquoi Nous Choisir</h2>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Notre expertise en export alimentaire marocain au service de vos marchés internationaux.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-100 transition-colors">
                  <f.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-semibold text-stone-800 mb-2 text-sm">{f.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: '#1A0D04' }}>
        {/* mini zellige pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctaPat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,6 36,24 54,24 40,35 46,53 30,42 14,53 20,35 6,24 24,24"
                fill="none" stroke="#C89B3C" strokeWidth="0.5" strokeOpacity="0.18" />
              <circle cx="30" cy="30" r="4" fill="none" stroke="#C89B3C" strokeWidth="0.4" strokeOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctaPat)" />
          <rect width="100%" height="100%" fill="radial-gradient(ellipse at center,transparent 40%,#1A0D04 100%)" />
        </svg>
        {/* corner lines */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-amber-600/30" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-amber-600/30" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-amber-600/30" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-amber-600/30" />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-600/50" />
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-amber-500">
              <polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-600/50" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à Passer Commande ?</h2>
          <p className="text-stone-400 mb-8 text-sm leading-relaxed max-w-lg mx-auto">
            Remplissez notre formulaire de demande de devis — notre équipe vous répond sous 24 h
            avec la proforma, les disponibilités et les options de transport.
          </p>
          <Link
            to="/quote"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-amber-500/30"
          >
            Demander une Proforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
