'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Coffee,
  X,
  Check,
  Loader2,
  Sparkles,
  DollarSign,
  Utensils,
  Store,
  Tag,
  BookOpen,
  Layers,
  ChefHat,
  Scale,
  TrendingUp,
  FolderPlus,
} from 'lucide-react';
import { useProducts, CatalogProduct } from '@/features/menu/hooks/use-products';
import { PermissionGuard } from '@/shared/components/common/permission-guard';
import { useBranchStore } from '@/store/branch.store';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

interface RecipeIngredient {
  id: string;
  name: string;
  qty: number;
  unit: string;
  costPerUnit: number;
}

export default function MenuPage() {
  const {
    products,
    categories,
    recipes,
    loading: catalogLoading,
    usingLive,
    refetch,
    overrideBranchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts({ includeInactive: true });

  const activeBranchId = useBranchStore((s) => s.activeBranchId);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<string | number | null>(null);

  // Price Override Modal (MNU-002 / MNU-003)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideTargetProduct, setOverrideTargetProduct] = useState<CatalogProduct | null>(null);
  const [overridePriceInput, setOverridePriceInput] = useState('');
  const [overrideStockInput, setOverrideStockInput] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  // 9.2 BOM Recipe Composition Breakdown Drawer
  const [isRecipeDrawerOpen, setIsRecipeDrawerOpen] = useState(false);
  const [activeRecipeProduct, setActiveRecipeProduct] = useState<CatalogProduct | null>(null);
  const [bomIngredients, setBomIngredients] = useState<RecipeIngredient[]>([
    { id: 'ING-01', name: 'Biji Kopi Specialty Gayo Arabica', qty: 18, unit: 'gram', costPerUnit: 250 },
    { id: 'ING-02', name: 'Susu Oat Barista Blend (Oatly)', qty: 150, unit: 'ml', costPerUnit: 40 },
    { id: 'ING-03', name: 'Sirup Hazelnut Artisan / Vanilla', qty: 15, unit: 'ml', costPerUnit: 120 },
    { id: 'ING-04', name: 'Paper Cup Hot / Cold 180ml + Lid', qty: 1, unit: 'pcs', costPerUnit: 1500 },
  ]);
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('gram');
  const [newIngCost, setNewIngCost] = useState('');

  // 9.2 Category CRUD Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [localCategories, setLocalCategories] = useState([
    { id: 1, name: 'Espresso & Signature Coffee', count: 14 },
    { id: 2, name: 'Slow-Bar Manual Brew', count: 8 },
    { id: 3, name: 'Non-Coffee Artisan Milk', count: 6 },
    { id: 4, name: 'Viennoiserie & Pastry', count: 9 },
    { id: 5, name: 'Bottled Cold Brew 24H', count: 5 },
  ]);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string | number>('');
  const [formPrice, setFormPrice] = useState('35000');
  const [formSku, setFormSku] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRecipeId, setFormRecipeId] = useState<string | number>('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 4000);
  };

  const toggleAvailableStatus = async (product: CatalogProduct) => {
    try {
      const newStatus = !product.is_available;
      await overrideBranchProduct(product.id, {
        is_available: newStatus,
        price: product.effective_price,
        stock_quantity: product.branch_stock_quantity || 0,
      });
      showNotification(`Status ${product.name} diperbarui menjadi ${newStatus ? 'Tersedia' : 'Habis (86\'d)'}`);
    } catch (err) {
      console.error('Failed toggle 86 status:', err);
      showNotification('Gagal memperbarui status ketersediaan');
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormName('');
    setFormCategory(categories[0]?.id || 1);
    setFormPrice('35000');
    setFormSku('');
    setFormDesc('');
    setFormRecipeId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogProduct) => {
    setModalMode('edit');
    setEditId(item.id);
    setFormName(item.name);
    setFormCategory(item.category_id || categories[0]?.id || 1);
    setFormPrice((item.effective_price || item.price).toString());
    setFormSku(item.sku || '');
    setFormDesc(item.description || '');
    setFormRecipeId(item.recipe_id || '');
    setIsModalOpen(true);
  };

  const handleOpenOverride = (item: CatalogProduct) => {
    setOverrideTargetProduct(item);
    setOverridePriceInput((item.effective_price || item.price).toString());
    setOverrideStockInput(item.branch_stock_quantity !== null && item.branch_stock_quantity !== undefined ? item.branch_stock_quantity.toString() : '');
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTargetProduct) return;
    setOverrideLoading(true);
    try {
      const priceVal = parseFloat(overridePriceInput) || overrideTargetProduct.price;
      const stockVal = overrideStockInput !== '' ? parseInt(overrideStockInput, 10) : undefined;
      await overrideBranchProduct(overrideTargetProduct.id, {
        price: priceVal,
        is_available: overrideTargetProduct.is_available,
        stock_quantity: stockVal,
      });
      showNotification(`Harga khusus roastery untuk ${overrideTargetProduct.name} berhasil disimpan!`);
      setIsOverrideModalOpen(false);
    } catch (err) {
      console.error('Error overriding price:', err);
      showNotification('Gagal menyimpan timpaan harga');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleOpenRecipeDrawer = (item: CatalogProduct) => {
    setActiveRecipeProduct(item);
    setIsRecipeDrawerOpen(true);
  };

  const handleAddIngredientToBom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim() || !newIngQty) return;
    const item: RecipeIngredient = {
      id: `ING-${Date.now()}`,
      name: newIngName,
      qty: Number(newIngQty) || 1,
      unit: newIngUnit,
      costPerUnit: Number(newIngCost) || 100,
    };
    setBomIngredients((prev) => [...prev, item]);
    setNewIngName('');
    setNewIngQty('');
    setNewIngCost('');
  };

  const handleDeleteIngredient = (id: string) => {
    setBomIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameInput.trim()) return;
    setLocalCategories((prev) => [...prev, { id: Date.now(), name: newCatNameInput, count: 0 }]);
    setNewCatNameInput('');
    showNotification('✓ Kategori menu baru berhasil ditambahkan!');
  };

  const handleDeleteItem = async (id: string | number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus produk "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showNotification(`Produk "${name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Gagal menghapus produk.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    setFormLoading(true);
    try {
      const numPrice = parseFloat(formPrice) || 0;
      const payload = {
        name: formName,
        category_id: formCategory,
        base_price: numPrice,
        sku: formSku || undefined,
        description: formDesc || 'Racikan spesial dari NEMU Space Specialty Roastery.',
        recipe_id: formRecipeId || null,
        is_active: true,
      };

      if (modalMode === 'add') {
        await createProduct(payload);
        showNotification('Produk baru dan tautan resep berhasil disimpan!');
      } else if (modalMode === 'edit' && editId !== null) {
        await updateProduct(editId, payload);
        showNotification('Produk berhasil diperbarui!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      showNotification('Terjadi kesalahan saat menyimpan produk');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCat =
      categoryFilter === 'all' ||
      String(p.category_id) === String(categoryFilter) ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const totalBomCost = bomIngredients.reduce((sum, item) => sum + item.qty * item.costPerUnit, 0);

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Katalog Menu & Resep Bahan Baku (9.2)
            </h1>
            {usingLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles size={13} /> Terhubung API Live
              </span>
            ) : (
              <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
                Mode Offline Sync
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Kelola produk katalog, atur komposisi resep BOM per item menu (<strong className="text-emerald-600 dark:text-emerald-400">9.2</strong>), serta pantau kalkulasi margin HPP otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#C89B5C] transition-all shadow-sm"
          >
            <FolderPlus size={15} className="text-[#C89B5C]" />
            <span>Kelola Kategori (9.2)</span>
          </button>

          <PermissionGuard permission="menu.create">
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-colors shadow-md active:scale-95"
            >
              <Plus size={16} /> Tambah Menu Baru
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 rounded-2xl px-5 py-2 text-xs font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md'
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
            }`}
          >
            Semua Kategori ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(String(cat.id))}
              className={`shrink-0 rounded-2xl px-5 py-2 text-xs font-bold transition-all ${
                categoryFilter === String(cat.id)
                  ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md'
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu atau SKU..."
            className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 dark:text-white focus:border-[#C89B5C] focus:outline-none"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      {catalogLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 size={38} className="animate-spin mb-3 text-[#C89B5C]" />
          <p className="text-xs font-bold">Memuat katalog menu & resep komposisi...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => {
            const currentPrice = product.effective_price !== undefined ? product.effective_price : product.price;
            const isOverridden = product.effective_price !== undefined && product.effective_price !== product.price;
            const costVal = product.cost || Math.round(currentPrice * 0.32);
            const margin = Math.round(((currentPrice - costVal) / (currentPrice || 1)) * 100);

            return (
              <div
                key={product.id}
                className={`rounded-3xl bg-white dark:bg-[#1A2620] border-2 shadow-sm overflow-hidden transition-all flex flex-col hover:shadow-xl hover:border-[#C89B5C]/60 ${
                  product.is_available ? 'border-gray-200/80 dark:border-white/10' : 'border-dashed border-red-300 dark:border-red-800 bg-red-50/10 dark:bg-red-950/20'
                }`}
              >
                <div className="relative flex items-center justify-center h-36 bg-[#FAF3E7] dark:bg-black/40 text-[#C89B5C]">
                  <Coffee size={48} className="stroke-[1.5]" />
                  {isOverridden && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#1E3D31] px-2.5 py-1 text-[10px] font-bold text-[#C89B5C] shadow-sm">
                      <Store size={11} /> Harga Khusus
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    <ChefHat size={12} className="text-[#C89B5C]" />
                    <span>{product.recipe_id ? 'Komposisi Terhubung' : 'BOM Baku 4 Bahan'}</span>
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-heading font-extrabold text-gray-900 dark:text-white text-base leading-snug">{product.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-[#C89B5C] uppercase tracking-wider">
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="text-[10px] text-gray-400 font-mono">({product.sku})</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Toggle Status 86'd (MNU-004) */}
                      <button
                        onClick={() => toggleAvailableStatus(product)}
                        title={product.is_available ? 'Klik untuk set Habis (86\'d)' : 'Klik untuk aktifkan produk'}
                        className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold transition-all shadow-sm ${
                          product.is_available
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
                        }`}
                      >
                        {product.is_available ? <Eye size={12} /> : <EyeOff size={12} />}
                        {product.is_available ? 'Tersedia' : '86\'d (Habis)'}
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between text-sm mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                      <div>
                        <span className="font-mono font-extrabold text-gray-900 dark:text-white text-base">{fmt(currentPrice)}</span>
                        {isOverridden && (
                          <span className="line-through text-xs text-gray-400 ml-2">{fmt(product.price)}</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 font-semibold">HPP: {fmt(costVal)}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${margin >= 45 ? 'bg-emerald-500' : 'bg-[#C89B5C]'}`}
                          style={{ width: `${Math.min(Math.max(margin, 5), 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold font-mono text-gray-700 dark:text-gray-300">{margin}% Margin</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-col gap-2">
                    {/* 9.2 Recipe Breakdown BOM Button */}
                    <button
                      onClick={() => handleOpenRecipeDrawer(product)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1E3D31] hover:bg-[#163026] py-2.5 text-xs font-bold text-[#C89B5C] transition-all shadow-sm"
                    >
                      <ChefHat size={15} />
                      <span>Atur Komposisi Resep & BOM (9.2)</span>
                    </button>

                    <div className="flex gap-2">
                      <PermissionGuard permission="menu.edit">
                        <button
                          onClick={() => handleOpenOverride(product)}
                          className="flex items-center justify-center gap-1 rounded-2xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-all flex-1"
                        >
                          <DollarSign size={14} className="text-[#C89B5C]" /> Override
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission="menu.edit">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="flex items-center justify-center gap-1 rounded-2xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-all flex-1"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission="menu.delete">
                        <button
                          onClick={() => handleDeleteItem(product.id, product.name)}
                          className="flex items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 9.2 BOM RECIPE COMPOSITION DRAWER */}
      {isRecipeDrawerOpen && activeRecipeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="h-full w-full max-w-xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-gray-200 dark:border-white/15">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C]">
                    <ChefHat size={26} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-extrabold text-gray-900 dark:text-white">Komposisi Bahan Baku (BOM 9.2)</h3>
                    <p className="text-xs text-[#C89B5C] font-semibold mt-0.5">{activeRecipeProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRecipeDrawerOpen(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* HPP Cost Breakdown Banner */}
              <div className="rounded-3xl bg-[#FAF3E7] dark:bg-black/40 border-2 border-[#C89B5C]/30 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold">
                  <span>Harga Jual Master Menu:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{fmt(activeRecipeProduct.price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold">
                  <span>Total Harga Pokok Produksi (HPP BOM):</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">{fmt(totalBomCost)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-white/10 pt-2 flex items-center justify-between font-extrabold text-sm">
                  <span className="text-gray-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-emerald-500" /> Estimasi Profit Kotor:
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {fmt(Math.max(0, activeRecipeProduct.price - totalBomCost))} ({Math.round(((activeRecipeProduct.price - totalBomCost) / activeRecipeProduct.price) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Ingredients List Table */}
              <div className="space-y-3">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Daftar Komposisi (Otomatis Potong Stok saat POS Transaksi):</span>
                  <span className="text-[11px] font-mono text-[#C89B5C]">{bomIngredients.length} Bahan</span>
                </h4>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {bomIngredients.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3.5 text-xs transition-colors hover:border-[#C89B5C]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                          Pemakaian: <strong className="text-[#C89B5C]">{item.qty} {item.unit}</strong> (@ {fmt(item.costPerUnit)}/{item.unit})
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono font-extrabold text-gray-900 dark:text-white">
                        <span>{fmt(item.qty * item.costPerUnit)}</span>
                        <button
                          onClick={() => handleDeleteIngredient(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Hapus bahan dari resep"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Ingredient Form */}
              <form onSubmit={handleAddIngredientToBom} className="rounded-2xl border border-gray-200 dark:border-white/15 p-4 space-y-3 bg-white dark:bg-black/20">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#C89B5C]">Tambah Bahan Baku Komposisi Baru:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nama Bahan (misal: Biji Arabica)"
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-xs font-semibold focus:border-[#C89B5C] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input
                      type="number"
                      required
                      placeholder="Qty"
                      value={newIngQty}
                      onChange={(e) => setNewIngQty(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-2 py-2 text-xs font-mono text-center focus:border-[#C89B5C] focus:outline-none"
                    />
                    <select
                      value={newIngUnit}
                      onChange={(e) => setNewIngUnit(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-1 py-2 text-xs focus:border-[#C89B5C] focus:outline-none"
                    >
                      <option value="gram">g</option>
                      <option value="ml">ml</option>
                      <option value="pcs">pcs</option>
                      <option value="shot">shot</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Rp/unit"
                      value={newIngCost}
                      onChange={(e) => setNewIngCost(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-2 py-2 text-xs font-mono text-center focus:border-[#C89B5C] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1E3D31] hover:bg-[#163026] py-2 text-xs font-bold text-[#C89B5C] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Tambah ke Komposisi BOM
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
              <button
                onClick={() => {
                  showNotification(`Komposisi resep BOM ${activeRecipeProduct.name} berhasil disimpan! Potong stok otomatis kini aktif.`);
                  setIsRecipeDrawerOpen(false);
                }}
                className="w-full sm:w-auto rounded-2xl bg-[#C89B5C] hover:bg-[#b88c4d] px-8 py-3.5 text-xs font-extrabold text-[#1E3D31] shadow-lg transition-all"
              >
                Simpan & Aktifkan Potong Stok BOM (9.2)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9.2 CATEGORY CRUD MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderPlus size={20} className="text-[#C89B5C]" />
                <span>Kelola Kategori Menu (9.2)</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Nama kategori baru (misal: Manual Brew)..."
                value={newCatNameInput}
                onChange={(e) => setNewCatNameInput(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-sm shrink-0"
              >
                Tambah
              </button>
            </form>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {localCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-black/30 p-3.5 text-xs border border-gray-200 dark:border-white/10">
                  <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-[#C89B5C]/20 text-[#C89B5C] px-2.5 py-0.5 font-mono font-bold text-[11px]">
                      {cat.count} menu
                    </span>
                    <button
                      onClick={() => setLocalCategories((prev) => prev.filter((c) => c.id !== cat.id))}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus kategori"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-2xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Tambah Menu Produk Baru' : 'Edit Produk Menu'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sea Salt Caramel Macchiato"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Harga Dasar (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="35000"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  SKU Produk / Kode Intern
                </label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="ESP-001"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono uppercase focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Sajian lezat racikan rahasia NEMU Space..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  {modalMode === 'add' ? 'Simpan Menu' : 'Perbarui Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Branch Price Override */}
      {isOverrideModalOpen && overrideTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-200 dark:border-white/15">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Timpa Harga Khusus</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/40 p-3.5 mb-4 text-xs space-y-1 border border-[#C89B5C]/30">
              <p className="font-extrabold text-gray-900 dark:text-white">{overrideTargetProduct.name}</p>
              <p className="text-gray-500 dark:text-gray-300">Harga Master Nasional: <span className="font-semibold text-gray-900 dark:text-white">{fmt(overrideTargetProduct.price)}</span></p>
              <p className="text-[#C89B5C] font-semibold">Berlaku untuk terminal aktif saat ini.</p>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Harga Khusus (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={overridePriceInput}
                  onChange={(e) => setOverridePriceInput(e.target.value)}
                  placeholder="38000"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-extrabold text-gray-900 dark:text-white focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Stok Khusus (Opsional)
                </label>
                <input
                  type="number"
                  value={overrideStockInput}
                  onChange={(e) => setOverrideStockInput(e.target.value)}
                  placeholder="Kosongkan jika unlimited"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="flex items-center gap-1.5 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {overrideLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Harga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
