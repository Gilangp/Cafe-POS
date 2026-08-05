'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getPosMenus, PosMenu, createOrder } from '@/shared/services/pos.service';
import { useCartStore } from '@/store/cart.store';
import api from '@/shared/api/axios';
import {
  Coffee, ShoppingCart,
  QrCode, Loader2, Printer, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MenuGrid from './MenuGrid';
import CartPanel from './CartPanel';

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
  const [variantNote, setVariantNote] = useState('');

  const [showCartOnMobile, setShowCartOnMobile] = useState(false);

  const [discountInput, setDiscountInput] = useState<number | ''>('');

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

const applyDiscount = (val: number | '') => {
    cart.setDiscount(val === '' ? 0 : Number(val));
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data?.data;
      if (data) {
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fmtNum = (amount: number) =>
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const isMenuAvailable = (menu: PosMenu) => menu.status !== 'tidak tersedia' && menu.status !== 'unavailable' && menu.status !== 'inactive';
  const handlePrint = () => {
    if (!completedTransaction) return;

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
    .receipt { width: 72mm; margin: 6mm auto 8mm auto; word-break: break-word; }
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
    .receipt { width: 72mm; margin: 6mm auto 8mm auto; word-break: break-word; }
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
          variants: i.variants || [],
        })),
      };

      const res = await createOrder(payload);
      setCompletedTransaction({
        ...res.data,
        cashGiven: cart.paymentMethod === 'tunai' ? Number(cashGiven) : null,
        changeAmount: cart.paymentMethod === 'tunai' ? Number(cashGiven) - cart.getTotal() : null,
      });
      cart.clearCart();
      setCashGiven('');
      setDiscountInput('');
      setShowQrisModal(false);
      setOrderType(null);
      setAssignedTable('');
      setCustomerName('');
      setShowCartOnMobile(false);
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
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground font-medium">Memuat katalog menu POS...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)] lg:min-h-[650px] gap-6">
      <div className="hidden lg:flex lg:w-[70%] flex-1 flex-col min-h-0 bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <MenuGrid
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredMenus={filteredMenus}
          isMenuAvailable={isMenuAvailable}
          formatCurrency={formatCurrency}
          cart={cart}
          setSelectedMenuForVariants={setSelectedMenuForVariants}
          setSelectedVariants={setSelectedVariants}
          setVariantNote={setVariantNote}
        />
      </div>

      <div className={`lg:hidden ${showCartOnMobile ? 'hidden' : 'flex'} flex-1 flex-col min-h-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden`}>
        <MenuGrid
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredMenus={filteredMenus}
          isMenuAvailable={isMenuAvailable}
          formatCurrency={formatCurrency}
          cart={cart}
          setSelectedMenuForVariants={setSelectedMenuForVariants}
          setSelectedVariants={setSelectedVariants}
          setVariantNote={setVariantNote}
        />
      </div>

      <div className="hidden lg:flex lg:w-[30%] flex-col min-h-0 shrink-0">
        <CartPanel
          cart={cart}
          orderType={orderType}
          setOrderType={setOrderType}
          assignedTable={assignedTable}
          setAssignedTable={setAssignedTable}
          customerName={customerName}
          setCustomerName={setCustomerName}
          cashGiven={cashGiven}
          setCashGiven={setCashGiven}
          discountInput={discountInput}
          setDiscountInput={setDiscountInput}
          applyDiscount={applyDiscount}
          formatCurrency={formatCurrency}
          error={error}
          isProcessing={isProcessing}
          handleProcessOrder={handleProcessOrder}
          setShowCartOnMobile={setShowCartOnMobile}
          fmtNum={fmtNum}
        />
      </div>

      {showCartOnMobile && (
        <CartPanel
          isMobileOverlay={true}
          cart={cart}
          orderType={orderType}
          setOrderType={setOrderType}
          assignedTable={assignedTable}
          setAssignedTable={setAssignedTable}
          customerName={customerName}
          setCustomerName={setCustomerName}
          cashGiven={cashGiven}
          setCashGiven={setCashGiven}
          discountInput={discountInput}
          setDiscountInput={setDiscountInput}
          applyDiscount={applyDiscount}
          formatCurrency={formatCurrency}
          error={error}
          isProcessing={isProcessing}
          handleProcessOrder={handleProcessOrder}
          setShowCartOnMobile={setShowCartOnMobile}
          fmtNum={fmtNum}
        />
      )}
      {!showCartOnMobile && cart.items.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowCartOnMobile(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-amber-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {cart.items.reduce((acc, curr) => acc + curr.quantity, 0)}
          </span>
        </motion.button>
      )}

      {/* VARIANT MODAL */}
      <AnimatePresence>
        {selectedMenuForVariants && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            >
              <div className="relative p-5 border-b border-border flex justify-between items-start shrink-0">
                <div className="flex gap-4 items-center min-w-0 flex-1 pr-12">
                  <div className="w-16 h-16 rounded-xl bg-muted/10 overflow-hidden shrink-0 shadow-inner">
                    {selectedMenuForVariants.image ? (
                      <img src={selectedMenuForVariants.image} alt={selectedMenuForVariants.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Coffee size={28} className="text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-xl text-foreground leading-tight mb-1 truncate">
                      {selectedMenuForVariants.name}
                    </h3>
                    <p className="text-accent font-semibold text-sm truncate">
                      Mulai dari {formatCurrency(Number(selectedMenuForVariants.price))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMenuForVariants(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground transition-colors absolute top-4 right-4"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                {selectedMenuForVariants.variant_groups?.map(group => (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {group.name}
                      </h4>
                      {group.pivot?.is_required ? (
                        <span className="text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">Wajib</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Opsional</span>
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
                            className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 border ${
                              isSelected
                                ? 'border-accent bg-accent/10 text-primary shadow-sm'
                                : 'border-border bg-card text-muted-foreground hover:border-accent/40'
                            }`}
                          >
                            <span>{opt.name}</span>
                            {Number(opt.additional_price) > 0 && (
                              <span className={`text-xs ${isSelected ? 'text-amber-600 font-black' : 'text-muted-foreground font-semibold'}`}>
                                +{formatCurrency(Number(opt.additional_price))}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Catatan Pesanan</h4>
                  <input
                    value={variantNote}
                    onChange={(e) => setVariantNote(e.target.value)}
                    placeholder="Contoh: less sugar, no ice, extra hot..."
                    className="w-full px-4 py-2.5 rounded-full border border-border bg-card text-foreground text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-border shrink-0">
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
                      note: variantNote,
                      image: selectedMenuForVariants.image,
                      variants: variantIds,
                    });

                    setSelectedMenuForVariants(null);
                    setVariantNote('');
                  }}
                  className="w-full py-3.5 rounded-full bg-accent text-primary font-bold text-sm transition-all active:scale-[0.98] hover:bg-accent/90 flex items-center justify-between px-6"
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

      {/* QRIS MODAL */}
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
              className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-foreground">Pembayaran QRIS</h3>
                <button
                  onClick={() => setShowQrisModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-border">
                  <QrCode size={100} className="text-muted-foreground" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">Total Tagihan</h4>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-6">{formatCurrency(cart.getTotal())}</p>
                <p className="text-sm text-muted-foreground mb-8">
                  Menunggu pelanggan melakukan scan dan pembayaran melalui aplikasi e-wallet atau m-banking...
                </p>

                <button
                  onClick={executeOrder}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex justify-between items-center print:hidden bg-muted/30">
                <h3 className="font-bold text-foreground">Transaksi Sukses!</h3>
                <button
                  onClick={() => setCompletedTransaction(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div id="receipt-area" className="p-6 bg-white text-black font-mono flex-1 overflow-y-auto">
                <div className="text-center mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-0.5 text-black">{storeSettings.store_name}</h2>
                  <p className="text-[11px] text-black">{storeSettings.address}</p>
                  <p className="text-[11px] text-black">Telp: {storeSettings.phone}</p>
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
                </div>
              </div>

              <div className="p-4 border-t border-border flex flex-col sm:flex-row gap-2 print:hidden bg-muted/30">
                <button
                  onClick={() => setCompletedTransaction(null)}
                  className="py-3 px-2 sm:px-4 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted/30 transition-colors flex-1 whitespace-nowrap"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 px-2 sm:px-4 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 flex-1 text-xs whitespace-nowrap"
                >
                  <Printer size={16} /> Struk Kasir
                </button>
                <button
                  onClick={handlePrintKitchen}
                  className="py-3 px-2 sm:px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 sm:gap-2 flex-1 text-xs whitespace-nowrap"
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