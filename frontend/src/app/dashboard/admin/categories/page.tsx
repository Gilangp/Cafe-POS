'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAdminMenu, AdminMenu, AdminCategory } from '@/features/menu/hooks/use-admin-menu';
import { useAdminVariants, AdminVariantGroup } from '@/features/menu/hooks/use-admin-variants';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  X,
  CheckCircle2,
  Loader2,
  FolderPlus,
  Eye,
  EyeOff,
  Sparkles,
  LayoutGrid,
  ChefHat,
  TrendingUp,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  Settings2,
  PlusCircle,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function AdminMenuPage() {
  const {
    menus,
    categories,
    inventories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenu,
    updateMenu,
    deleteMenu,
  } = useAdminMenu();

  const { variants, loading: loadingVariants, createVariant, updateVariant, deleteVariant } = useAdminVariants();

  const [activeTab, setActiveTab] = useState<'categories' | 'variants'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 items per page to keep it compact (3-4 rows)

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ id?: string; name: string; display_order: number }>({ name: '', display_order: 1 });
  
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState<Partial<AdminMenu>>({
    name: '',
    category_id: '',
    price: '',
    description: '',
    status: 'tersedia',
    is_best_seller: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Variant Modal States
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantForm, setVariantForm] = useState<{ id?: string; name: string; type: 'single' | 'multiple'; options: { id?: string, name: string, additional_price: string | number, inventory_item_id?: string | null, inventory_action?: string, inventory_action_value?: number | string }[] }>({
    name: '',
    type: 'single',
    options: [{ name: '', additional_price: 0, inventory_action: 'none', inventory_action_value: 0 }]
  });

  // --- BOM States ---
  const [showBomDrawer, setShowBomDrawer] = useState(false);
  const [bomMenu, setBomMenu] = useState<AdminMenu | null>(null);
  const [bomIngredients, setBomIngredients] = useState<any[]>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Category Handlers ---
  const handleEditCategory = (cat: AdminCategory) => {
    setCategoryForm({ id: cat.id, name: cat.name, display_order: cat.display_order });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, { name: categoryForm.name, display_order: categoryForm.display_order });
        showToast('Kategori berhasil diperbarui');
      } else {
        await createCategory({ name: categoryForm.name, display_order: categoryForm.display_order });
        showToast('Kategori baru berhasil ditambahkan');
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', display_order: 1 });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan kategori', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"? Pastikan kategori ini kosong.`)) return;
    try {
      await deleteCategory(id);
      showToast('Kategori berhasil dihapus');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus kategori (mungkin masih ada menu di dalamnya)', 'error');
    }
  };

  // --- Menu Handlers ---
  const handleAddMenu = () => {
    setMenuForm({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      status: 'tersedia',
      is_best_seller: false
    });
    setShowMenuModal(true);
  };

  const handleEditMenu = (menu: AdminMenu) => {
    setMenuForm({
      id: menu.id,
      name: menu.name,
      category_id: menu.category_id,
      price: Math.floor(Number(menu.price)).toString(),
      description: menu.description || '',
      status: menu.status,
      is_best_seller: menu.is_best_seller
    });
    setShowMenuModal(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (menuForm.id) {
        await updateMenu(menuForm.id, menuForm);
        showToast('Menu berhasil diperbarui');
      } else {
        await createMenu(menuForm);
        showToast('Menu baru berhasil ditambahkan');
      }
      setShowMenuModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan menu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus menu "${name}"?`)) return;
    try {
      await deleteMenu(id);
      showToast('Menu berhasil dihapus');
    } catch (err: any) {
      showToast('Gagal menghapus menu', 'error');
    }
  };

  const handleToggleMenuStatus = async (menu: AdminMenu) => {
    try {
      const newStatus = menu.status === 'tersedia' ? 'tidak_tersedia' : 'tersedia';
      await updateMenu(menu.id, { status: newStatus });
      showToast(`Status "${menu.name}" diubah menjadi ${newStatus === 'tersedia' ? 'Tersedia' : 'Habis'}`);
    } catch (err: any) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  const handleToggleBestSeller = async (menu: AdminMenu) => {
    try {
      await updateMenu(menu.id, { is_best_seller: !menu.is_best_seller });
      showToast(`Menu "${menu.name}" ${!menu.is_best_seller ? 'ditandai sebagai Best Seller' : 'dihapus dari Best Seller'}`);
    } catch (err: any) {
      showToast('Gagal mengubah status Best Seller', 'error');
    }
  };

  // --- Variant Handlers ---
  const handleEditVariant = (group: AdminVariantGroup) => {
    setVariantForm({
      id: group.id,
      name: group.name,
      type: group.type,
      options: group.options.map(opt => ({ ...opt }))
    });
    setShowVariantModal(true);
  };

  const handleDeleteVariant = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus Master Varian "${name}" beserta semua opsinya?`)) return;
    try {
      await deleteVariant(id);
      showToast('Master Varian berhasil dihapus');
    } catch (err: any) {
      showToast('Gagal menghapus varian', 'error');
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (variantForm.id) {
        await updateVariant(variantForm.id, variantForm as any);
        showToast('Varian berhasil diperbarui');
      } else {
        await createVariant(variantForm as any);
        showToast('Varian baru berhasil ditambahkan');
      }
      setShowVariantModal(false);
      setVariantForm({ name: '', type: 'single', options: [{ name: '', additional_price: 0, inventory_action: 'none', inventory_action_value: 0 }] });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan varian', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- BOM Handlers ---
  const handleOpenBom = (menu: AdminMenu) => {
    setBomMenu(menu);
    // Map existing ingredients from pivot
    const initialBom = (menu.ingredients || []).map(ing => ({
      inventory_id: ing.inventory_id || ing.pivot?.inventory_id,
      quantity_used: ing.quantity_used || ing.pivot?.quantity_used,
    }));
    setBomIngredients(initialBom);
    setNewIngredientId('');
    setNewIngredientQty('');
    setShowBomDrawer(true);
  };

  const handleAddBomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientId || !newIngredientQty) return;
    
    // check if already exists
    if (bomIngredients.some(b => b.inventory_id === newIngredientId)) {
      showToast('Bahan baku sudah ada dalam komposisi', 'error');
      return;
    }

    setBomIngredients([...bomIngredients, { 
      inventory_id: newIngredientId, 
      quantity_used: newIngredientQty 
    }]);
    setNewIngredientId('');
    setNewIngredientQty('');
  };

  const handleRemoveBomItem = (inventory_id: string) => {
    setBomIngredients(bomIngredients.filter(b => b.inventory_id !== inventory_id));
  };

  const handleSaveBom = async () => {
    if (!bomMenu) return;
    setIsSubmitting(true);
    try {
      await updateMenu(bomMenu.id, { ingredients: bomIngredients });
      showToast('Komposisi resep & HPP berhasil disimpan!');
      setShowBomDrawer(false);
    } catch (err: any) {
      showToast('Gagal menyimpan komposisi resep', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtering & Pagination ---
  const filteredMenus = menus.filter(menu => {
    const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategoryId === 'all' || menu.category_id === selectedCategoryId;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const paginatedMenus = filteredMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-primary dark:text-cream-100 tracking-wide">
            Kategori & Varian
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola kategori menu dan pengaturan master varian (suhu, level gula, ekstra).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === 'categories') {
                setCategoryForm({ name: '', display_order: categories.length + 1 });
                setShowCategoryModal(true);
              } else if (activeTab === 'variants') {
                setVariantForm({ name: '', type: 'single', options: [{ name: '', additional_price: 0, inventory_action: 'none', inventory_action_value: 0 }] });
                setShowVariantModal(true);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-primary font-bold hover:bg-[#b88c4d] transition-colors shadow-lg shadow-accent/20"
          >
            <Plus size={18} /> {activeTab === 'variants' ? 'Tambah Varian' : 'Tambah Kategori'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 font-bold transition-all relative ${
            activeTab === 'categories' 
              ? 'text-accent border-b-2 border-accent' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2"><LayoutGrid size={18} /> Kategori</div>
        </button>
        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-3 px-4 font-bold transition-all relative ${
            activeTab === 'variants' 
              ? 'text-accent border-b-2 border-accent' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2"><Settings2 size={18} /> Master Varian</div>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
          <Loader2 size={40} className="animate-spin text-accent mb-4" />
          <p className="font-medium">Memuat data master...</p>
        </div>
      ) : activeTab === 'categories' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Urutan</th>
                <th className="px-6 py-4">Nama Kategori</th>
                <th className="px-6 py-4">Jumlah Menu</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-500">{cat.display_order}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{cat.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-accent/10 text-accent font-bold px-3 py-1 rounded-lg">
                      {cat.menus_count || 0} Menu
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditCategory(cat)}
                      className="p-2 text-gray-500 hover:text-accent bg-gray-100 dark:bg-white/5 hover:bg-accent/10 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map(variant => (
              <div key={variant.id} className="bg-white dark:bg-[#1A2620] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{variant.name}</h3>
                    <p className="text-xs font-bold text-accent uppercase tracking-wider">{variant.type === 'single' ? 'Pilih Satu (Wajib)' : 'Pilih Banyak (Opsional)'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditVariant(variant)} className="p-2 text-gray-500 hover:text-accent bg-gray-100 dark:bg-white/5 hover:bg-accent/10 rounded-xl transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteVariant(variant.id, variant.name)} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {variant.options.map((opt, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                      <span className="font-mono font-bold text-xs text-primary dark:text-cream-100">
                        {Number(opt.additional_price) > 0 ? `+${formatCurrency(Number(opt.additional_price))}` : 'Gratis'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCategoryModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-[#1A2620] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-white/10"
              >
                <h3 className="font-heading text-xl font-bold mb-6 text-gray-900 dark:text-white">
                  {categoryForm.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Kategori</label>
                    <input 
                      type="text" 
                      required
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-none focus:ring-2 focus:ring-accent outline-none font-medium dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Urutan Tampil (Display Order)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={categoryForm.display_order}
                      onChange={e => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-none focus:ring-2 focus:ring-accent outline-none font-mono dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setShowCategoryModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-accent text-primary hover:bg-[#b88c4d] disabled:opacity-50 flex items-center gap-2">
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Kategori'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Variant Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showVariantModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVariantModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-[#1A2620] w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-white/10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                    {variantForm.id ? 'Edit Master Varian' : 'Tambah Master Varian'}
                  </h3>
                  <button type="button" onClick={() => setShowVariantModal(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveVariant} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Grup Varian</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Level Gula, Suhu, Extra Shot"
                        value={variantForm.name}
                        onChange={e => setVariantForm({...variantForm, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-none focus:ring-2 focus:ring-accent outline-none font-medium dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipe Pilihan</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={variantForm.type === 'single'} onChange={() => setVariantForm({...variantForm, type: 'single'})} className="text-accent focus:ring-accent" />
                          <span className="text-sm font-bold dark:text-white">Pilih Satu (Wajib)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={variantForm.type === 'multiple'} onChange={() => setVariantForm({...variantForm, type: 'multiple'})} className="text-accent focus:ring-accent" />
                          <span className="text-sm font-bold dark:text-white">Pilih Banyak (Opsional)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Opsi Varian</label>
                      <button 
                        type="button" 
                        onClick={() => setVariantForm({...variantForm, options: [...variantForm.options, { name: '', additional_price: 0, inventory_action: 'none', inventory_action_value: 0 }]})}
                        className="text-xs font-bold flex items-center gap-1 text-accent hover:text-[#b88c4d]"
                      >
                        <PlusCircle size={14} /> Tambah Opsi
                      </button>
                    </div>
                    
                    {variantForm.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                        <div className="flex-1 space-y-3">
                          <input 
                            type="text" 
                            required
                            placeholder="Nama opsi (e.g. Normal Sugar, Hot)"
                            value={opt.name}
                            onChange={e => {
                              const newOpts = [...variantForm.options];
                              newOpts[idx].name = e.target.value;
                              setVariantForm({...variantForm, options: newOpts});
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2620] focus:ring-1 focus:ring-accent outline-none dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Harga Tambahan: Rp</span>
                            <input 
                              type="number" 
                              min="0"
                              value={opt.additional_price}
                              onChange={e => {
                                const newOpts = [...variantForm.options];
                                newOpts[idx].additional_price = e.target.value;
                                setVariantForm({...variantForm, options: newOpts});
                              }}
                              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2620] focus:ring-1 focus:ring-accent outline-none dark:text-white"
                            />
                          </div>

                          {/* Inventory Linking */}
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Penyesuaian Stok Bahan Baku Varian</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <select
                                value={opt.inventory_item_id || ''}
                                onChange={e => {
                                  const newOpts = [...variantForm.options];
                                  newOpts[idx].inventory_item_id = e.target.value || null;
                                  setVariantForm({...variantForm, options: newOpts});
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2620] focus:ring-1 focus:ring-accent outline-none dark:text-white"
                              >
                                <option value="">(Tidak Ada)</option>
                                {inventories.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                              </select>

                              {opt.inventory_item_id && (
                                <>
                                  <select
                                    value={opt.inventory_action || 'none'}
                                    onChange={e => {
                                      const newOpts = [...variantForm.options];
                                      newOpts[idx].inventory_action = e.target.value as any;
                                      setVariantForm({...variantForm, options: newOpts});
                                    }}
                                    className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2620] focus:ring-1 focus:ring-accent outline-none dark:text-white"
                                  >
                                    <option value="none">Pilih Aksi</option>
                                    <option value="add">Tambah Takaran (+)</option>
                                    <option value="subtract">Kurangi Takaran (-)</option>
                                    <option value="swap">Timpa Jadi Total Baru (=)</option>
                                  </select>
                                  <div className="relative flex items-center">
                                    <input 
                                      type="number" 
                                      step="0.01"
                                      placeholder="Nilai"
                                      value={opt.inventory_action_value || ''}
                                      onChange={e => {
                                        const newOpts = [...variantForm.options];
                                        newOpts[idx].inventory_action_value = e.target.value;
                                        setVariantForm({...variantForm, options: newOpts});
                                      }}
                                      className="w-full pl-2 pr-12 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2620] focus:ring-1 focus:ring-accent outline-none dark:text-white"
                                    />
                                    <span className="absolute right-2 text-[10px] font-bold text-gray-400 pointer-events-none uppercase">
                                      {inventories.find(i => i.id === opt.inventory_item_id)?.unit || ''}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newOpts = variantForm.options.filter((_, i) => i !== idx);
                            setVariantForm({...variantForm, options: newOpts.length > 0 ? newOpts : [{ name: '', additional_price: 0, inventory_action: 'none', inventory_action_value: 0 }]});
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-[#1A2620] rounded-lg shadow-sm"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                    <button type="button" onClick={() => setShowVariantModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-accent text-primary hover:bg-[#b88c4d] disabled:opacity-50 flex items-center gap-2">
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Varian'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Global Notification Toast */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className={`fixed top-24 right-8 z-[10000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm border-2 ${
                notification.type === 'success' 
                  ? 'bg-emerald-500 text-white border-emerald-400' 
                  : 'bg-red-500 text-white border-red-400'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
