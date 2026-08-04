'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Scale } from 'lucide-react';
import { useUnitConversions } from '@/features/inventory/hooks/use-unit-conversions';
import { PermissionGuard } from '@/shared/components/common/permission-guard';

export default function UnitConversionsPage() {
  const { conversions, loading, addConversion, deleteConversion } = useUnitConversions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ from_unit: '', to_unit: '', multiplier: '1' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await addConversion({
        from_unit: form.from_unit.toLowerCase(),
        to_unit: form.to_unit.toLowerCase(),
        multiplier: parseFloat(form.multiplier),
      });
      setIsModalOpen(false);
      setForm({ from_unit: '', to_unit: '', multiplier: '1' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menyimpan konversi.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus aturan konversi ini?')) {
      await deleteConversion(id);
    }
  };

  return (
    <PermissionGuard permission="manage_inventory">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Scale size={24} className="text-[#BA935D]" />
            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Setting Konversi Satuan</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#BA935D] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#a07c4c]"
          >
            <Plus size={18} />
            <span>Tambah Konversi</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1A2620] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="p-4 text-left">Satuan PO (Pembelian)</th>
                  <th className="p-4 text-center">Faktor Konversi (x)</th>
                  <th className="p-4 text-left">Satuan Dasar (Inventory)</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Belum ada aturan konversi satuan. Silakan tambah baru.
                    </td>
                  </tr>
                ) : (
                  conversions.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-gray-900 dark:text-white">{conv.from_unit}</span>
                      </td>
                      <td className="p-4 text-center text-[#BA935D] font-bold">
                        x {Number(conv.multiplier)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-600 dark:text-gray-300">{conv.to_unit}</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(conv.id)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-200 dark:border-white/15">
              <h2 className="text-lg font-bold mb-4 font-heading text-gray-900 dark:text-white">Tambah Konversi Satuan</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">{error}</div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Satuan PO (Dari) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.from_unit}
                    onChange={e => setForm({...form, from_unit: e.target.value})}
                    placeholder="Contoh: kg, karung, lusin"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#BA935D] focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Nilai Konversi (Multiplier) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={form.multiplier}
                    onChange={e => setForm({...form, multiplier: e.target.value})}
                    placeholder="1000"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#BA935D] focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Satuan Dasar / Inventory (Menjadi) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.to_unit}
                    onChange={e => setForm({...form, to_unit: e.target.value})}
                    placeholder="Contoh: gram, pcs"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#BA935D] focus:outline-none dark:bg-black/20 dark:border-white/10 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jika beli 1 [Dari], berarti dapat berapa [Menjadi]?</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl bg-gray-100 dark:bg-white/10 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 rounded-xl bg-[#BA935D] px-4 py-2 text-sm font-bold text-white hover:bg-[#a07c4c] transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
