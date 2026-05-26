import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle, Send, Loader2,
  Package, Globe, Award, Truck, ChevronDown, ChevronUp,
  Leaf, Factory, BarChart3, Handshake,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  'Maroc','France','Espagne','Algérie','Tunisie','Égypte','Sénégal',
  "Côte d'Ivoire",'Mauritanie','Autre',
];

const CATEGORIES = [
  'Huiles (Olive / Argan)','Olives & Conserves','Épices & Aromates',
  'Légumineuses & Céréales','Fruits Secs & Dattes','Confiture & Miel',
  'Produits Laitiers','Viandes & Charcuterie','Poissons & Fruits de Mer',
  'Jus & Boissons','Thés & Tisanes','Pâtisseries & Gâteaux',
  'Couscous & Pâtes','Légumes & Fruits Frais','Surgelés','Autre',
];

const CERTIFICATIONS = [
  'Halal','Bio / Organique','Casher','ISO 22000','HACCP',
  'IFS Food','BRC','GlobalGAP','Fairtrade','Sans gluten','Autre',
];

const TARGET_MARKETS = [
  'France','Espagne','Italie','Allemagne','Pays-Bas','Belgique',
  'Royaume-Uni','États-Unis','Canada','Arabie Saoudite','Émirats Arabes Unis',
  'Sénégal',"Côte d'Ivoire",'Australie','Autre',
];

const BENEFITS = [
  { icon: Globe,    title: 'Réseau mondial',      desc: '50+ pays desservis, partenaires logistiques établis sur tous les continents.' },
  { icon: Award,    title: 'Conformité export',   desc: 'Nous gérons toute la documentation douanière, certificats et normes d\'import.' },
  { icon: Truck,    title: 'Logistique clé en main', desc: 'FCL, LCL, fret aérien — nous optimisons le transport selon vos volumes.' },
  { icon: BarChart3,'title': 'Visibilité marché', desc: 'Votre produit référencé dans notre catalogue B2B consulté par des acheteurs internationaux.' },
];

