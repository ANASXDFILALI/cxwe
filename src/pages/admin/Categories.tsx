import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';

const EMPTY: Omit<Category, 'id' | 'created_at'> = {
  name: '', slug: '', description: '', image_url: '',
  sort_order: 0, is_active: true,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Categories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, image_url: cat.image_url, sort_order: cat.sort_order, is_active: cat.is_active });
    setEditing(cat);
    setModal('edit');
  };

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'name' && modal === 'add') updated.slug = slugify(e.target.value);
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (modal === 'edit' && editing) {
      await supabase.from('categories').update(form).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert([form]);
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category and all its products?')) return;
    setDeleting(id);
    await supabase.from('categories').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  const toggleActive = async (cat: Category) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Categories</h1>
          <p className="text-stone-500 text-sm mt-1">{items.length} categories total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Sort</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map(cat => (
                <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3 text-stone-400 text-xs">{cat.sort_order}</td>
                  <td className="px-5 py-3 font-medium text-stone-800">{cat.name}</td>
                  <td className="px-5 py-3 text-stone-400 hidden sm:table-cell font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3 text-stone-400 hidden md:table-cell">{cat.sort_order}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(cat)} className="transition-colors">
                      {cat.is_active
                        ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                        : <ToggleLeft className="w-5 h-5 text-stone-300" />
                      }
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setModal(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Name *</label>
                  <input required type="text" value={form.name} onChange={set('name')}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Slug *</label>
                  <input required type="text" value={form.slug} onChange={set('slug')}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={set('description')}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1.5">Image URL</label>
                <input type="url" value={form.image_url} onChange={set('image_url')}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={set('sort_order')}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 text-amber-500 rounded" />
                    <span className="text-sm text-stone-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-stone-200 text-stone-600 text-sm py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {modal === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
