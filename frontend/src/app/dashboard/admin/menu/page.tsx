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

  const [activeTab, setActiveTab] = useState<'menus' | 'categories' | 'variants'>('menus');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 items per page to keep it compact (3-4 rows)

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal States
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

  // --- BOM States ---
  const [showBomDrawer, setShowBomDrawer] = useState(false);
  const [bomMenu, setBomMenu] = useState<AdminMenu | null>(null);
  const [bomIngredients, setBomIngredients] = useState<any[]>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');

  // --- Variant Mapping States ---
  const [showMenuVariantDrawer, setShowMenuVariantDrawer] = useState(false);
  const [menuVariantMenu, setMenuVariantMenu] = useState<AdminMenu | null>(null);
  const [menuVariantGroups, setMenuVariantGroups] = useState<{variant_group_id: string, is_required: boolean}[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  // --- Variant Mapping Handlers ---
  const handleOpenVariant = (menu: AdminMenu) => {
    setMenuVariantMenu(menu);
    const initialVariants = (menu.variant_groups || []).map(vg => ({
      variant_group_id: vg.id,
      is_required: vg.pivot?.is_required || false
    }));
    setMenuVariantGroups(initialVariants);
    setShowMenuVariantDrawer(true);
  };

  const handleToggleVariantGroup = (groupId: string, isRequired: boolean) => {
    setMenuVariantGroups(prev => {
      const exists = prev.find(v => v.variant_group_id === groupId);
      if (exists) {
        return prev.filter(v => v.variant_group_id !== groupId);
      }
      return [...prev, { variant_group_id: groupId, is_required: isRequired }];
    });
  };

  const handleUpdateVariantRequired = (groupId: string, isRequired: boolean) => {
    setMenuVariantGroups(prev => prev.map(v => 
      v.variant_group_id === groupId ? { ...v, is_required: isRequired } : v
    ));
  };

  const handleSaveMenuVariants = async () => {
    if (!menuVariantMenu) return;
    setIsSubmitting(true);
    try {
      await updateMenu(menuVariantMenu.id, { variant_groups: menuVariantGroups } as any);
      showToast('Master Varian berhasil ditautkan ke menu!');
      setShowMenuVariantDrawer(false);
    } catch (err: any) {
      showToast('Gagal menautkan varian ke menu', 'error');
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
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-accent/30 animate-fadeIn pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
            Master Menu
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Kelola katalog menu, resep HPP, varian, dan status ketersediaan secara real-time.
          </p>
        </div>
        <button
          onClick={handleAddMenu}
          className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-primary hover:bg-[#b88c4d] transition-colors shadow-md active:scale-95 shrink-0"
        >
          <Plus size={16} /> Tambah Menu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-accent shadow-md">
            <Coffee size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{menus.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Total Menu</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">{menus.filter(m => m.status === 'tersedia').length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Tersedia (Ready)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400">
            <EyeOff size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-heading">{menus.filter(m => m.status !== 'tersedia').length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Habis / Non-Aktif</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent">
            <Star size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-accent font-heading">{menus.filter(m => m.is_best_seller).length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Best Seller</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10">
          <Loader2 size={36} className="animate-spin mb-3 text-accent" />
          <p className="text-xs font-bold">Memuat data master menu...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[260px] max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari nama menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-accent focus:outline-none dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategoryId === 'all'
                    ? 'bg-primary text-accent shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15'
                }`}
              >
                Semua ({menus.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-primary text-accent shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menus Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMenus.map(menu => {
              // Calculate HPP
              let totalCost = 0;
              if (menu.ingredients && menu.ingredients.length > 0) {
                menu.ingredients.forEach(ing => {
                  const invId = ing.inventory_id || ing.pivot?.inventory_id;
                  const qty = Number(ing.quantity_used || ing.pivot?.quantity_used || 0);
                  const inv = inventories.find(i => i.id === invId);
                  if (inv) {
                    totalCost += qty * Number(inv.unit_price);
                  }
                });
              }
              const margin = Math.round(((Number(menu.price) - totalCost) / Number(menu.price)) * 100) || 0;

              return (
              <div 
                key={menu.id} 
                className={`group relative bg-white dark:bg-[#1A2620] rounded-3xl border overflow-hidden transition-all hover:shadow-glow flex flex-col h-full animate-fadeIn ${
                  menu.status === 'tersedia' 
                    ? 'border-gray-200 dark:border-white/10 hover:border-accent/40' 
                    : 'border-red-200 dark:border-red-900/30 opacity-70'
                }`}
              >
                <div className="h-36 bg-gray-100 dark:bg-black/30 relative flex items-center justify-center overflow-hidden">
                  {menu.image ? (
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Coffee size={36} className="text-gray-300 dark:text-gray-600" />
                  )}
                  
                  {/* Status Badge */}
                  <button 
                    onClick={() => handleToggleMenuStatus(menu)}
                    className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg transition-colors z-10 ${
                      menu.status === 'tersedia' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/90 dark:text-emerald-50 hover:bg-red-100 hover:text-red-600' 
                        : 'bg-red-100 text-red-700 dark:bg-red-500/90 dark:text-red-50 hover:bg-emerald-100 hover:text-emerald-600'
                    }`}
                  >
                    {menu.status === 'tersedia' ? <Eye size={12} /> : <EyeOff size={12} />}
                    {menu.status === 'tersedia' ? 'Ready' : 'Habis'}
                  </button>

                  {/* Best Seller */}
                  <button
                    onClick={() => handleToggleBestSeller(menu)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all z-10 ${
                      menu.is_best_seller 
                        ? 'bg-accent text-primary hover:bg-gray-100 hover:text-gray-400' 
                        : 'bg-white/80 dark:bg-black/50 text-gray-400 hover:bg-accent hover:text-primary'
                    }`}
                    title={menu.is_best_seller ? 'Hapus dari Best Seller' : 'Tandai sebagai Best Seller'}
                  >
                    <Star size={14} className={menu.is_best_seller ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent text-[10px] font-extrabold uppercase tracking-wider mb-2">
                      {menu.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{menu.name}</h3>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Harga Jual</p>
                        <p className="text-xl font-extrabold text-gray-900 dark:text-white font-mono">{formatCurrency(Number(menu.price))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">HPP</p>
                        <p className="text-sm font-mono font-bold text-gray-400">{formatCurrency(totalCost)}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={margin >= 45 ? 'text-emerald-500' : margin >= 20 ? 'text-accent' : 'text-red-500'}>Margin</span>
                        <span className="text-gray-400 font-mono">{margin}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${margin >= 45 ? 'bg-emerald-500' : margin >= 20 ? 'bg-accent' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.max(margin, 5), 100)}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                      <button 
                        onClick={() => handleOpenBom(menu)}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-primary/10 dark:bg-primary hover:bg-primary dark:hover:bg-[#163026] text-primary dark:text-accent hover:text-accent transition-colors border border-primary/20 dark:border-white/5"
                      >
                        <ChefHat size={16} />
                        <span className="text-[10px] font-bold">Resep & HPP</span>
                      </button>
                      <button 
                        onClick={() => handleOpenVariant(menu)}
                        className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-primary transition-colors border border-accent/20"
                      >
                        <Settings2 size={16} />
                        <span className="text-[10px] font-bold">Atur Varian</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditMenu(menu)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-accent transition-colors text-xs font-bold border border-transparent hover:border-accent/30"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteMenu(menu.id, menu.name)}
                        className="w-11 h-11 flex shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-white/10 mt-6">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center sm:text-left">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMenus.length)} dari {filteredMenus.length} menu
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-black/30 hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors border ${
                            currentPage === pageNum 
                              ? 'bg-primary text-accent border-primary' 
                              : 'bg-white dark:bg-black/30 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/15 hover:border-accent hover:text-accent'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-black/30 hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Menu Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMenuModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenuModal(false)} />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-[#1A2620] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                  {menuForm.id ? 'Edit Menu' : 'Tambah Menu Baru'}
                </h3>
                <button onClick={() => setShowMenuModal(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200"><X size={20}/></button>
              </div>

              <form onSubmit={handleSaveMenu} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Menu <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={menuForm.name}
                      onChange={e => setMenuForm({...menuForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kategori <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={menuForm.category_id}
                      onChange={e => setMenuForm({...menuForm, category_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 focus:border-accent focus:ring-1 focus:ring-accent outline-none font-bold dark:text-white"
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Harga (Rp) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={menuForm.price}
                    onChange={e => setMenuForm({...menuForm, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono font-bold text-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Deskripsi (Opsional)</label>
                  <textarea 
                    rows={3}
                    value={menuForm.description || ''}
                    onChange={e => setMenuForm({...menuForm, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/10 mt-6">
                  <button type="button" onClick={() => setShowMenuModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl font-bold bg-accent text-primary hover:bg-[#b88c4d] disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/20">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Menu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* BOM Drawer / Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showBomDrawer && bomMenu && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBomDrawer(false)} />
              <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-[#1A2620] w-full max-w-xl h-full shadow-2xl border-l border-gray-100 dark:border-white/10 flex flex-col"
              >
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-accent">
                    <ChefHat size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Resep & Komposisi HPP</h3>
                    <p className="text-xs font-bold text-accent">{bomMenu.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowBomDrawer(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Add new ingredient */}
                <form onSubmit={handleAddBomItem} className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><PackageOpen size={16}/> Tambah Bahan Baku</h4>
                  <div className="flex flex-col gap-3">
                    <select 
                      required
                      value={newIngredientId}
                      onChange={e => setNewIngredientId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-accent outline-none text-sm font-bold dark:text-white"
                    >
                      <option value="" disabled>Pilih Inventory / Raw Material</option>
                      {inventories.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name} (Stok: {inv.stock_quantity} {inv.unit})</option>
                      ))}
                    </select>
                    <div className="flex gap-2 w-full">
                      <div className="relative flex-1">
                        <input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="Jumlah"
                          value={newIngredientQty}
                          onChange={e => setNewIngredientQty(e.target.value)}
                          className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-accent outline-none text-sm text-center font-mono dark:text-white"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none uppercase">
                          {inventories.find(i => i.id === newIngredientId)?.unit || ''}
                        </span>
                      </div>
                      <button type="submit" className="w-16 flex justify-center items-center py-3 bg-primary text-accent hover:bg-[#163026] rounded-xl font-bold transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </form>

                {/* List Ingredients */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Daftar Komposisi & Kalkulasi</h4>
                  {bomIngredients.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                      Belum ada komposisi bahan baku.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bomIngredients.map((bom, idx) => {
                        const inv = inventories.find(i => i.id === bom.inventory_id);
                        const cost = inv ? Number(inv.unit_price) * Number(bom.quantity_used) : 0;
                        return (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-[#1A2620] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:border-accent transition-colors">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{inv?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 mt-1">Takaran: <strong className="text-accent">{bom.quantity_used} {inv?.unit}</strong> (@ {formatCurrency(Number(inv?.unit_price || 0))}/{inv?.unit})</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(cost)}</span>
                              <button onClick={() => handleRemoveBomItem(bom.inventory_id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Summary HPP */}
                {bomIngredients.length > 0 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
                      <span>Harga Jual Menu</span>
                      <span className="font-mono">{formatCurrency(Number(bomMenu.price))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-red-600 dark:text-red-400">
                      <span>Total HPP (Modal)</span>
                      <span className="font-mono">
                        {formatCurrency(bomIngredients.reduce((acc, bom) => {
                          const inv = inventories.find(i => i.id === bom.inventory_id);
                          return acc + (inv ? Number(inv.unit_price) * Number(bom.quantity_used) : 0);
                        }, 0))}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-accent/20 flex justify-between items-center text-primary dark:text-cream-100">
                      <span className="font-black flex items-center gap-2"><TrendingUp size={16}/> Estimasi Profit Kotor</span>
                      <span className="font-black font-mono">
                        {(() => {
                          const totalHpp = bomIngredients.reduce((acc, bom) => {
                            const inv = inventories.find(i => i.id === bom.inventory_id);
                            return acc + (inv ? Number(inv.unit_price) * Number(bom.quantity_used) : 0);
                          }, 0);
                          const profit = Number(bomMenu.price) - totalHpp;
                          const margin = Math.round((profit / Number(bomMenu.price)) * 100) || 0;
                          return `${formatCurrency(profit)} (${margin}%)`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                <button 
                  onClick={handleSaveBom}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold bg-accent text-primary hover:bg-[#b88c4d] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Simpan Komposisi & HPP</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Menu Variant Drawer / Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMenuVariantDrawer && menuVariantMenu && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenuVariantDrawer(false)} />
              <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-[#1A2620] w-full max-w-md h-full shadow-2xl border-l border-gray-100 dark:border-white/10 flex flex-col"
              >
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Tautan Varian Menu</h3>
                    <p className="text-xs font-bold text-accent">{menuVariantMenu.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowMenuVariantDrawer(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  Pilih Master Varian yang tersedia untuk menu ini. Anda juga bisa mengatur apakah varian tersebut wajib dipilih atau opsional.
                </p>

                {variants.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                    Belum ada Master Varian. Tambahkan di menu Kategori & Varian.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variants.map(vg => {
                      const isActive = menuVariantGroups.some(v => v.variant_group_id === vg.id);
                      const currentLink = menuVariantGroups.find(v => v.variant_group_id === vg.id);
                      
                      return (
                        <div 
                          key={vg.id} 
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isActive 
                              ? 'border-accent bg-accent/5' 
                              : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#1A2620] hover:border-accent/40'
                          }`}
                        >
                          <div className="flex items-center justify-between" onClick={() => handleToggleVariantGroup(vg.id, vg.type === 'single')}>
                            <div>
                              <h4 className={`font-bold ${isActive ? 'text-accent' : 'text-gray-900 dark:text-white'}`}>
                                {vg.name}
                              </h4>
                              <p className="text-xs font-medium text-gray-500 mt-1">
                                {vg.options.length} Opsi • {vg.type === 'single' ? 'Pilih Satu' : 'Pilih Banyak'}
                              </p>
                            </div>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${
                              isActive ? 'bg-accent border-accent text-primary' : 'border-gray-300 dark:border-gray-600 text-transparent'
                            }`}>
                              <CheckCircle2 size={16} className={isActive ? 'opacity-100' : 'opacity-0'} />
                            </div>
                          </div>
                          
                          {isActive && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Wajib Dipilih?</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={currentLink?.is_required || false}
                                  onChange={(e) => handleUpdateVariantRequired(vg.id, e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                <button 
                  onClick={handleSaveMenuVariants}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold bg-accent text-primary hover:bg-[#b88c4d] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Simpan Tautan Varian</>}
                </button>
              </div>
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