const INPUT = 'w-full border border-ma-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ma-navy focus:ring-2 focus:ring-ma-navy/5 transition bg-white';
const SELECT = `${INPUT} appearance-none`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckPill({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
        checked ? 'bg-ma-red text-white border-ma-red' : 'border-stone-200 text-stone-600 hover:border-ma-red'
      }`}>
      {label}
    </button>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Qui peut soumettre une demande de partenariat ?', a: 'Tout producteur, coopérative, ou entreprise agroalimentaire marocaine souhaitant accéder aux marchés internationaux via notre réseau d\'export.' },
  { q: 'Quelles certifications sont requises ?', a: 'Cela dépend du marché cible. Nous vous guidons pour obtenir les certifications nécessaires (Halal, Bio, HACCP, IFS…). Aucune certification n\'est obligatoire pour soumettre votre demande.' },
  { q: 'Quel est le volume minimum ?', a: 'Pas de volume minimum strict. Nous travaillons avec des producteurs de toutes tailles, des coopératives aux grandes industries. Précisez simplement votre capacité de production.' },
  { q: 'Combien de temps pour une réponse ?', a: 'Notre équipe commerciale vous contacte sous 72 h après réception de votre dossier.' },
  { q: 'Y a-t-il des frais pour rejoindre le réseau ?', a: 'L\'adhésion au catalogue est gratuite. Nous opérons sur un modèle de commission sur les ventes réalisées.' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="font-medium text-stone-800 text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-ma-red shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
      </button>
      {open && <p className="text-stone-500 text-sm pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Partner() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — Identité producteur
  const [producer, setProducer] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    country: 'Maroc',
    city: '',
    website: '',
  });

  // Step 2 — Produit
  const [product, setProduct] = useState({
    product_name: '',
    product_category: '',
    product_description: '',
    annual_capacity: '',
    certifications: [] as string[],
    packaging_types: '',
  });

  // Step 3 — Export & message
  const [xp, setXp] = useState({
    already_exporting: false,
    current_markets: [] as string[],
    target_markets: [] as string[],
    message: '',
  });

  const canProceed = () => {
    if (step === 1) return !!(producer.company_name && producer.contact_name && producer.email && producer.country);
    if (step === 2) return !!(product.product_name && product.product_category);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...producer,
      ...product,
      already_exporting: xp.already_exporting,
      current_markets: xp.current_markets.join(', '),
      target_markets: xp.target_markets.join(', '),
      message: xp.message,
    };

    const { error: err } = await supabase.from('collaboration_requests').insert([payload]);
    if (err) {
      console.error(err);
      setError("Envoi échoué. Contactez-nous directement à filalianas0001@gmail.com");
      setSubmitting(false);
    } else {
      setSubmitted(true);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-ma-cream flex items-center justify-center px-4 pt-16">
        <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Handshake className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Dossier reçu !</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            Merci <strong>{producer.contact_name}</strong> pour votre intérêt.
            Notre équipe commerciale étudiera votre dossier et vous contactera sous <strong>72 h</strong> à l'adresse <strong>{producer.email}</strong>.
          </p>
          <div className="bg-red-50 rounded-2xl p-4 text-left space-y-2 mb-6 text-xs text-stone-600">
            <p><span className="font-semibold">Entreprise :</span> {producer.company_name}</p>
            <p><span className="font-semibold">Produit :</span> {product.product_name} ({product.product_category})</p>
            {xp.target_markets.length > 0 && <p><span className="font-semibold">Marchés cibles :</span> {xp.target_markets.join(', ')}</p>}
          </div>
          <div className="flex gap-3">
            <Link to="/" className="flex-1 border border-stone-200 text-stone-600 text-sm py-3 rounded-xl hover:bg-stone-50 font-medium">
              Accueil
            </Link>
            <Link to="/catalog" className="flex-1 bg-ma-red hover:bg-[#9B1E24] text-white text-sm font-semibold py-3 rounded-xl">
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = [
    { id: 1, label: 'Votre entreprise' },
    { id: 2, label: 'Votre produit' },
    { id: 3, label: 'Export & envoi' },
  ];

  return (
    <div className="min-h-screen bg-ma-cream">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-ma-navy to-[#0A1833] pt-24 pb-16 px-4 overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-ma-red/50" />
            <Handshake className="w-5 h-5 text-ma-red" />
            <div className="h-px w-10 bg-ma-red/50" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Rejoignez Notre Réseau Export
          </h1>
          <p className="text-stone-300 text-base max-w-xl mx-auto leading-relaxed">
            Vous produisez des produits alimentaires marocains de qualité ?
            Faites-nous part de votre offre — nous nous chargeons de les exporter vers 50+ pays.
          </p>
        </div>
      </div>

      {/* ── Benefits band ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(b => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <b.icon className="w-4 h-4 text-ma-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">{b.title}</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* ── Step progress ─────────────────────────────────────────────── */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done ? 'bg-ma-green text-white' : active ? 'bg-ma-red text-white' : 'bg-stone-200 text-stone-400'
                  }`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 font-medium text-center hidden sm:block ${active ? 'text-ma-red' : done ? 'text-ma-green' : 'text-stone-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-ma-green' : 'bg-stone-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-8 space-y-5">

            {/* ══ STEP 1 — PRODUCTEUR ══ */}
            {step === 1 && (
              <>
                <h2 className="text-base font-bold text-stone-800 pb-3 border-b border-stone-100 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-ma-red" /> Votre entreprise
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Raison sociale" required>
                    <input type="text" required value={producer.company_name}
                      onChange={e => setProducer(p => ({ ...p, company_name: e.target.value }))}
                      placeholder="Coopérative Exemple" className={INPUT} />
                  </Field>
                  <Field label="Nom du contact" required>
                    <input type="text" required value={producer.contact_name}
                      onChange={e => setProducer(p => ({ ...p, contact_name: e.target.value }))}
                      placeholder="Mohamed Alami" className={INPUT} />
                  </Field>
                  <Field label="E-mail" required>
                    <input type="email" required value={producer.email}
                      onChange={e => setProducer(p => ({ ...p, email: e.target.value }))}
                      placeholder="contact@exemple.ma" className={INPUT} />
                  </Field>
                  <Field label="Téléphone / WhatsApp">
                    <input type="tel" value={producer.phone}
                      onChange={e => setProducer(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+212 6 00 00 00 00" className={INPUT} />
                  </Field>
                  <Field label="Pays" required>
                    <select required value={producer.country}
                      onChange={e => setProducer(p => ({ ...p, country: e.target.value }))}
                      className={SELECT}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Ville">
                    <input type="text" value={producer.city}
                      onChange={e => setProducer(p => ({ ...p, city: e.target.value }))}
                      placeholder="Meknès, Agadir…" className={INPUT} />
                  </Field>
                </div>
                <Field label="Site web (optionnel)">
                  <input type="url" value={producer.website}
                    onChange={e => setProducer(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://www.monentreprise.ma" className={INPUT} />
                </Field>
              </>
            )}

            {/* ══ STEP 2 — PRODUIT ══ */}
            {step === 2 && (
              <>
                <h2 className="text-base font-bold text-stone-800 pb-3 border-b border-stone-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-ma-red" /> Votre produit
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nom du produit" required>
                    <input type="text" required value={product.product_name}
                      onChange={e => setProduct(p => ({ ...p, product_name: e.target.value }))}
                      placeholder="Huile d'argan pure, BIO" className={INPUT} />
                  </Field>
                  <Field label="Catégorie" required>
                    <select required value={product.product_category}
                      onChange={e => setProduct(p => ({ ...p, product_category: e.target.value }))}
                      className={SELECT}>
                      <option value="">Sélectionner</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Description du produit">
                  <textarea rows={3} value={product.product_description}
                    onChange={e => setProduct(p => ({ ...p, product_description: e.target.value }))}
                    placeholder="Origine, variété, méthode de production, particularités…"
                    className={`${INPUT} resize-none`} />
                </Field>
                <Field label="Capacité de production annuelle">
                  <input type="text" value={product.annual_capacity}
                    onChange={e => setProduct(p => ({ ...p, annual_capacity: e.target.value }))}
                    placeholder="Ex : 50 tonnes / an, 10 000 bouteilles / mois…" className={INPUT} />
                </Field>
                <Field label="Certifications disponibles">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CERTIFICATIONS.map(c => (
                      <CheckPill key={c} label={c}
                        checked={product.certifications.includes(c)}
                        onChange={() => setProduct(p => ({
                          ...p,
                          certifications: p.certifications.includes(c)
                            ? p.certifications.filter(x => x !== c)
                            : [...p.certifications, c],
                        }))} />
                    ))}
                  </div>
                </Field>
                <Field label="Conditionnements disponibles">
                  <input type="text" value={product.packaging_types}
                    onChange={e => setProduct(p => ({ ...p, packaging_types: e.target.value }))}
                    placeholder="Ex : 250 ml, 500 ml, 1 L, vrac 200 L, privé label…" className={INPUT} />
                </Field>
              </>
            )}

            {/* ══ STEP 3 — EXPORT & MESSAGE ══ */}
            {step === 3 && (
              <>
                <h2 className="text-base font-bold text-stone-800 pb-3 border-b border-stone-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-ma-red" /> Expérience & Marchés cibles
                </h2>

                <label className="flex items-start gap-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                  <input type="checkbox" checked={xp.already_exporting}
                    onChange={e => setXp(x => ({ ...x, already_exporting: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-stone-300 text-ma-red" />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">J'exporte déjà à l'international</p>
                    <p className="text-xs text-stone-400">Cochez si vous avez déjà des expériences d'export en cours ou passées.</p>
                  </div>
                </label>

                {xp.already_exporting && (
                  <Field label="Marchés actuels">
                    <div className="flex flex-wrap gap-2 mt-1">
                      {TARGET_MARKETS.map(m => (
                        <CheckPill key={m} label={m}
                          checked={xp.current_markets.includes(m)}
                          onChange={() => setXp(x => ({
                            ...x,
                            current_markets: x.current_markets.includes(m)
                              ? x.current_markets.filter(v => v !== m)
                              : [...x.current_markets, m],
                          }))} />
                      ))}
                    </div>
                  </Field>
                )}

                <Field label="Marchés cibles souhaités">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TARGET_MARKETS.map(m => (
                      <CheckPill key={m} label={m}
                        checked={xp.target_markets.includes(m)}
                        onChange={() => setXp(x => ({
                          ...x,
                          target_markets: x.target_markets.includes(m)
                            ? x.target_markets.filter(v => v !== m)
                            : [...x.target_markets, m],
                        }))} />
                    ))}
                  </div>
                </Field>

                <Field label="Message complémentaire">
                  <textarea rows={4} value={xp.message}
                    onChange={e => setXp(x => ({ ...x, message: e.target.value }))}
                    placeholder="Toute information utile : labels, récompenses, story de votre produit, contraintes particulières…"
                    className={`${INPUT} resize-none`} />
                </Field>

                {/* Recap */}
                <div className="bg-red-50 rounded-xl p-4 text-xs space-y-1 text-stone-600">
                  <p className="font-semibold text-stone-700 mb-2">Récapitulatif avant envoi</p>
                  <p><span className="font-medium">Entreprise :</span> {producer.company_name} — {producer.city || producer.country}</p>
                  <p><span className="font-medium">Produit :</span> {product.product_name} ({product.product_category})</p>
                  {product.certifications.length > 0 && <p><span className="font-medium">Certif. :</span> {product.certifications.join(' · ')}</p>}
                  {xp.target_markets.length > 0 && <p><span className="font-medium">Marchés cibles :</span> {xp.target_markets.join(', ')}</p>}
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-5">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                className="flex items-center gap-2 border border-stone-200 text-stone-600 text-sm font-medium px-5 py-3 rounded-xl hover:bg-white bg-stone-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
            )}
            {step < 3 ? (
              <button type="button"
                onClick={() => {
                  setError('');
                  if (canProceed()) setStep(s => (s + 1) as 2 | 3);
                  else setError('Veuillez compléter les champs obligatoires.');
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-ma-red hover:bg-[#9B1E24] text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-ma-red hover:bg-[#9B1E24] disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                  : <><Send className="w-4 h-4" /> Envoyer mon dossier</>}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">
            Questions ? <a href="mailto:filalianas0001@gmail.com" className="text-ma-red hover:underline">filalianas0001@gmail.com</a>
            {' · '}
            <a href="tel:+212605268946" className="text-ma-red hover:underline">+212 605 268 946</a>
          </p>
        </form>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-stone-200" />
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Questions fréquentes</h3>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 px-6 divide-y divide-stone-100">
            {FAQS.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* ── Social proof mini ─────────────────────────────────────────── */}
        <div className="mt-12 bg-ma-navy rounded-2xl p-8 text-center">
          <div className="flex justify-center gap-6 mb-4">
            {[Leaf, Package, Globe].map((Icon, i) => (
              <div key={i} className="w-10 h-10 bg-ma-red/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-ma-red" />
              </div>
            ))}
          </div>
          <p className="text-white font-semibold mb-1">Plus de 120 producteurs nous font confiance</p>
          <p className="text-stone-400 text-sm">Huiles, épices, dattes, poissons, céréales… rejoignez notre réseau d'export.</p>
        </div>
      </div>
    </div>
  );
}
