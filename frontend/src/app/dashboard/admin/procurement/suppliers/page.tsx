'use client';

import { useState } from 'react';
import { Plus, Search, Phone, Mail, Package, Edit2, Trash2, Check, X, Loader2, Sparkles, Building2, MapPin } from 'lucide-react';
import { useProcurement, SupplierItem } from '@/features/inventory/hooks/use-procurement';
import { PermissionGuard } from '@/shared/components/common/permission-guard';

const categoryColor: Record<string, string> = {
  Kopi: 'bg-amber-100 text-amber-800',
  Dairy: 'bg-blue-100 text-blue-800',
  Baking: 'bg-rose-100 text-rose-800',
  Sirup: 'bg-purple-100 text-purple-800',
};

export default function ProcurementSuppliersPage() {
  const { suppliers, loading, usingLive, createSupplier, updateSupplier, deleteSupplier } = useProcurement();
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<string | number | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('Kopi');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 3500);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormName('');
    setFormCode('');
    setFormCategory('Kopi');
    setFormContact('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SupplierItem) => {
    setModalMode('edit');
    setEditId(item.id);
    setFormName(item.name);
    setFormCode(item.code || '');
    setFormCategory(item.category || 'Kopi');
    setFormContact(item.contact_person || '');
    setFormPhone(item.phone || '');
    setFormEmail(item.email || '');
    setFormAddress(item.address || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus supplier "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      showNotification(`Supplier "${name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Gagal menghapus supplier.');
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormLoading(true);
    try {
      const payload = {
        name: formName,
        code: formCode || undefined,
        category: formCategory,
        contact_person: formContact || undefined,
        phone: formPhone || undefined,
        email: formEmail || undefined,
        address: formAddress || undefined,
        is_active: true,
      };

      if (modalMode === 'add') {
        await createSupplier(payload);
        showNotification('Supplier baru berhasil disimpan!');
      } else if (modalMode === 'edit' && editId !== null) {
        await updateSupplier(editId, payload);
        showNotification('Data supplier berhasil diperbarui!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      showNotification('Terjadi kesalahan saat menyimpan data supplier');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Manajemen Supplier Pengadaan</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Terhubung API Laravel V1
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Lokal / Offline
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Restrukturisasi modul pengadaan (<span className="font-semibold text-gray-700">/admin/procurement/suppliers</span>) untuk pengelolaan vendor bahan baku resmi.
          </p>
        </div>

        <PermissionGuard permission="procurement.create">
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
          >
            <Plus size={16} /> Tambah Supplier
          </button>
        </PermissionGuard>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama supplier, kode, atau PIC..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
        />
      </div>

      {/* Suppliers Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat daftar supplier dari server...</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Kode & Supplier</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">PIC & Kontak</th>
                  <th className="px-6 py-4">Alamat / Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#BA935D]">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 leading-tight">{s.name}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">{s.code || 'NO-CODE'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          categoryColor[s.category || ''] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.category || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-gray-800">{s.contact_person || '-'}</p>
                      <div className="flex flex-col gap-0.5 text-[11px] text-gray-500 mt-0.5">
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} className="text-[#BA935D]" /> {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={10} className="text-[#BA935D]" /> {s.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                      {s.address ? (
                        <span className="flex items-center gap-1 truncate" title={s.address}>
                          <MapPin size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate">{s.address}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <PermissionGuard permission="procurement.edit">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Supplier"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        </PermissionGuard>

                        <PermissionGuard permission="procurement.delete">
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            title="Hapus Supplier"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal CRUD Tambah/Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Tambah Supplier Baru' : 'Edit Data Supplier'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Perusahaan / Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: PT Agri Nusantara Kopi"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Kode Vendor / SKU</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="SUP-010"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kategori Utama <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-semibold"
                  >
                    {['Kopi', 'Dairy', 'Sirup', 'Baking', 'Kemasan', 'Umum'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama PIC Kontak</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Pak Hendra"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Supplier</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="info@supplier.co.id"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Alamat kantor atau gudang supplier..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  {modalMode === 'add' ? 'Simpan Supplier' : 'Perbarui Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
