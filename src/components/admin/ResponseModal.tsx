import { useState } from 'react';
import {
  X, Mail, MessageCircle, FileDown, Send, Edit3,
  CheckCircle, Loader2, Copy, Check,
} from 'lucide-react';
import type { QuoteRequest } from '../../types';
import { generateProforma } from '../../lib/generateProforma';

interface Props {
  quote: QuoteRequest;
  onClose: () => void;
}

// ─── Template builders ────────────────────────────────────────────────────────

function buildEmailBody(q: QuoteRequest): string {
  const productList = (q.products_interested || '')
    .split('\n')
    .filter(Boolean)
    .map(l => `  • ${l}`)
    .join('\n');

  const terms = [
    q.incoterm && `Incoterm : ${q.incoterm}`,
    q.payment_terms && `Conditions de paiement : ${q.payment_terms}`,
    q.currency && `Devise : ${q.currency}`,
    q.port_loading && `Port de chargement : ${q.port_loading}`,
    q.port_destination && `Port de destination : ${q.port_destination}`,
    q.container_type && `Transport : ${q.container_type}`,
    q.delivery_date && `Livraison souhaitée : ${new Date(q.delivery_date).toLocaleDateString('fr-FR')}`,
  ].filter(Boolean).join('\n');

  return `Objet : Proforma — Demande de devis ${q.company_name}

Bonjour ${q.contact_name},

Nous vous remercions pour votre demande de devis concernant les produits ci-dessous. Veuillez trouver en pièce jointe notre facture proforma détaillée.

━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUITS DEMANDÉS
━━━━━━━━━━━━━━━━━━━━━━━━━
${productList || '  (voir document joint)'}

━━━━━━━━━━━━━━━━━━━━━━━━━
CONDITIONS COMMERCIALES
━━━━━━━━━━━━━━━━━━━━━━━━━
${terms || '  À définir selon votre proforma ci-jointe.'}

━━━━━━━━━━━━━━━━━━━━━━━━━

Notre équipe reste à votre disposition pour toute question ou ajustement.

Cordialement,

L'équipe commerciale
REDMAC MOROCCO
Tél / WhatsApp : +212 661 257 250
Email : eyad.sobh@redmac.ma`;
}

function buildWhatsAppMessage(q: QuoteRequest): string {
  const productList = (q.products_interested || '')
    .split('\n')
    .filter(Boolean)
    .map(l => `• ${l}`)
    .join('\n');

  return `Bonjour ${q.contact_name} 👋

Suite à votre demande de devis pour *${q.company_name}*, veuillez trouver ci-dessous nos conditions préliminaires :

*🛒 PRODUITS*
${productList || '(voir proforma)'}

${q.incoterm ? `*📦 Incoterm :* ${q.incoterm}` : ''}
${q.payment_terms ? `*💳 Paiement :* ${q.payment_terms}` : ''}
${q.currency ? `*💱 Devise :* ${q.currency}` : ''}
${q.port_destination ? `*🚢 Destination :* ${q.port_destination}` : ''}

Nous vous envoyons la proforma complète par e-mail à *${q.email}*.

N'hésitez pas à nous contacter pour toute question.

*REDMAC MOROCCO*
📞 +212 661 257 250`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TA = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white resize-none leading-relaxed';

export default function ResponseModal({ quote, onClose }: Props) {
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email');
  const [emailSubject, setEmailSubject] = useState(`Proforma — Votre demande de devis | ${quote.company_name}`);
  const [emailBody, setEmailBody] = useState(() => buildEmailBody(quote));
  const [waMessage, setWaMessage] = useState(() => buildWhatsAppMessage(quote));
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateProforma(quote);
    } catch (e) {
      console.error('Erreur génération proforma:', e);
      alert('Erreur lors de la génération du document. Vérifiez la console.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = () => {
    const body = encodeURIComponent(emailBody);
    const subject = encodeURIComponent(emailSubject);
    window.open(`mailto:${quote.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = () => {
    const phone = (quote.phone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(waMessage);
    if (!phone) {
      alert('Aucun numéro de téléphone disponible pour cet acheteur.');
      return;
    }
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (tab === 'email') setEmailBody(buildEmailBody(quote));
    else setWaMessage(buildWhatsAppMessage(quote));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-bold text-stone-800">Préparer la réponse</h2>
            <p className="text-xs text-stone-400 mt-0.5">{quote.company_name} — {quote.contact_name}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generate proforma banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-sm font-semibold text-amber-800">Étape 1 — Générer le document proforma</p>
            <p className="text-xs text-amber-600">Téléchargez le .docx, vérifiez et complétez les prix avant envoi.</p>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0">
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</>
              : <><FileDown className="w-4 h-4" /> Télécharger .docx</>
            }
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 px-6 pt-4 pb-2 shrink-0">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider self-center mr-2">Étape 2 — Envoyer via</p>
          <button
            onClick={() => setTab('email')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'email' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-700'}`}>
            <Mail className="w-4 h-4" /> E-mail
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-700'}`}>
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handleReset} title="Réinitialiser le message"
            className="ml-auto flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">

          {tab === 'email' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Objet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-500">Corps de l'e-mail</label>
                  <button onClick={() => handleCopy(emailBody)}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                  </button>
                </div>
                <textarea rows={18} value={emailBody} onChange={e => setEmailBody(e.target.value)} className={TA} />
              </div>
              <div className="text-xs text-stone-400 bg-stone-50 rounded-xl p-3">
                <span className="font-semibold text-stone-600">💡 Note :</span> Le fichier proforma .docx doit être joint manuellement depuis votre boîte mail après téléchargement (ci-dessus). Le bouton ci-dessous ouvre votre client mail avec le message pré-rempli.
              </div>
            </>
          )}

          {tab === 'whatsapp' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-500">Message WhatsApp</label>
                  <button onClick={() => handleCopy(waMessage)}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copié</> : <><Copy className="w-3 h-3" /> Copier</>}
                  </button>
                </div>
                <textarea rows={18} value={waMessage} onChange={e => setWaMessage(e.target.value)} className={TA} />
              </div>
              {quote.phone ? (
                <div className="text-xs text-stone-400 bg-emerald-50 rounded-xl p-3">
                  <span className="font-semibold text-emerald-700">📱 Numéro :</span> {quote.phone} — le bouton ouvrira WhatsApp Web avec ce message.
                </div>
              ) : (
                <div className="text-xs text-red-500 bg-red-50 rounded-xl p-3">
                  ⚠️ Aucun numéro de téléphone enregistré pour cet acheteur.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-100 shrink-0 bg-white">
          <button onClick={onClose}
            className="flex-1 border border-stone-200 text-stone-600 text-sm font-medium py-3 rounded-xl hover:bg-stone-50 transition-colors">
            Fermer
          </button>

          {tab === 'email' ? (
            <button onClick={handleSendEmail}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
              <Send className="w-4 h-4" />
              Ouvrir dans ma messagerie
            </button>
          ) : (
            <button onClick={handleWhatsApp} disabled={!quote.phone}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
              <MessageCircle className="w-4 h-4" />
              Envoyer via WhatsApp
            </button>
          )}

          {tab === 'email' && (
            <button onClick={() => { handleGenerate(); handleSendEmail(); }}
              disabled={generating}
              title="Télécharger la proforma ET ouvrir le mail"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors">
              <CheckCircle className="w-4 h-4" />
              Tout envoyer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
