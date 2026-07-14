'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  Coffee,
  ShoppingBag,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  UserCheck,
  Star,
  Gift,
  X,
  Lock,
  Unlock,
  Tag,
  AlertCircle,
  Croissant,
  Utensils,
  ShieldAlert,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useOfflinePOS } from '@/hooks/useOfflinePOS';
import { useCustomers, CustomerMember } from '@/hooks/useCustomers';
import { PermissionGuard } from '@/components/permission-guard';

const categories = ['Semua', 'Espresso', 'Latte', 'Cold Brew', 'Matcha', 'Pastry', 'Makanan'];

const fallbackProducts = [
  { id: 1, name: 'Velvet Espresso', price: 30000, category: 'Espresso', isAvailable: true },
  { id: 2, name: 'Caramel Latte', price: 38000, category: 'Latte', isAvailable: true },
  { id: 3, name: 'Iced Macchiato', price: 42000, category: 'Latte', isAvailable: true },
  { id: 4, name: 'Golden Cappuccino', price: 35000, category: 'Espresso', isAvailable: true },
  { id: 5, name: 'Signature Cold Brew', price: 36000, category: 'Cold Brew', isAvailable: true },
  { id: 6, name: 'Uji Matcha Latte', price: 40000, category: 'Matcha', isAvailable: false }, // example 86'd item
  { id: 7, name: 'Chocolate Brownie', price: 45000, category: 'Pastry', isAvailable: true },
  { id: 8, name: 'Butter Croissant', price: 32000, category: 'Pastry', isAvailable: true },
  { id: 9, name: 'Almond Pastry', price: 35000, category: 'Pastry', isAvailable: true },
  { id: 10, name: 'Avocado Toast', price: 60000, category: 'Makanan', isAvailable: true },
  { id: 11, name: 'Club Sandwich', price: 65000, category: 'Makanan', isAvailable: true },
  { id: 12, name: 'Tiramisu Slice', price: 55000, category: 'Pastry', isAvailable: true },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'card', label: 'Kartu', icon: CreditCard },
  { id: 'qris', label: 'QRIS', icon: Smartphone },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function PosPage() {
  const { products: catalogProducts, usingLive } = useProducts();
  const { createLiveOrder } = useRealtimeOrders();
  const { isOnline, queueCount, isSyncing, queueOfflineOrder, syncQueue } = useOfflinePOS();
  const { customers, addPointsFromTransaction } = useCustomers();

  // POS Session State (POS-001 Shift Cash Float & Reconciliation)
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [sessionCashFloat, setSessionCashFloat] = useState(500000);
  const [sessionSalesTotal, setSessionSalesTotal] = useState(0);
  const [sessionOrdersCount, setSessionOrdersCount] = useState(0);
  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [isCloseModalActive, setIsCloseModalActive] = useState(false);
  const [inputFloatCash, setInputFloatCash] = useState('500000');
  const [inputActualCash, setInputActualCash] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');

  // Cart & Catalog State
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState('cash');
  const [orderDone, setOrderDone] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Loyalty & CRM state (POS-004)
  const [selectedMember, setSelectedMember] = useState<CustomerMember | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');

  // Promo Code State (PRO-004 Voucher Verification)
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number; label: string } | null>(
    null
  );
  const [promoError, setPromoError] = useState<string | null>(null);

  // Load session state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('velvra_pos_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'OPEN') {
          setIsSessionOpen(true);
          setSessionCashFloat(parsed.float || 500000);
          setSessionSalesTotal(parsed.sales || 0);
          setSessionOrdersCount(parsed.ordersCount || 0);
        }
      } catch (e) {
        console.warn('Session parse err:', e);
      }
    }
  }, []);

  const saveSessionToStorage = (open: boolean, float: number, sales: number, count: number) => {
    localStorage.setItem(
      'velvra_pos_session',
      JSON.stringify({ status: open ? 'OPEN' : 'CLOSED', float, sales, ordersCount: count, updatedAt: new Date().toISOString() })
    );
  };

  const handleOpenShiftSession = (e: React.FormEvent) => {
    e.preventDefault();
    const floatVal = Number(inputFloatCash) || 0;
    setIsSessionOpen(true);
    setSessionCashFloat(floatVal);
    setSessionSalesTotal(0);
    setSessionOrdersCount(0);
    saveSessionToStorage(true, floatVal, 0, 0);
    setIsOpenModalActive(false);
  };

  const handleCloseShiftSession = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSessionOpen(false);
    saveSessionToStorage(false, 0, 0, 0);
    setIsCloseModalActive(false);
    setInputActualCash('');
    setReconcileNotes('');
    setCart([]);
  };

  // Map products ensuring Branch Price Override (MNU-003) & 86'd Status (MNU-004) compliance
  const displayProducts =
    usingLive && catalogProducts && catalogProducts.length > 0
      ? catalogProducts.map((p, idx) => ({
          id: typeof p.id === 'number' ? p.id : idx + 100,
          name: p.name,
          price: (p as any).price_override ?? p.price,
          category: p.category || 'Espresso',
          isAvailable: (p as any).is_available !== false,
        }))
      : fallbackProducts;

  const filtered = displayProducts.filter((p) => {
    const matchCat =
      activeCategory === 'Semua' ||
      p.category === activeCategory ||
      (activeCategory === 'Espresso' && p.category.toLowerCase().includes('coffee'));
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: { id: number; name: string; price: number; category: string; isAvailable?: boolean }) => {
    if (product.isAvailable === false || !isSessionOpen) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, category: product.category }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // Promo Code Validation Rule (PRO-004)
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'VELVRA10') {
      const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
      setAppliedPromo({ code: 'VELVRA10', discountCents: Math.round(sub * 0.1), label: 'Diskon Spesial 10%' });
      setPromoCodeInput('');
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code: 'WELCOME20', discountCents: 20000, label: 'Potongan Langsung Rp 20.000' });
      setPromoCodeInput('');
    } else if (code === 'WEEKEND50') {
      setAppliedPromo({ code: 'WEEKEND50', discountCents: 50000, label: 'Diskon Akhir Pekan Rp 50.000' });
      setPromoCodeInput('');
    } else {
      setPromoError('Kode voucher tidak valid atau sudah kedaluwarsa.');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
  };

  const discountFromPoints = pointsToRedeem * 100; // Rp 100 per loyalty point
  const discountFromPromo = appliedPromo ? appliedPromo.discountCents : 0;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalDiscount = discountFromPoints + discountFromPromo;
  const tax = Math.round(Math.max(0, subtotal - totalDiscount) * 0.11);
  const total = Math.max(0, subtotal - totalDiscount + tax);

  const handleSelectMember = (member: CustomerMember) => {
    setSelectedMember(member);
    setPointsToRedeem(0);
    setIsMemberModalOpen(false);
  };

  const handleOrder = async () => {
    if (cart.length === 0 || !isSessionOpen) return;
    setOrderDone(true);
    setOfflineNotice(null);

    const customerName = selectedMember
      ? `${selectedMember.name} [${selectedMember.tier}]`
      : `Kasir Walk-in (${payment.toUpperCase()})`;

    if (selectedMember) {
      await addPointsFromTransaction(selectedMember.id, total);
    }

    // Update POS session statistics (POS-001)
    const newSales = sessionSalesTotal + total;
    const newCount = sessionOrdersCount + 1;
    setSessionSalesTotal(newSales);
    setSessionOrdersCount(newCount);
    saveSessionToStorage(true, sessionCashFloat, newSales, newCount);

    if (!isOnline) {
      queueOfflineOrder({
        branch_id: 1,
        order_type: 'takeaway',
        payment_method: payment as any,
        table_number: 'BAR-POS',
        total: total,
        customer_name: customerName,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
          name: i.name,
          price: i.price,
        })),
      });
      setOfflineNotice('Order tersimpan dalam antrean Offline (Idempotency UUID Dijamin & Poin Dicatat)');
    } else {
      try {
        await createLiveOrder({
          customer_name: customerName,
          order_type: 'takeaway',
          total: total,
          table_number: 'BAR-POS',
        });
      } catch (err) {
        console.warn('POS live order trigger err, fallback offline queue:', err);
        queueOfflineOrder({
          branch_id: 1,
          order_type: 'takeaway',
          payment_method: payment as any,
          table_number: 'BAR-POS',
          total: total,
          customer_name: customerName,
          items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            name: i.name,
            price: i.price,
          })),
        });
        setOfflineNotice('Order masuk antrean Offline karena gangguan koneksi ke server');
      }
    }

    setTimeout(() => {
      setCart([]);
      setSelectedMember(null);
      setPointsToRedeem(0);
      setAppliedPromo(null);
      setOrderDone(false);
      setOfflineNotice(null);
    }, 2500);
  };

  const expectedClosingCash = sessionCashFloat + (payment === 'cash' ? sessionSalesTotal : sessionSalesTotal * 0.4); // approx cash proportion

  return (
    <div className="flex flex-col gap-6 h-full -m-6 lg:-m-8">
      {/* Top Shift & Connectivity Banner (POS-001 & ADM-002) */}
      <div className="bg-[#12100E] text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isSessionOpen ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                <Unlock size={13} className="animate-pulse" /> Sesi POS Aktif (Shift Buka)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-bold text-red-400">
                <Lock size={13} /> Sesi POS Ditutup
              </span>
            )}
          </div>

          {isSessionOpen && (
            <div className="flex items-center gap-4 text-xs font-mono text-white/80">
              <span>Modal Awal: <strong className="text-[#BA935D]">{fmt(sessionCashFloat)}</strong></span>
              <span>Total Penjualan Sesi: <strong className="text-emerald-400">{fmt(sessionSalesTotal)}</strong> ({sessionOrdersCount} transaksi)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Online / Offline Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isOnline ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>

          {queueCount > 0 && (
            <button
              onClick={() => syncQueue()}
              disabled={isSyncing}
              className="flex items-center gap-1 rounded-lg bg-[#BA935D] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#a07d4e]"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{queueCount} Antrean</span>
            </button>
          )}

          {/* Shift Session Toggle Buttons */}
          <PermissionGuard permission="pos.session">
            {isSessionOpen ? (
              <button
                onClick={() => {
                  setInputActualCash(expectedClosingCash.toString());
                  setIsCloseModalActive(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <Lock size={14} /> Tutup Shift & Rekonsiliasi
              </button>
            ) : (
              <button
                onClick={() => setIsOpenModalActive(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#BA935D] hover:bg-[#a07d4e] px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <Unlock size={14} /> Buka Sesi Kasir Baru
              </button>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1 overflow-hidden px-6 pb-6 lg:px-8 lg:pb-8">
        {/* Left Panel: Product Grid */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[#F5F3F0] p-6 rounded-3xl border border-gray-200/60 shadow-inner">
          {offlineNotice && (
            <div className="mb-4 rounded-xl bg-blue-600/10 border border-blue-500/30 px-4 py-2.5 text-xs font-bold text-blue-800 flex items-center gap-2">
              <Check size={16} className="text-blue-600 shrink-0" />
              <span>{offlineNotice}</span>
            </div>
          )}

          {!isSessionOpen && (
            <div className="mb-5 rounded-2xl bg-amber-50 border-2 border-amber-300 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldAlert size={28} className="text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Sesi Kasir Belum Dibuka (Shift Closed)</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Silakan buka sesi kasir dengan memasukkan modal awal (*cash float*) untuk mengaktifkan tombol pesanan dan rekonsiliasi laci uang.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModalActive(true)}
                className="flex items-center gap-2 rounded-xl bg-[#12100E] text-[#BA935D] px-5 py-2.5 text-xs font-bold hover:bg-[#1e1a17] shrink-0"
              >
                <Unlock size={15} /> Buka Sesi Sekarang
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu atau kode produk..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#12100E] text-[#BA935D] shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-2 pr-1">
            {filtered.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              const is86d = product.isAvailable === false;
              const isPastry = product.category.toLowerCase().includes('pastry');
              const isFood = product.category.toLowerCase().includes('makanan');

              return (
                <button
                  key={product.id}
                  disabled={is86d || !isSessionOpen}
                  onClick={() => addToCart(product)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all ${
                    is86d || !isSessionOpen
                      ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      : inCart
                      ? 'border-[#BA935D] bg-[#BA935D]/10 hover:-translate-y-0.5 hover:shadow-md'
                      : 'border-gray-100 bg-white hover:border-[#BA935D]/50 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                  }`}
                >
                  <span className="text-3xl mb-2 text-[#BA935D]">
                    {isPastry ? <Croissant size={28} /> : isFood ? <Utensils size={28} /> : <Coffee size={28} />}
                  </span>
                  <span className="text-sm font-bold text-gray-800 leading-tight mb-1">{product.name}</span>
                  <span className="text-sm font-bold text-[#BA935D] font-mono">{fmt(product.price)}</span>

                  {is86d ? (
                    <span className="absolute inset-x-2 bottom-2 rounded bg-red-600 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      86&apos;d (Habis)
                    </span>
                  ) : inCart ? (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#BA935D] text-xs font-bold text-white shadow">
                      {inCart.qty}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Cart + Checkout */}
        <div className="w-80 xl:w-96 flex flex-col bg-white rounded-3xl border border-gray-200 shadow-xl shrink-0 overflow-hidden">
          {/* Cart Header + CRM Member Bar */}
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-800">Keranjang Kasir</h2>
                <p className="text-xs text-gray-400 mt-0.5">{cart.length} item · Meja Walk-in / Bar</p>
              </div>
              {selectedMember ? (
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={13} /> Lepas
                </button>
              ) : null}
            </div>

            {/* CRM Loyalty Box (POS-004) */}
            {selectedMember ? (
              <div className="rounded-xl bg-[#FAF6F0] border border-[#BA935D]/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-[#BA935D]" />
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[130px]">{selectedMember.name}</span>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
                    <Star size={10} className="fill-current" /> {selectedMember.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-200/60 pt-2">
                  <span>Poin: <strong className="text-[#BA935D] font-mono">{selectedMember.points.toLocaleString()} pts</strong></span>
                  {selectedMember.points >= 100 && (
                    <button
                      onClick={() =>
                        setPointsToRedeem(
                          pointsToRedeem === 0 ? Math.min(selectedMember.points, Math.floor(subtotal / 100)) : 0
                        )
                      }
                      className="text-[11px] font-bold text-[#BA935D] underline"
                    >
                      {pointsToRedeem > 0 ? 'Batal Tukar' : 'Tukar Poin'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#BA935D] bg-[#FAF6F0]/60 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#FAF6F0] transition-colors"
              >
                <Gift size={14} />
                <span>+ Cari Member CRM Loyalty (POS-004)</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 py-10">
                <ShoppingBag size={44} className="mb-2 text-gray-300" />
                <p className="text-xs font-semibold">Keranjang kosong<br />Pilih menu aktif di sebelah kiri</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5 border border-gray-100">
                  <div className="p-2 rounded-xl bg-amber-50 text-[#BA935D]">
                    <Coffee size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-[#BA935D] font-mono font-semibold">{fmt(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      {item.qty === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                    </button>
                    <span className="w-5 text-center text-xs font-bold font-mono text-gray-800">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#BA935D] text-white hover:bg-[#a07d4e] transition-colors"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Voucher Promo Block (PRO-004) */}
          <div className="px-5 py-2 border-t border-gray-100 bg-gray-50/50">
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Tag size={13} className="text-emerald-600" />
                  <span>{appliedPromo.code} ({appliedPromo.label})</span>
                </div>
                <button onClick={removePromo} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Kode Voucher (VELVRA10)..."
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-mono uppercase focus:border-[#BA935D] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#12100E] px-3.5 py-1.5 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17]"
                >
                  Klaim
                </button>
              </form>
            )}
            {promoError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{promoError}</p>}
          </div>

          {/* Payment Summary + Checkout */}
          <div className="border-t border-gray-100 px-5 py-4 space-y-3.5 bg-white">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(subtotal)}</span>
              </div>
              {discountFromPoints > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Diskon Poin ({pointsToRedeem} pts)</span>
                  <span className="font-mono">-{fmt(discountFromPoints)}</span>
                </div>
              )}
              {discountFromPromo > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Potongan Voucher Promo</span>
                  <span className="font-mono">-{fmt(discountFromPromo)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>PPN 11%</span>
                <span className="font-mono">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total Tagihan</span>
                <span className="text-[#BA935D] font-serif font-bold">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 py-2 text-xs font-bold transition-all ${
                    payment === m.id
                      ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <m.icon size={15} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleOrder}
              disabled={cart.length === 0 || !isSessionOpen}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all ${
                cart.length > 0 && isSessionOpen
                  ? 'bg-[#12100E] text-[#BA935D] hover:bg-[#1e1a17] active:scale-95 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {orderDone ? (
                <span className="flex items-center gap-2 text-green-400 font-bold">
                  <Check size={18} />
                  <span>Order Terkirim ke KDS Dapur!</span>
                </span>
              ) : !isSessionOpen ? (
                <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                  <Lock size={14} /> Buka Sesi untuk Bayar
                </span>
              ) : (
                <>
                  <span>Proses Pembayaran</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Buka Sesi POS (POS-001 Open Cash Float) */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Unlock size={20} className="text-[#BA935D]" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Buka Sesi Kasir POS (POS-001)</h3>
              </div>
              <button onClick={() => setIsOpenModalActive(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOpenShiftSession} className="space-y-4">
              <div className="rounded-xl bg-[#FAF6F0] p-3.5 text-xs text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">Modal Awal Laci Uang (Cash Float)</p>
                <p className="text-gray-600">
                  Masukkan jumlah uang fisik tunai yang tersedia di laci saat memulai shift operasional cabang.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Modal Tunai Awal (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={inputFloatCash}
                  onChange={(e) => setInputFloatCash(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-mono font-bold focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpenModalActive(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17]"
                >
                  Buka Shift & Mulai Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tutup Sesi POS & Rekonsiliasi (POS-001 Close Shift) */}
      {isCloseModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-red-600" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Tutup Shift & Rekonsiliasi Kas</h3>
              </div>
              <button onClick={() => setIsCloseModalActive(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSession} className="space-y-4 text-xs">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Modal Awal (Float):</span>
                  <span className="font-mono">{fmt(sessionCashFloat)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Total Penjualan Sesi:</span>
                  <span className="font-mono">{fmt(sessionSalesTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Estimasi Uang Fisik Seharusnya:</span>
                  <span className="font-mono text-[#BA935D] text-sm">{fmt(expectedClosingCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Uang Tunai Aktual di Laci (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={inputActualCash}
                  onChange={(e) => setInputActualCash(e.target.value)}
                  placeholder="Hitung dan masukkan uang fisik..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-mono font-bold focus:border-[#BA935D] focus:outline-none"
                />
                {inputActualCash !== '' && (
                  <div className={`mt-1.5 p-2 rounded-lg font-bold flex justify-between ${
                    Number(inputActualCash) - expectedClosingCash === 0
                      ? 'bg-green-50 text-green-700'
                      : Number(inputActualCash) - expectedClosingCash > 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <span>Selisih Rekonsiliasi (Varians):</span>
                    <span className="font-mono">
                      {Number(inputActualCash) - expectedClosingCash >= 0 ? '+' : ''}
                      {fmt(Number(inputActualCash) - expectedClosingCash)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Catatan Penutupan</label>
                <textarea
                  rows={2}
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  placeholder="Alasan selisih atau nama pengawas shift..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalActive(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Konfirmasi Tutup Shift POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM Member Lookup Modal (POS-004) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-[#BA935D]" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Pilih Member CRM / Loyalty (POS-004)</h3>
              </div>
              <button onClick={() => setIsMemberModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Cari nama atau no. telepon member..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-xs focus:border-[#BA935D] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {customers
                .filter((c) => c.name.toLowerCase().includes(memberQuery.toLowerCase()) || c.phone.includes(memberQuery))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectMember(c)}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:border-[#BA935D] hover:bg-[#FAF6F0] transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{c.name}</p>
                      <p className="text-[11px] text-gray-500">{c.phone} · <strong className="text-[#BA935D] font-mono">{c.points.toLocaleString()} pts</strong></p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {c.tier}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
