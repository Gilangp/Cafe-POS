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
        items: cart.items.map(i => ({
          menu_id: i.menu_id,
          quantity: i.quantity,
          note: i.note
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
    <div className="flex flex-col lg:flex-row h-full gap-6">
      
      {/* LEFT: MENU CATALOG */}
      <div className="lg:w-[70%] flex-1 flex flex-col min-h-0 bg-white dark:bg-[#1A2620] rounded-2xl shadow-card-shadow border border-black/5 dark:border-white/5 overflow-hidden">
        
        {/* Top Bar: Search & Categories */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary dark:text-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold transition-colors ${
                  selectedCategory === cat 
                  ? 'bg-primary dark:bg-accent text-white dark:text-primary shadow-md' 
                  : 'bg-gray-50 dark:bg-white/5 text-primary/70 dark:text-cream-400 hover:bg-gray-200 dark:hover:bg-white/10'
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
                onClick={() => cart.addItem({
                  menu_id: menu.id,
                  name: menu.name,
                  price: menu.price,
                  quantity: 1,
                  note: '',
                  image: menu.image
                })}
                className="bg-white dark:bg-[#2A3F33] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group flex flex-col"
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
                    <h3 className="text-sm font-bold text-primary dark:text-white leading-tight mb-1 line-clamp-2">
                      {menu.name}
                    </h3>
                  </div>
                  <div className="mt-2 text-accent font-bold text-sm">
                    {formatCurrency(menu.price)}
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


      {/* RIGHT: CART PANEL */}
      <div className="w-full lg:w-[30%] flex flex-col min-h-0 bg-white dark:bg-[#1A2620] rounded-2xl shadow-card-shadow border border-black/5 dark:border-white/5 shrink-0">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-primary text-white rounded-t-2xl">
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
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'dine_in' ? 'bg-[#1E3D31] text-accent shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
               >
                 Dine In
               </button>
               <button 
                  onClick={() => { setOrderType('takeaway'); setAssignedTable(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'takeaway' ? 'bg-[#1E3D31] text-accent shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
               >
                 Takeaway
               </button>
             </div>
             
             {orderType === 'dine_in' && (
               <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-3 ml-1 w-24">
                 <MapPin size={14} className="text-gray-400 shrink-0" />
                 <input 
                   value={assignedTable}
                   onChange={(e) => setAssignedTable(e.target.value)}
                   placeholder="No. Meja"
                   className="bg-transparent border-none focus:outline-none text-xs font-bold text-primary dark:text-white w-full placeholder-gray-400"
                 />
               </div>
             )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
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
                  className="flex gap-3 bg-gray-50 dark:bg-[#2A3F33]/30 p-3 rounded-xl border border-black/5 dark:border-white/5"
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
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#1A2620] rounded-b-2xl space-y-4">
          
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
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 border rounded-xl transition-all ${
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

          <div className="space-y-2 text-sm font-semibold">
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
            <div className="flex justify-between text-lg font-bold text-primary dark:text-white pt-2 border-t border-black/5 dark:border-white/10">
              <span>Total</span>
              <span className="text-accent">{formatCurrency(cart.getTotal())}</span>
            </div>
          </div>

          {cart.paymentMethod === 'tunai' && (
            <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-3">
              <div className="bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10 p-3 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tunai Diterima</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-400">Rp</span>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-right text-xl font-bold text-primary dark:text-white focus:outline-none placeholder-gray-300"
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
                <span className="text-sm font-bold text-gray-500">KEMBALIAN</span>
                <span className="text-lg font-bold text-primary dark:text-white">
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
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:bg-white print:p-0 print:block"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:max-w-full print:w-full print:max-h-none"
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
