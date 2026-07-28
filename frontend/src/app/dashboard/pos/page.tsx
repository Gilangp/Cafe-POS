'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getPosMenus, PosMenu, createOrder } from '@/shared/services/pos.service';
import { useCartStore } from '@/store/cart.store';
import { 
  Search, 
  Coffee, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Printer,
  X,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PosPage() {
  const [menus, setMenus] = useState<PosMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [showQrisModal, setShowQrisModal] = useState(false);
  
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | null>(null);
  const [assignedTable, setAssignedTable] = useState('');
  const [customerName, setCustomerName] = useState('');

  const [selectedMenuForVariants, setSelectedMenuForVariants] = useState<PosMenu | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});

  const cart = useCartStore();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const data = await getPosMenus();
      setMenus(data);
    } catch (err: any) {
      setError('Gagal memuat daftar menu. Pastikan Anda memiliki akses.');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    menus.forEach(m => {
      if (m.category?.name) cats.add(m.category.name);
    });
    return ['all', ...Array.from(cats)];
  }, [menus]);

  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || m.category?.name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [menus, searchQuery, selectedCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleProcessOrder = async () => {
    if (cart.items.length === 0) return;
    
    if (!orderType) {
      setError('Pilih Dine In atau Takeaway terlebih dahulu!');
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    if (orderType === 'dine_in' && !assignedTable.trim()) {
      setError('Nomor Meja wajib diisi untuk pesanan Dine In!');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!customerName.trim()) {
      setError('Nama Pelanggan wajib diisi!');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (cart.paymentMethod === 'tunai' && (Number(cashGiven) < cart.getTotal())) {
      setError('Nominal uang tunai tidak mencukupi.');
      return;
    }

    if (cart.paymentMethod === 'qris') {
      setShowQrisModal(true);
      return;
    }

    await executeOrder();
  };

  const executeOrder = async () => {
    setIsProcessing(true);
    setSuccessMessage('');
    setError('');

    try {
      const finalOrderType = orderType ?? 'dine_in';
      const payload = {
        payment_method: cart.paymentMethod,
        discount: cart.discount,
        order_type: finalOrderType,
        table_number: finalOrderType === 'takeaway' ? null : (assignedTable.trim() || null),
        customer_name: customerName.trim() || null,
        items: cart.items.map(i => ({
          menu_id: i.menu_id,
          quantity: i.quantity,
          note: i.note,
          variants: i.variants || []
        }))
      };

      const res = await createOrder(payload);
      setCompletedTransaction({
        ...res.data,
        cashGiven: cart.paymentMethod === 'tunai' ? Number(cashGiven) : null,
        changeAmount: cart.paymentMethod === 'tunai' ? Number(cashGiven) - cart.getTotal() : null
      });
      cart.clearCart();
      setCashGiven('');
      setShowQrisModal(false);
      setOrderType(null);
      setAssignedTable('');
      setCustomerName('');
      
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memproses pesanan.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-primary/60 dark:text-cream-400 font-medium">Memuat katalog menu POS...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)] lg:min-h-[650px] gap-6">
      
      {/* Print Styles for Thermal Printer */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Sembunyikan elemen dashboard (sidebar, header, dsb) */
          aside, header, nav {
            display: none !important;
          }
          
          /* Sembunyikan semua elemen di halaman POS kecuali modal receipt */
          .pos-content-left, .pos-content-right {
            display: none !important;
          }

          /* Reset semua layout wrapper agar tingginya auto (menghilangkan sisa space kosong) */
          *, body, html {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
          }

          /* Tampilkan modal receipt di pojok kiri atas seperti dokumen biasa */
          .receipt-modal-overlay {
            position: static !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }
          
          .receipt-modal-content {
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #receipt-area {
            overflow: visible !important;
            padding: 0 2mm !important; /* Jarak aman 2mm di sisi kiri dan kanan */
            color: black !important;
            max-height: none !important;
            width: 100% !important; 
            max-width: 100% !important; 
            margin: 0 !important;
            box-sizing: border-box !important;
          }

          /* Perkecil semua teks dan jarak khusus untuk 58mm printer */
          #receipt-area h2 { font-size: 14px !important; line-height: 1.2 !important; margin-bottom: 2px !important; }
          #receipt-area .text-xs, #receipt-area .text-sm { font-size: 10px !important; line-height: 1.2 !important; }
          #receipt-area .text-lg { font-size: 12px !important; }
          #receipt-area .text-xl { font-size: 14px !important; }
          
          /* Perkecil padding dan margin bawaan Tailwind */
          #receipt-area .mb-6 { margin-bottom: 3mm !important; }
          #receipt-area .mb-4 { margin-bottom: 2mm !important; }
          #receipt-area .py-3 { padding-top: 2mm !important; padding-bottom: 2mm !important; }
          #receipt-area .pt-3 { padding-top: 2mm !important; }
          #receipt-area .mt-2 { margin-top: 1mm !important; }
          #receipt-area .mt-8 { margin-top: 4mm !important; }

          @page {
            margin: 0;
            size: auto; /* Memaksa browser mengikuti tinggi konten jika didukung driver */
          }
        }
      `}} />

      <div className="pos-content-left lg:w-[70%] flex-1 flex flex-col min-h-0 bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        
        {/* Top Bar: Search & Categories */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 focus:border-accent focus:outline-none text-primary dark:text-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat 
                  ? 'bg-primary text-accent shadow-sm' 
                  : 'bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-accent hover:text-accent'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-transparent">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenus.map((menu) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={menu.id}
                onClick={() => {
                  if (menu.variant_groups && menu.variant_groups.length > 0) {
                    setSelectedMenuForVariants(menu);
                    setSelectedVariants({});
                  } else {
                    cart.addItem({
                      menu_id: menu.id,
                      name: menu.name,
                      price: Number(menu.price),
                      quantity: 1,
                      note: '',
                      image: menu.image
                    });
                  }
                }}
                className="bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 cursor-pointer overflow-hidden transition-all hover:shadow-glow hover:border-accent/40 group flex flex-col"
              >
                <div className="aspect-square bg-gray-100 dark:bg-black/40 relative overflow-hidden">
                  {menu.image ? (
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/10">
                      <Coffee size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Plus size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-primary dark:text-white leading-tight mb-1 truncate">
                      {menu.name}
                    </h3>
                  </div>
                  <div className="mt-2 text-accent font-bold text-sm">
                    {formatCurrency(Number(menu.price))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredMenus.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Tidak ada menu yang sesuai pencarian.
            </div>
          )}
        </div>
      </div>


      <div className="pos-content-right w-full lg:w-[30%] flex flex-col min-h-0 bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm shrink-0 overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-primary text-accent rounded-t-3xl border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart size={20} className="text-accent shrink-0" />
            <h2 className="font-heading font-bold text-base xl:text-lg truncate">Pesanan Saat Ini</h2>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs xl:text-sm font-bold shrink-0 ml-2">
            {cart.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items
          </div>
        </div>

        {/* Dine In / Takeaway Toggle (Top of Cart) */}
        <div className="p-3 border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black/10">
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-1.5 rounded-xl">
             <div className="flex gap-1 flex-1">
               <button 
                  onClick={() => setOrderType('dine_in')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'dine_in' ? 'bg-primary text-accent shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
               >
                 Dine In
               </button>
               <button 
                  onClick={() => { setOrderType('takeaway'); setAssignedTable(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'takeaway' ? 'bg-primary text-accent shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
               >
                 Takeaway
               </button>
             </div>
             
             {orderType === 'dine_in' && (
               <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-3 ml-1 w-20">
                 <MapPin size={14} className="text-gray-400 shrink-0" />
                 <input 
                   value={assignedTable}
                   onChange={(e) => setAssignedTable(e.target.value)}
                   placeholder="Meja"
                   className="bg-transparent border-none focus:outline-none text-xs font-bold text-primary dark:text-white w-full placeholder-gray-400"
                 />
               </div>
             )}
          </div>
          
          {orderType && (
            <div className="mt-2 flex items-center gap-2 bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-2 rounded-xl">
              <input 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pelanggan"
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-primary dark:text-white w-full placeholder-gray-400 px-2"
              />
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 min-h-0">
          <AnimatePresence>
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                <ShoppingCart size={48} />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={item.cart_id}
                  className="flex gap-3 bg-white dark:bg-[#1A2620] p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-accent/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-black/40 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Coffee size={24} className="text-gray-400"/></div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col min-w-0 justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-primary dark:text-white leading-tight line-clamp-2">
                        {item.name}
                      </h4>
                      <button onClick={() => cart.removeItem(item.cart_id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="text-sm font-bold text-accent">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-lg p-1 border border-black/5 dark:border-white/5">
                        <button 
                          onClick={() => cart.updateQuantity(item.cart_id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 rounded text-primary dark:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => cart.updateQuantity(item.cart_id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 rounded text-primary dark:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Summary & Checkout */}
        <div className="p-3 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#1A2620] rounded-b-3xl space-y-3 shrink-0">
          
          <div className="flex gap-2">
            {[
              { id: 'tunai', icon: Banknote, label: 'Tunai' },
              { id: 'qris', icon: QrCode, label: 'QRIS' }
            ].map((method) => {
              const Icon = method.icon;
              const isActive = cart.paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => cart.setPaymentMethod(method.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 border rounded-xl transition-all ${
                    isActive 
                    ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm' 
                    : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-white dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{method.label}</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-1.5 text-sm font-semibold">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.getSubtotal())}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Diskon</span>
                <span>-{formatCurrency(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-primary dark:text-white pt-1.5 border-t border-black/5 dark:border-white/10">
              <span>Total</span>
              <span className="text-accent">{formatCurrency(cart.getTotal())}</span>
            </div>
          </div>

          {cart.paymentMethod === 'tunai' && (
            <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-2">
              <div className="bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 block">Tunai Diterima</label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-400">Rp</span>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-right text-lg font-bold text-primary dark:text-white focus:outline-none placeholder-gray-300"
                    value={cashGiven !== '' ? new Intl.NumberFormat('id-ID').format(cashGiven) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCashGiven(val ? Number(val) : '');
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-gray-500">KEMBALIAN</span>
                <span className="text-base font-bold text-primary dark:text-white">
                  {formatCurrency(Math.max(0, (Number(cashGiven) || 0) - cart.getTotal()))}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {successMessage}
            </div>
          )}

          <button
            onClick={handleProcessOrder}
            disabled={
              cart.items.length === 0 || 
              isProcessing || 
              (cart.paymentMethod === 'tunai' && (Number(cashGiven) < cart.getTotal()))
            }
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shrink-0 ${
              cart.items.length === 0 || isProcessing || (cart.paymentMethod === 'tunai' && (Number(cashGiven) < cart.getTotal()))
                ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed dark:bg-white/5 dark:text-white/20'
                : 'bg-gradient-to-r from-[#C89B5C] to-[#b88c4d] text-[#1E3D31] shadow-[0_4px_14px_0_rgba(200,155,92,0.39)] hover:shadow-[0_6px_20px_rgba(200,155,92,0.23)]'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="flex items-center justify-between w-full px-4">
                <span className="tracking-wide">PROSES BAYAR</span>
                <span className="bg-black/10 px-2 py-1 rounded-lg shadow-sm text-sm">{formatCurrency(cart.getTotal())}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VARIANT MODAL */}
      <AnimatePresence>
        {selectedMenuForVariants && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1A2620] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-black/5 dark:border-white/10"
            >
              {/* Header with gradient & optional image context */}
              <div className="relative p-6 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#1A2620] dark:to-[#2A3F33] flex justify-between items-start shrink-0">
                <div className="flex gap-4 items-center min-w-0 flex-1 pr-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-black/40 overflow-hidden shrink-0 shadow-inner">
                    {selectedMenuForVariants.image ? (
                      <img src={selectedMenuForVariants.image} alt={selectedMenuForVariants.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Coffee size={28} className="text-gray-400 dark:text-white/30"/></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-black text-xl text-primary dark:text-white leading-tight mb-1 truncate">
                      {selectedMenuForVariants.name}
                    </h3>
                    <p className="text-accent font-bold text-sm truncate">
                      Mulai dari {formatCurrency(Number(selectedMenuForVariants.price))}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMenuForVariants(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors absolute top-4 right-4"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-gray-50/50 dark:bg-transparent">
                {selectedMenuForVariants.variant_groups?.map(group => (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-primary dark:text-white flex items-center gap-2">
                        {group.name} 
                      </h4>
                      {group.pivot?.is_required ? (
                        <span className="text-[10px] font-black tracking-wider uppercase text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md border border-red-100 dark:border-red-500/20">Wajib</span>
                      ) : (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">Opsional</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {group.options.map(opt => {
                        const isSelected = group.type === 'single' 
                          ? selectedVariants[group.id]?.id === opt.id
                          : selectedVariants[group.id]?.some((v: any) => v.id === opt.id);
                          
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedVariants(prev => {
                                const newVars = { ...prev };
                                if (group.type === 'single') {
                                  newVars[group.id] = opt;
                                } else {
                                  const current = Array.isArray(newVars[group.id]) ? newVars[group.id] : [];
                                  if (isSelected) {
                                    newVars[group.id] = current.filter((v: any) => v.id !== opt.id);
                                  } else {
                                    newVars[group.id] = [...current, opt];
                                  }
                                }
                                return newVars;
                              });
                            }}
                            className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 ${
                              isSelected 
                                ? 'border-accent bg-accent/10 text-primary dark:text-accent shadow-[0_0_15px_rgba(200,155,92,0.15)]' 
                                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#2A3F33] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-sm'
                            }`}
                          >
                            <span>{opt.name}</span>
                            {Number(opt.additional_price) > 0 && (
                              <span className={`text-xs ${isSelected ? 'text-accent font-black' : 'text-gray-400 font-semibold'}`}>
                                +{formatCurrency(Number(opt.additional_price))}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1A2620] shrink-0">
                <button
                  onClick={() => {
                    let isValid = true;
                    selectedMenuForVariants.variant_groups?.forEach(g => {
                      if (g.pivot?.is_required) {
                        if (g.type === 'single' && !selectedVariants[g.id]) isValid = false;
                        if (g.type === 'multiple' && (!selectedVariants[g.id] || selectedVariants[g.id].length === 0)) isValid = false;
                      }
                    });
                    
                    if (!isValid) {
                      alert('Silakan lengkapi semua varian yang wajib dipilih!');
                      return;
                    }
                    
                    let extraPrice = 0;
                    const notes: string[] = [];
                    const variantIds: string[] = [];
                    Object.values(selectedVariants).forEach(val => {
                      if (Array.isArray(val)) {
                        val.forEach(v => {
                          extraPrice += Number(v.additional_price);
                          notes.push(v.name);
                          variantIds.push(v.id);
                        });
                      } else {
                        extraPrice += Number(val.additional_price);
                        notes.push(val.name);
                        variantIds.push(val.id);
                      }
                    });
                    
                    cart.addItem({
                      menu_id: selectedMenuForVariants.id,
                      name: selectedMenuForVariants.name,
                      price: Number(selectedMenuForVariants.price) + extraPrice,
                      quantity: 1,
                      note: notes.join(', '),
                      image: selectedMenuForVariants.image,
                      variants: variantIds
                    });
                    
                    setSelectedMenuForVariants(null);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C89B5C] to-[#b88c4d] text-[#1E3D31] font-black text-base transition-all active:scale-[0.98] shadow-[0_4px_14px_0_rgba(200,155,92,0.39)] hover:shadow-[0_6px_20px_rgba(200,155,92,0.23)] flex items-center justify-between px-6"
                >
                  <span>TAMBAH KE KERANJANG</span>
                  <span className="bg-black/10 px-3 py-1 rounded-lg">
                    {(() => {
                        let extraPrice = 0;
                        Object.values(selectedVariants).forEach(val => {
                          if (Array.isArray(val)) {
                            val.forEach(v => { extraPrice += Number(v.additional_price); });
                          } else {
                            extraPrice += Number(val.additional_price);
                          }
                        });
                        return formatCurrency(Number(selectedMenuForVariants.price) + extraPrice);
                    })()}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QRIS MODAL SIMULATION */}
      <AnimatePresence>
        {showQrisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Pembayaran QRIS</h3>
                <button 
                  onClick={() => setShowQrisModal(false)}
                  className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                  <QrCode size={100} className="text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-primary mb-2">Total Tagihan</h4>
                <p className="text-3xl font-black text-accent mb-6">{formatCurrency(cart.getTotal())}</p>
                <p className="text-sm text-gray-500 mb-8">
                  Menunggu pelanggan melakukan scan dan pembayaran melalui aplikasi e-wallet atau m-banking...
                </p>

                <button
                  onClick={executeOrder}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-accent text-primary font-bold hover:bg-[#b88c4d] transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Simulasikan Pembayaran Berhasil</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECEIPT MODAL */}
      <AnimatePresence>
        {completedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="receipt-modal-content bg-white rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center print:hidden bg-gray-50">
                <h3 className="font-bold text-gray-800">Transaksi Sukses!</h3>
                <button 
                  onClick={() => setCompletedTransaction(null)}
                  className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Printable Area */}
              <div id="receipt-area" className="p-6 bg-white text-gray-900 flex-1 overflow-y-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-extrabold tracking-widest uppercase mb-1">NEMU Space</h2>
                  <p className="text-xs text-gray-500">Jl. Senopati Raya No. 88, Jakarta</p>
                  <p className="text-xs text-gray-500">Telp: 0811-2345-6789</p>
                </div>
                
                <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 text-xs font-mono text-gray-600 space-y-1">
                  <div className="flex justify-between"><span>No. Struk</span><span>{completedTransaction.invoice_number}</span></div>
                  <div className="flex justify-between"><span>Tanggal</span><span>{new Date(completedTransaction.created_at).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Kasir</span><span>{completedTransaction.cashier?.name || 'Kasir'}</span></div>
                  {completedTransaction.customer_name && completedTransaction.customer_name !== 'Pelanggan' && (
                    <div className="flex justify-between"><span>Pelanggan</span><span>{completedTransaction.customer_name}</span></div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {completedTransaction.items?.map((item: any) => (
                    <div key={item.id} className="text-sm">
                      <div className="font-bold">{item.menu_name_snapshot}</div>
                      <div className="flex justify-between text-gray-600 mt-1">
                        <span>{item.quantity} x {formatCurrency(item.price_snapshot)}</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                      {item.note && <div className="text-xs text-gray-400 italic">Catatan: {item.note}</div>}
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(completedTransaction.subtotal)}</span>
                  </div>
                  {completedTransaction.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(completedTransaction.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(completedTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mt-2">
                    <span>Metode Bayar</span>
                    <span className="uppercase">{completedTransaction.payment_method}</span>
                  </div>
                  {completedTransaction.payment_method === 'tunai' && (
                    <>
                      <div className="flex justify-between text-gray-600 mt-1">
                        <span>Tunai Diterima</span>
                        <span>{formatCurrency(completedTransaction.cashGiven || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-800 mt-1">
                        <span>Kembalian</span>
                        <span>{formatCurrency(completedTransaction.changeAmount || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-8 text-center text-xs text-gray-500">
                  <p>Terima kasih atas kunjungan Anda!</p>
                  <p>-- nemudespace.id --</p>
                </div>
              </div>

              <div className="p-4 border-t grid grid-cols-2 gap-3 print:hidden bg-gray-50">
                <button
                  onClick={() => setCompletedTransaction(null)}
                  className="py-3 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-3 px-4 rounded-xl bg-accent text-primary font-bold hover:bg-[#b88c4d] transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Cetak Struk
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
