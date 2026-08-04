'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getPosMenus, PosMenu, createOrder } from '@/shared/services/pos.service';
import { useCartStore } from '@/store/cart.store';
import api from '@/shared/api/axios';
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

interface StoreSettings {
  store_name: string;
  address: string;
  phone: string;
  instagram?: string;
}

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

  // BUG FIX 1: Store settings from DB instead of hardcoded
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: 'NEMU COFFEE',
    address: 'Jl. Mawar No.10 Kediri',
    phone: '0812-3456-7890',
    instagram: '@nemucoffee',
  });

  const cart = useCartStore();

  useEffect(() => {
    fetchMenus();
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data?.data;
      if (data) {
        // BUG FIX 1: settings API returns { general: {...}, social_media: [...] }
        const general = data.general || data;
        const instagramEntry = Array.isArray(data.social_media)
          ? data.social_media.find((s: any) => s.platform?.toLowerCase() === 'instagram')
          : null;

        setStoreSettings({
          store_name: general.site_name || general.store_name || 'NEMU COFFEE',
          address: general.address || 'Jl. Mawar No.10 Kediri',
          phone: general.phone || '0812-3456-7890',
          instagram: instagramEntry?.url || instagramEntry?.handle || '',
        });
      }
    } catch (err) {
      // Silently fallback to defaults
      console.warn('Could not fetch store settings, using defaults.');
    }
  };

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

  const handlePrint = () => {
    if (!completedTransaction) return;

    const fmtNum = (amount: number) => new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount);

    const itemsHtml = (completedTransaction.items || []).map((item: any) => `
      <div class="item-row">
        <span class="item-name">${item.menu_name_snapshot}</span>
        <span class="item-qty">x${item.quantity}</span>
        <span class="item-price">${fmtNum(item.subtotal)}</span>
      </div>
      ${item.note ? `<div class="item-note">  - Catatan: ${item.note}</div>` : ''}
    `).join('');

    const discountHtml = completedTransaction.discount > 0
      ? `<div class="row"><span>Diskon</span><span>-${fmtNum(completedTransaction.discount)}</span></div>` : '';

    const taxAmount = parseFloat(completedTransaction.tax_amount || '0');
    const taxHtml = taxAmount > 0
      ? `<div class="row"><span>PPN</span><span>${fmtNum(taxAmount)}</span></div>` : '';

    const cashHtml = completedTransaction.payment_method === 'tunai' ? `
      <div class="row"><span>Bayar</span><span>${fmtNum(completedTransaction.cashGiven || completedTransaction.total)}</span></div>
      <div class="row"><span>Kembali</span><span>${fmtNum(completedTransaction.changeAmount || 0)}</span></div>
    ` : '';

    const d = new Date(completedTransaction.created_at || Date.now());
    const tanggal = d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const kasir = completedTransaction.cashier?.name || 'Kasir';
    const pelanggan = completedTransaction.customer_name || 'Pelanggan';

    // BUG FIX 1: Use dynamic store settings
    const storeName = storeSettings.store_name.toUpperCase();
    const storeAddress = storeSettings.address;
    const storePhone = storeSettings.phone;
    const storeInstagram = storeSettings.instagram || '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Struk ${completedTransaction.invoice_number}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; color: #000000; }
    html, body {
      width: 80mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      font-weight: bold;
      line-height: 1.4;
      color: #000000;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt {
      width: 72mm;
      margin: 6mm auto 8mm auto;
      word-break: break-word;
    }
    .header { text-align: center; margin-bottom: 4mm; }
    .header h1 { font-size: 15px; font-weight: bold; letter-spacing: 1px; margin-bottom: 1mm; }
    .header p { font-size: 10px; }
    hr { border: none; border-top: 1px dashed #000; margin: 2mm 0; }
    .meta { margin: 2mm 0; }
    .row { display: flex; justify-content: space-between; gap: 2mm; margin: 0.8mm 0; }
    .item-row { display: flex; justify-content: space-between; gap: 2mm; margin: 1mm 0; }
    .item-name { flex: 1; text-align: left; }
    .item-qty { width: 30px; text-align: center; }
    .item-price { width: 70px; text-align: right; }
    .item-note { font-size: 10px; font-style: italic; margin-bottom: 1mm; }
    .summary { margin-top: 2mm; }
    .footer { text-align: center; margin-top: 5mm; font-size: 10px; line-height: 1.5; }
    .upper { text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${storeName}</h1>
      <p>${storeAddress}</p>
      <p>${storePhone}</p>
    </div>
    <hr>
    <div class="meta">
      <div class="row"><span>Invoice : ${completedTransaction.invoice_number}</span></div>
      <div class="row"><span>Tanggal : ${tanggal}</span></div>
      <div class="row"><span>Jam     : ${jam}</span></div>
      <div class="row"><span>Kasir   : ${kasir}</span></div>
      <div class="row"><span>Pelanggan: ${pelanggan}</span></div>
    </div>
    <hr>
    <div class="items">${itemsHtml}</div>
    <hr>
    <div class="summary">
      <div class="row"><span>Subtotal</span><span>${fmtNum(completedTransaction.subtotal)}</span></div>
      ${discountHtml}
      ${taxHtml}
      <div class="row" style="font-size:12px; font-weight:bold;"><span>Total</span><span>${fmtNum(completedTransaction.total)}</span></div>
      <br>
      ${cashHtml}
      <div class="row"><span>Metode Bayar</span><span class="upper">${completedTransaction.payment_method}</span></div>
    </div>
    <hr>
    <div class="footer">
      <p>Terima kasih</p>
      <p>Sampai jumpa kembali</p>
      ${storeInstagram ? `<br><p>Instagram: ${storeInstagram}</p>` : ''}
    </div>
  </div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=350,height=600');
    if (!w) { alert('Pop-up diblokir. Izinkan pop-up untuk mencetak struk.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  const handlePrintKitchen = () => {
    if (!completedTransaction) return;

    const itemsHtml = (completedTransaction.items || []).map((item: any) => {
      let variantsList = '';
      if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
        variantsList = item.variants.map((v: any) => `  - ${v.variant_option_name || v.name}`).join('<br>');
      }
      return `
        <div class="kitchen-item">
          <div class="item-name">${item.quantity}x ${item.menu_name_snapshot}</div>
          ${variantsList ? `<div class="item-sub">${variantsList}</div>` : ''}
          ${item.note ? `<div class="item-sub">  - ${item.note}</div>` : ''}
        </div>
      `;
    }).join('');

    const d = new Date(completedTransaction.created_at || Date.now());
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const orderTypeLabel = completedTransaction.order_type === 'takeaway' 
      ? 'Take Away' 
      : `Dine In ${completedTransaction.table_number ? `(Meja ${completedTransaction.table_number})` : ''}`;
    
    const customer = completedTransaction.customer_name || 'Pelanggan';
    const invoiceShort = completedTransaction.invoice_number ? completedTransaction.invoice_number.slice(-4) : '001';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Barista Order #${invoiceShort}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; color: #000000; }
    html, body {
      width: 80mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.4;
      color: #000000;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt {
      width: 72mm;
      margin: 6mm auto 8mm auto;
      word-break: break-word;
    }
    .border-line { text-align: center; letter-spacing: 0px; font-weight: bold; }
    .header-title { text-align: center; font-size: 15px; font-weight: bold; margin: 2mm 0; }
    .order-info { margin: 3mm 0; }
    .order-info .order-id { font-size: 14px; font-weight: bold; margin-bottom: 1mm; }
    .order-info .order-type { font-size: 13px; font-weight: bold; margin-top: 2mm; }
    hr { border: none; border-top: 1px dashed #000; margin: 3mm 0; }
    .kitchen-item { margin: 3mm 0; }
    .item-name { font-size: 14px; font-weight: bold; }
    .item-sub { font-size: 12px; font-weight: normal; margin-top: 1mm; white-space: pre-wrap; }
    .meta-section { margin: 2mm 0; display: flex; justify-content: space-between; align-items: flex-start; }
    .meta-label { font-size: 13px; font-weight: bold; }
    .meta-val { font-size: 13px; font-weight: bold; text-align: right; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="border-line">******************************</div>
    <div class="header-title">BARISTA ORDER</div>
    <div class="border-line">******************************</div>
    
    <div class="order-info">
      <div class="order-id">Order #${invoiceShort}</div>
      <div style="font-size: 12px; font-weight: normal; margin-top: 1mm;">${jam}</div>
      <div class="order-type">${orderTypeLabel}</div>
    </div>
    
    <hr>
    <div class="items">${itemsHtml}</div>
    <hr>
    
    <div class="meta-section">
      <div class="meta-label">Customer</div>
      <div class="meta-val">${customer}</div>
    </div>
    
    ${completedTransaction.note ? `
    <hr>
    <div class="meta-section">
      <div class="meta-label">Note</div>
      <div class="meta-val">${completedTransaction.note}</div>
    </div>
    ` : ''}

    <div class="border-line" style="margin-top: 4mm;">******************************</div>
  </div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=350,height=600');
    if (!w) { alert('Pop-up diblokir. Izinkan pop-up untuk mencetak struk.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
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
      
      {/* Struk dicetak lewat handlePrint() — window baru, bukan @media print */}



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
              <div id="receipt-area" className="p-6 bg-white text-black font-mono flex-1 overflow-y-auto">
                <div className="text-center mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-0.5 text-black">NEMU Space</h2>
                  <p className="text-[11px] text-black">Jl. Senopati Raya No. 88, Jakarta</p>
                  <p className="text-[11px] text-black">Telp: 0811-2345-6789</p>
                </div>
                
                <div className="border-t border-b border-dashed border-black py-2 mb-3 text-[11px] font-mono text-black space-y-0.5">
                  <div className="flex justify-between"><span>No. Struk</span><span>{completedTransaction.invoice_number}</span></div>
                  <div className="flex justify-between"><span>Tanggal</span><span>{new Date(completedTransaction.created_at).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Kasir</span><span>{completedTransaction.cashier?.name || 'Kasir'}</span></div>
                  {completedTransaction.customer_name && completedTransaction.customer_name !== 'Pelanggan' && (
                    <div className="flex justify-between"><span>Pelanggan</span><span>{completedTransaction.customer_name}</span></div>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  {completedTransaction.items?.map((item: any) => (
                    <div key={item.id} className="text-[11px] text-black">
                      <div className="font-bold">{item.menu_name_snapshot}</div>
                      <div className="flex justify-between text-black mt-0.5">
                        <span>{item.quantity} x {formatCurrency(item.price_snapshot)}</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                      {item.note && <div className="text-[10px] text-black italic">Catatan: {item.note}</div>}
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-black pt-2 text-[11px] text-black space-y-1">
                  <div className="flex justify-between text-black">
                    <span>Subtotal</span>
                    <span>{formatCurrency(completedTransaction.subtotal)}</span>
                  </div>
                  {completedTransaction.discount > 0 && (
                    <div className="flex justify-between text-black">
                      <span>Diskon</span>
                      <span>-{formatCurrency(completedTransaction.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[13px] text-black mt-1.5 pt-1.5 border-t border-dashed border-black">
                    <span>TOTAL</span>
                    <span>{formatCurrency(completedTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-black mt-1">
                    <span>Metode Bayar</span>
                    <span className="uppercase">{completedTransaction.payment_method}</span>
                  </div>
                  {completedTransaction.payment_method === 'tunai' && (
                    <>
                      <div className="flex justify-between text-black mt-0.5">
                        <span>Tunai Diterima</span>
                        <span>{formatCurrency(completedTransaction.cashGiven || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-black mt-0.5">
                        <span>Kembalian</span>
                        <span>{formatCurrency(completedTransaction.changeAmount || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 text-center text-[10px] text-black space-y-0.5">
                  <p className="font-bold">Terima kasih atas kunjungan Anda!</p>
                  <p>www.nemuspace.id</p>
                </div>
              </div>

              <div className="p-4 border-t flex flex-col sm:flex-row gap-2 print:hidden bg-gray-50">
                <button
                  onClick={() => setCompletedTransaction(null)}
                  className="py-3 px-2 sm:px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-colors flex-1 whitespace-nowrap"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 px-2 sm:px-4 rounded-xl bg-accent text-primary font-bold hover:bg-[#b88c4d] transition-colors flex items-center justify-center gap-1 sm:gap-2 flex-1 text-xs whitespace-nowrap"
                >
                  <Printer size={16} /> Struk Kasir
                </button>
                <button
                  onClick={handlePrintKitchen}
                  className="py-3 px-2 sm:px-4 rounded-xl bg-amber-800 text-white font-bold hover:bg-amber-900 transition-colors flex items-center justify-center gap-1 sm:gap-2 flex-1 text-xs whitespace-nowrap"
                >
                  <Coffee size={16} /> Tiket Dapur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
