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
  Printer,
  History,
  Calendar,
  FileText,
  Percent,
  DollarSign,
  Edit3,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { useProducts } from '@/features/menu/hooks/use-products';
import { useRealtimeOrders } from '@/features/cashier/hooks/use-realtime-orders';
import { useOfflinePOS } from '@/features/cashier/hooks/use-offline-pos';
import { useCustomers, CustomerMember } from '@/features/users/hooks/use-customers';
import { PermissionGuard } from '@/shared/components/common/permission-guard';

const categories = ['Semua', 'Espresso', 'Latte', 'Cold Brew', 'Matcha', 'Pastry', 'Makanan'];

const fallbackProducts = [
  { id: 1, name: 'Velvet Espresso Single Origin', price: 30000, category: 'Espresso', isAvailable: true },
  { id: 2, name: 'Caramel Macchiato Gold', price: 38000, category: 'Latte', isAvailable: true },
  { id: 3, name: 'Iced Hazelnut Latte', price: 42000, category: 'Latte', isAvailable: true },
  { id: 4, name: 'Golden Cappuccino Foam', price: 35000, category: 'Espresso', isAvailable: true },
  { id: 5, name: 'Signature Cold Brew 24H', price: 36000, category: 'Cold Brew', isAvailable: true },
  { id: 6, name: 'Uji Matcha Ceremonial Latte', price: 40000, category: 'Matcha', isAvailable: false },
  { id: 7, name: 'Belgian Chocolate Brownie', price: 45000, category: 'Pastry', isAvailable: true },
  { id: 8, name: 'Butter Artisan Croissant', price: 32000, category: 'Pastry', isAvailable: true },
  { id: 9, name: 'Almond Kouign-Amann', price: 38000, category: 'Pastry', isAvailable: true },
  { id: 10, name: 'Sourdough Avocado Toast', price: 60000, category: 'Makanan', isAvailable: true },
  { id: 11, name: 'Truffle Mushroom Club Sandwich', price: 68000, category: 'Makanan', isAvailable: true },
  { id: 12, name: 'Classic Tiramisu Slice', price: 55000, category: 'Pastry', isAvailable: true },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
  note?: string;
}

interface ShiftOrder {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  customerName: string;
  tableNumber: string;
  paymentMethod: string;
  subtotal: number;
  totalDiscount: number;
  tax: number;
  total: number;
  items: CartItem[];
  status: 'Lunas & Diproses KDS' | 'Selesai' | 'Dibatalkan';
}

interface ReservationCheckIn {
  id: string;
  guestName: string;
  phone: string;
  table: string;
  pax: number;
  time: string;
  area: string;
  status: 'Pending Check-in' | 'Checked-In' | 'Completed' | 'No Show';
}

const QUICK_NOTE_CHIPS = [
  'Less Sugar (Setengah Manis)',
  'No Sugar (Tanpa Gula)',
  'No Ice (Tanpa Es)',
  'Less Ice (Sedikit Es)',
  'Oat Milk (+Rp 10.000)',
  'Extra Espresso Shot (+Rp 12.000)',
  'Extra Hot (Sangat Panas)',
  'Takeaway Cup (Bawa Pulang)',
];

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'card', label: 'Kartu Debit/Kredit', icon: CreditCard },
  { id: 'qris', label: 'QRIS Instant', icon: Smartphone },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function PosPage() {
  const { products: catalogProducts, usingLive } = useProducts();
  const { createLiveOrder } = useRealtimeOrders();
  const { isOnline, queueCount, isSyncing, queueOfflineOrder, syncQueue } = useOfflinePOS();
  const { customers, addPointsFromTransaction } = useCustomers();

  // POS Shift Session State
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
  const [assignedTable, setAssignedTable] = useState('BAR-POS (Walk-in)');

  // 7.2 Item Note Modal State
  const [activeNoteItem, setActiveNoteItem] = useState<CartItem | null>(null);
  const [inputNoteText, setInputNoteText] = useState('');

  // 7.2 Manual Discount State
  const [isManualDiscountModalOpen, setIsManualDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'nominal' | 'percent'>('percent');
  const [discountValueInput, setDiscountValueInput] = useState('');
  const [discountReasonInput, setDiscountReasonInput] = useState('');
  const [appliedManualDiscount, setAppliedManualDiscount] = useState<{ amount: number; reason: string } | null>(null);

  // 7.2 Thermal Receipt Print Modal State
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<ShiftOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 7.3 Shift Transactions History Drawer
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [shiftOrdersHistory, setShiftOrdersHistory] = useState<ShiftOrder[]>([]);

  // 7.3 Today's Reservations Check-in Drawer
  const [isReservationsDrawerOpen, setIsReservationsDrawerOpen] = useState(false);
  const [reservationsList, setReservationsList] = useState<ReservationCheckIn[]>([
    {
      id: 'RES-01',
      guestName: 'Budi Santoso',
      phone: '0812-3456-7890',
      table: 'Meja A2 (Window VIP)',
      pax: 4,
      time: '14:00 WIB',
      area: 'Indoor AC & Garden View',
      status: 'Pending Check-in',
    },
    {
      id: 'RES-02',
      guestName: 'Dr. Nadia Putri',
      phone: '0811-2233-4455',
      table: 'Meja B4 (Sofa Lounge)',
      pax: 2,
      time: '15:30 WIB',
      area: 'Indoor Slow-Bar Barista',
      status: 'Pending Check-in',
    },
    {
      id: 'RES-03',
      guestName: 'Hendra Saputra & Tim',
      phone: '0813-9988-7766',
      table: 'Meja C1 (Communal Table)',
      pax: 8,
      time: '18:00 WIB',
      area: 'Garden Terrace Outdoor',
      status: 'Pending Check-in',
    },
  ]);

  // CRM & Loyalty State
  const [selectedMember, setSelectedMember] = useState<CustomerMember | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');

  // Voucher Promo State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // 8.4 POS - KDS Ready Synchronization State
  const [kdsReadyNotification, setKdsReadyNotification] = useState<{
    orderNumber: string;
    tableNumber: string;
    customerName?: string;
  } | null>(null);

  useEffect(() => {
    const checkKdsReady = () => {
      const savedReady = localStorage.getItem('nemu_kds_latest_ready');
      if (savedReady) {
        try {
          const parsed = JSON.parse(savedReady);
          if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            setKdsReadyNotification(parsed);
          }
        } catch (e) {
          console.warn('KDS sync parse err:', e);
        }
      }
    };

    checkKdsReady();
    window.addEventListener('storage', checkKdsReady);
    const interval = setInterval(checkKdsReady, 3000);

    const savedSession = localStorage.getItem('nemu_pos_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
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

    const savedHistory = localStorage.getItem('nemu_pos_history');
    if (savedHistory) {
      try {
        setShiftOrdersHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.warn('History parse err:', e);
      }
    }

    return () => {
      window.removeEventListener('storage', checkKdsReady);
      clearInterval(interval);
    };
  }, []);

  const saveSessionToStorage = (open: boolean, float: number, sales: number, count: number) => {
    localStorage.setItem(
      'nemu_pos_session',
      JSON.stringify({ status: open ? 'OPEN' : 'CLOSED', float, sales, ordersCount: count, updatedAt: new Date().toISOString() })
    );
  };

  const saveHistoryToStorage = (history: ShiftOrder[]) => {
    setShiftOrdersHistory(history);
    localStorage.setItem('nemu_pos_history', JSON.stringify(history));
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
      const existing = prev.find((i) => i.id === product.id && !i.note);
      if (existing) return prev.map((i) => (i.id === product.id && !i.note ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, category: product.category }];
    });
  };

  const updateQty = (id: number, delta: number, note?: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id && i.note === note ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // Item Note Handler
  const openNoteModal = (item: CartItem) => {
    setActiveNoteItem(item);
    setInputNoteText(item.note || '');
  };

  const saveItemNote = () => {
    if (!activeNoteItem) return;
    setCart((prev) =>
      prev.map((i) =>
        i.id === activeNoteItem.id && i.note === activeNoteItem.note ? { ...i, note: inputNoteText.trim() || undefined } : i
      )
    );
    setActiveNoteItem(null);
    setInputNoteText('');
  };

  // Manual Discount Handler
  const handleApplyManualDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(discountValueInput);
    if (isNaN(val) || val <= 0) return;

    const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const calculatedAmount = discountType === 'percent' ? Math.round(sub * (val / 100)) : val;

    setAppliedManualDiscount({
      amount: Math.min(calculatedAmount, sub),
      reason: discountReasonInput.trim() || (discountType === 'percent' ? `Diskon ${val}%` : `Potongan Rp ${val.toLocaleString()}`),
    });
    setIsManualDiscountModalOpen(false);
  };

  const removeManualDiscount = () => {
    setAppliedManualDiscount(null);
    setDiscountValueInput('');
    setDiscountReasonInput('');
  };

  // Voucher Promo Handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'NEMU10' || code === 'VELVRA10') {
      const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
      setAppliedPromo({ code: code, discountCents: Math.round(sub * 0.1), label: 'Diskon Spesial 10%' });
      setPromoCodeInput('');
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code: 'WELCOME20', discountCents: 20000, label: 'Potongan Langsung Rp 20.000' });
      setPromoCodeInput('');
    } else if (code === 'ROASTERY50') {
      setAppliedPromo({ code: 'ROASTERY50', discountCents: 50000, label: 'Potongan Flagship Roastery' });
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

  const discountFromPoints = pointsToRedeem * 100;
  const discountFromPromo = appliedPromo ? appliedPromo.discountCents : 0;
  const discountFromManual = appliedManualDiscount ? appliedManualDiscount.amount : 0;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalDiscount = discountFromPoints + discountFromPromo + discountFromManual;
  const tax = Math.round(Math.max(0, subtotal - totalDiscount) * 0.11);
  const total = Math.max(0, subtotal - totalDiscount + tax);

  const handleSelectMember = (member: CustomerMember) => {
    setSelectedMember(member);
    setPointsToRedeem(0);
    setIsMemberModalOpen(false);
  };

  // Check-In Reservation Table Handler
  const handleCheckInReservation = (res: ReservationCheckIn) => {
    setReservationsList((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'Checked-In' } : r))
    );
    setAssignedTable(`${res.table} · ${res.guestName}`);
    setIsReservationsDrawerOpen(false);
  };

  // Order & Thermal Print Trigger
  const handleOrder = async () => {
    if (cart.length === 0 || !isSessionOpen) return;
    setOrderDone(true);
    setOfflineNotice(null);

    const customerName = selectedMember
      ? `${selectedMember.name} [${selectedMember.tier}]`
      : assignedTable.includes('·')
      ? assignedTable.split('·')[1].trim()
      : `Walk-in (${payment.toUpperCase()})`;

    if (selectedMember) {
      await addPointsFromTransaction(selectedMember.id, total);
    }

    const newSales = sessionSalesTotal + total;
    const newCount = sessionOrdersCount + 1;
    setSessionSalesTotal(newSales);
    setSessionOrdersCount(newCount);
    saveSessionToStorage(true, sessionCashFloat, newSales, newCount);

    const invoiceNum = `INV-POS-${Date.now().toString().slice(-6)}`;
    const newOrderObj: ShiftOrder = {
      id: `uuid-${Date.now()}`,
      invoiceNumber: invoiceNum,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      customerName,
      tableNumber: assignedTable,
      paymentMethod: payment === 'cash' ? 'Tunai' : payment === 'qris' ? 'QRIS Instant' : 'Kartu Debit/Kredit',
      subtotal,
      totalDiscount,
      tax,
      total,
      items: [...cart],
      status: 'Lunas & Diproses KDS',
    };

    saveHistoryToStorage([newOrderObj, ...shiftOrdersHistory]);
    setActiveReceiptOrder(newOrderObj);

    if (!isOnline) {
      queueOfflineOrder({
        branch_id: 1,
        order_type: 'dine_in',
        payment_method: payment as any,
        table_number: assignedTable,
        total: total,
        customer_name: customerName,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
          name: i.note ? `${i.name} (${i.note})` : i.name,
          price: i.price,
        })),
      });
      setOfflineNotice('Order tersimpan dalam antrean Offline & Struk Thermal Siap Dicetak');
    } else {
      try {
        await createLiveOrder({
          customer_name: customerName,
          order_type: 'dine_in',
          total: total,
          table_number: assignedTable,
        });
      } catch (err) {
        console.warn('POS live order trigger err, fallback offline queue:', err);
        queueOfflineOrder({
          branch_id: 1,
          order_type: 'dine_in',
          payment_method: payment as any,
          table_number: assignedTable,
          total: total,
          customer_name: customerName,
          items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            name: i.note ? `${i.name} (${i.note})` : i.name,
            price: i.price,
          })),
        });
        setOfflineNotice('Order masuk antrean Offline (Koneksi ke server terputus sesaat)');
      }
    }

    setIsReceiptModalOpen(true);

    setTimeout(() => {
      setCart([]);
      setSelectedMember(null);
      setPointsToRedeem(0);
      setAppliedPromo(null);
      setAppliedManualDiscount(null);
      setAssignedTable('BAR-POS (Walk-in)');
      setOrderDone(false);
      setOfflineNotice(null);
    }, 2000);
  };

  const handleVoidOrder = (orderId: string) => {
    const target = shiftOrdersHistory.find((o) => o.id === orderId);
    if (!target || target.status === 'Dibatalkan') return;
    const confirmVoid = window.confirm(`Apakah Anda yakin ingin membatalkan transaksi ${target.invoiceNumber} sebesar ${fmt(target.total)}?`);
    if (confirmVoid) {
      const updated = shiftOrdersHistory.map((o) => (o.id === orderId ? { ...o, status: 'Dibatalkan' as const } : o));
      saveHistoryToStorage(updated);
      setSessionSalesTotal((prev) => Math.max(0, prev - target.total));
      saveSessionToStorage(true, sessionCashFloat, Math.max(0, sessionSalesTotal - target.total), sessionOrdersCount);
    }
  };

  const pendingReservationsCount = reservationsList.filter((r) => r.status === 'Pending Check-in').length;
  const expectedClosingCash = sessionCashFloat + (payment === 'cash' ? sessionSalesTotal : sessionSalesTotal * 0.4);

  return (
    <div className="flex flex-col gap-6 h-full -m-6 lg:-m-8 bg-[#FAF3E7] dark:bg-[#14201A] selection:bg-[#C89B5C]/30 relative">
      {/* 8.4 POS - KDS Ready Synchronization Banner Alert */}
      {kdsReadyNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300 rounded-3xl bg-emerald-700 p-5 text-white shadow-2xl border-2 border-emerald-300 flex items-center gap-4 max-w-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-800 animate-bounce shadow-lg">
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-base font-extrabold text-white flex items-center gap-1.5">
              <span>🚨 PESANAN SIAP DARI DAPUR (8.4)</span>
            </p>
            <p className="text-xs font-bold text-emerald-100 mt-1 truncate">
              {kdsReadyNotification.orderNumber} — Meja: {kdsReadyNotification.tableNumber}
            </p>
            {kdsReadyNotification.customerName && (
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                Tamu: <strong>{kdsReadyNotification.customerName}</strong>
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setKdsReadyNotification(null);
              localStorage.removeItem('nemu_kds_latest_ready');
            }}
            className="rounded-xl bg-emerald-900/60 hover:bg-emerald-900 px-3.5 py-2 text-xs font-extrabold text-emerald-200 shrink-0 transition-colors"
          >
            ✅ Selesai Diambil
          </button>
        </div>
      )}

      {/* Top Shift & Check-In Banner */}
      <div className="bg-[#1E3D31] text-white px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shrink-0 border-b border-[#C89B5C]/25">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isSessionOpen ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <Unlock size={14} className="animate-pulse" /> Shift Kasir Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-xs font-bold text-red-400">
                <Lock size={14} /> Shift Kasir Ditutup
              </span>
            )}
          </div>

          {isSessionOpen && (
            <div className="flex items-center gap-4 text-xs font-mono text-white/90">
              <span>Modal Awal: <strong className="text-[#C89B5C]">{fmt(sessionCashFloat)}</strong></span>
              <span>Total Penjualan Sesi: <strong className="text-emerald-400">{fmt(sessionSalesTotal)}</strong> ({sessionOrdersCount} trx)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 7.3 Reservations Check-In Button */}
          <button
            onClick={() => setIsReservationsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#C89B5C]/40 bg-[#C89B5C]/15 hover:bg-[#C89B5C]/25 px-3.5 py-1.5 text-xs font-bold text-[#C89B5C] transition-all shadow-sm"
          >
            <Calendar size={14} />
            <span>Reservasi Hari Ini ({pendingReservationsCount})</span>
          </button>

          {/* 7.3 Shift History Button */}
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
          >
            <History size={14} />
            <span>Riwayat Shift ({shiftOrdersHistory.length})</span>
          </button>

          {/* Online / Offline Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isOnline ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>

          {queueCount > 0 && (
            <button
              onClick={() => syncQueue()}
              disabled={isSyncing}
              className="flex items-center gap-1 rounded-xl bg-[#C89B5C] px-3 py-1.5 text-xs font-bold text-[#1E3D31] hover:bg-[#b88c4d]"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{queueCount} Antrean</span>
            </button>
          )}

          {/* Shift Toggle */}
          <PermissionGuard permission="pos.session">
            {isSessionOpen ? (
              <button
                onClick={() => {
                  setInputActualCash(expectedClosingCash.toString());
                  setIsCloseModalActive(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <Lock size={14} /> Tutup Shift
              </button>
            ) : (
              <button
                onClick={() => setIsOpenModalActive(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#C89B5C] hover:bg-[#b88c4d] px-4 py-1.5 text-xs font-bold text-[#1E3D31] transition-colors shadow-sm"
              >
                <Unlock size={14} /> Buka Sesi Kasir
              </button>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* Main Split-Screen Content Area */}
      <div className="flex gap-6 flex-1 overflow-hidden px-6 pb-6 lg:px-8 lg:pb-8">
        {/* Left Panel: Product Grid & Search */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#1A2620] p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-sm">
          {offlineNotice && (
            <div className="mb-4 rounded-xl bg-blue-600/10 border border-blue-500/30 px-4 py-2.5 text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 shrink-0" />
                <span>{offlineNotice}</span>
              </div>
              {activeReceiptOrder && (
                <button
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-1 hover:bg-blue-700 font-bold text-xs"
                >
                  <Printer size={13} /> Cetak Struk
                </button>
              )}
            </div>
          )}

          {!isSessionOpen && (
            <div className="mb-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldAlert size={30} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-heading text-lg font-bold">Shift Kasir POS Belum Dibuka</h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Silakan buka sesi kasir dengan memasukkan modal awal (*cash float*) untuk mengaktifkan terminal pemesanan dan pencatatan kas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModalActive(true)}
                className="flex items-center gap-2 rounded-xl bg-[#1E3D31] text-[#C89B5C] px-5 py-2.5 text-xs font-bold hover:bg-[#163026] shrink-0 shadow-md"
              >
                <Unlock size={15} /> Buka Sesi Sekarang
              </button>
            </div>
          )}

          {/* Search Bar & Active Table Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu minuman, pastry, atau kode produk..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/25 py-3 pl-11 pr-4 text-sm focus:border-[#C89B5C] focus:outline-none focus:ring-1 focus:ring-[#C89B5C]"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 bg-[#FAF3E7] dark:bg-[#14201A] border border-[#C89B5C]/30 rounded-2xl px-3.5 py-2">
              <MapPin size={16} className="text-[#C89B5C]" />
              <span className="text-xs font-bold text-[#1E3D31] dark:text-white truncate max-w-[200px]">
                Meja Aktif: <span className="text-[#C89B5C]">{assignedTable}</span>
              </span>
              {assignedTable !== 'BAR-POS (Walk-in)' && (
                <button onClick={() => setAssignedTable('BAR-POS (Walk-in)')} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-2 pr-1">
            {filtered.map((product) => {
              const totalInCart = cart.filter((i) => i.id === product.id).reduce((s, i) => s + i.qty, 0);
              const is86d = product.isAvailable === false;
              const isPastry = product.category.toLowerCase().includes('pastry');
              const isFood = product.category.toLowerCase().includes('makanan');

              return (
                <button
                  key={product.id}
                  disabled={is86d || !isSessionOpen}
                  onClick={() => addToCart(product)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all group ${
                    is86d || !isSessionOpen
                      ? 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/40 opacity-60 cursor-not-allowed'
                      : totalInCart > 0
                      ? 'border-[#C89B5C] bg-[#C89B5C]/15 dark:bg-[#C89B5C]/20 shadow-md scale-[1.01]'
                      : 'border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/5 hover:border-[#C89B5C]/60 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/30 border border-gray-100 dark:border-white/10 shadow-sm mb-2.5 transition-transform group-hover:scale-110">
                    <span className="text-[#C89B5C]">
                      {isPastry ? <Croissant size={26} /> : isFood ? <Utensils size={26} /> : <Coffee size={26} />}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white leading-tight mb-1 line-clamp-2">
                    {product.name}
                  </span>
                  <span className="text-xs font-bold text-[#C89B5C] font-mono">{fmt(product.price)}</span>

                  {is86d ? (
                    <span className="absolute inset-x-2 bottom-2 rounded bg-red-600 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      86&apos;d (Habis)
                    </span>
                  ) : totalInCart > 0 ? (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C89B5C] text-xs font-bold text-[#1E3D31] shadow">
                      {totalInCart}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Cart, Discounts & Checkout */}
        <div className="w-80 xl:w-96 flex flex-col bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl shrink-0 overflow-hidden">
          {/* Cart Header + CRM Member Bar */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#C89B5C]" />
                  <span>Keranjang Kasir</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{assignedTable}</p>
              </div>
              {selectedMember ? (
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={13} /> Lepas Member
                </button>
              ) : null}
            </div>

            {/* CRM Loyalty Bar */}
            {selectedMember ? (
              <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/30 border border-[#C89B5C]/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-[#C89B5C]" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px]">{selectedMember.name}</span>
                  </div>
                  <span className="rounded-full bg-[#C89B5C]/20 text-[#C89B5C] px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                    <Star size={10} className="fill-current" /> {selectedMember.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-white/10 pt-2">
                  <span>Loyalty: <strong className="text-[#C89B5C] font-mono">{selectedMember.points.toLocaleString()} pts</strong></span>
                  {selectedMember.points >= 100 && (
                    <button
                      onClick={() =>
                        setPointsToRedeem(
                          pointsToRedeem === 0 ? Math.min(selectedMember.points, Math.floor(subtotal / 100)) : 0
                        )
                      }
                      className="text-[11px] font-bold text-[#C89B5C] underline"
                    >
                      {pointsToRedeem > 0 ? 'Batal Tukar' : 'Tukar Poin'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C89B5C] bg-[#FAF3E7]/50 dark:bg-white/5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#FAF3E7] dark:hover:bg-white/10 transition-colors"
              >
                <Gift size={15} />
                <span>+ Cari Member Loyalty CRM</span>
              </button>
            )}
          </div>

          {/* Cart Items List with Item Note Capability (7.2) */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 dark:text-gray-600 py-10">
                <Receipt size={44} className="mb-2 opacity-60" />
                <p className="text-xs font-semibold">Keranjang masih kosong<br />Klik produk untuk menambahkan</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.id}-${item.note || 'base'}-${idx}`} className="rounded-2xl bg-gray-50 dark:bg-white/5 p-3 border border-gray-100 dark:border-white/10 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{item.name}</p>
                      <p className="text-xs text-[#C89B5C] font-mono font-bold mt-0.5">{fmt(item.price)}</p>
                      {item.note ? (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Edit3 size={11} className="shrink-0" />
                          <span className="truncate">{item.note}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1, item.note)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        {item.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono text-gray-800 dark:text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1, item.note)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C] hover:bg-[#163026] transition-colors shadow-sm"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Item Note Trigger Button (7.2) */}
                  <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-white/10 pt-1.5">
                    <button
                      onClick={() => openNoteModal(item)}
                      className="text-[11px] font-bold text-[#C89B5C] hover:underline flex items-center gap-1"
                    >
                      <Edit3 size={11} />
                      <span>{item.note ? 'Ubah Catatan Item' : '+ Catatan Item (Less Sugar/No Ice)'}</span>
                    </button>
                    {item.note && (
                      <button
                        onClick={() => updateQty(item.id, 0, undefined)}
                        className="text-[10px] text-gray-400 hover:text-red-500"
                      >
                        Hapus Catatan
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Voucher & Manual Discount Section (7.2) */}
          <div className="px-5 py-2.5 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 space-y-2">
            {/* Promo Code Input */}
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Tag size={13} className="text-emerald-600 shrink-0" />
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
                  placeholder="Kode Voucher (NEMU10)..."
                  className="flex-1 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-1.5 text-xs font-mono uppercase focus:border-[#C89B5C] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#1E3D31] px-3.5 py-1.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026]"
                >
                  Klaim
                </button>
              </form>
            )}

            {/* Manual Discount Bar (7.2) */}
            {appliedManualDiscount ? (
              <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                  <Percent size={13} className="text-amber-600 shrink-0" />
                  <span>{appliedManualDiscount.reason} (-{fmt(appliedManualDiscount.amount)})</span>
                </div>
                <button onClick={removeManualDiscount} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsManualDiscountModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-colors disabled:opacity-50"
              >
                <DollarSign size={13} />
                <span>+ Input Diskon Manual Transaksi (Nominal / %)</span>
              </button>
            )}

            {promoError && <p className="text-[10px] text-red-500 mt-1 font-semibold">{promoError}</p>}
          </div>

          {/* Payment Calculation Summary */}
          <div className="border-t border-gray-100 dark:border-white/10 px-5 py-4 space-y-3 bg-white dark:bg-[#1A2620]">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(subtotal)}</span>
              </div>
              {discountFromPoints > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                  <span>Diskon Poin Loyalty ({pointsToRedeem} pts)</span>
                  <span className="font-mono">-{fmt(discountFromPoints)}</span>
                </div>
              )}
              {discountFromPromo > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Potongan Voucher</span>
                  <span className="font-mono">-{fmt(discountFromPromo)}</span>
                </div>
              )}
              {discountFromManual > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Diskon Manual Transaksi</span>
                  <span className="font-mono">-{fmt(discountFromManual)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>PPN 11%</span>
                <span className="font-mono">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-white/10">
                <span>Total Tagihan</span>
                <span className="text-[#C89B5C] font-heading text-lg font-extrabold">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment Method Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2.5 text-xs font-bold transition-all ${
                    payment === m.id
                      ? 'border-[#C89B5C] bg-[#C89B5C]/15 text-[#C89B5C] shadow-sm'
                      : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <m.icon size={16} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Checkout Trigger */}
            <button
              onClick={handleOrder}
              disabled={cart.length === 0 || !isSessionOpen}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm transition-all ${
                cart.length > 0 && isSessionOpen
                  ? 'bg-[#1E3D31] text-[#C89B5C] hover:bg-[#163026] active:scale-95 shadow-lg'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
              }`}
            >
              {orderDone ? (
                <span className="flex items-center gap-2 text-green-400 font-bold">
                  <Check size={18} />
                  <span>Order Terkirim & Struk Thermal Siap!</span>
                </span>
              ) : !isSessionOpen ? (
                <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                  <Lock size={15} /> Buka Shift untuk Bayar
                </span>
              ) : (
                <>
                  <span>Bayar & Cetak Struk ({fmt(total)})</span>
                  <ChevronRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 7.2 Item Note Modal */}
      {activeNoteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={19} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Catatan Pesanan per Item</h3>
              </div>
              <button onClick={() => setActiveNoteItem(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Menu terpilih:</p>
              <p className="text-sm font-bold text-[#C89B5C] bg-[#FAF3E7] dark:bg-black/30 p-3 rounded-2xl border border-[#C89B5C]/30">
                {activeNoteItem.name} ({activeNoteItem.qty}x)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Pilih Pilihan Cepat Catatan (Chips):
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_NOTE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setInputNoteText((prev) => (prev ? `${prev}, ${chip}` : chip));
                    }}
                    className="rounded-xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#C89B5C] hover:bg-[#C89B5C]/15 hover:text-[#C89B5C] transition-all"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Ketik Catatan Khusus (Custom Note)
              </label>
              <input
                type="text"
                value={inputNoteText}
                onChange={(e) => setInputNoteText(e.target.value)}
                placeholder="Misal: Less sugar 50%, extra oat milk, tidak pakai sedotan panas..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 px-4 py-3 text-sm focus:border-[#C89B5C] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="rounded-xl border border-gray-200 dark:border-white/15 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveItemNote}
                className="rounded-xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
              >
                Simpan Catatan Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7.2 Manual Discount Modal */}
      {isManualDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-amber-600" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Input Diskon Manual Transaksi</h3>
              </div>
              <button onClick={() => setIsManualDiscountModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyManualDiscount} className="space-y-4">
              <div className="flex rounded-2xl bg-gray-100 dark:bg-black/40 p-1.5 border border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    discountType === 'percent' ? 'bg-[#1E3D31] text-[#C89B5C] shadow' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Percent size={14} /> Persentase (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('nominal')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    discountType === 'nominal' ? 'bg-[#1E3D31] text-[#C89B5C] shadow' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <DollarSign size={14} /> Nominal Langsung (Rp)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  {discountType === 'percent' ? 'Persentase Diskon (%)' : 'Nominal Potongan (Rp)'}
                </label>
                <input
                  type="number"
                  required
                  value={discountValueInput}
                  onChange={(e) => setDiscountValueInput(e.target.value)}
                  placeholder={discountType === 'percent' ? 'Contoh: 15 (untuk 15%)' : 'Contoh: 25000'}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Alasan / Keterangan Diskon (Audit)
                </label>
                <input
                  type="text"
                  required
                  value={discountReasonInput}
                  onChange={(e) => setDiscountReasonInput(e.target.value)}
                  placeholder="Misal: Diskon Karyawan Roastery, Komplain Tamu, Promo Rekanan..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsManualDiscountModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/15 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
                >
                  Terapkan Diskon Manual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7.2 Thermal Receipt Print Modal */}
      {isReceiptModalOpen && activeReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Printer size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Struk Thermal Kasir (POS-003)</h3>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Thermal Printable Area */}
            <div id="receipt-printable-area" className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 font-mono text-xs space-y-3 text-gray-800 dark:text-gray-200 shadow-inner">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300 dark:border-white/20">
                <h4 className="font-extrabold text-base uppercase tracking-wider text-gray-900 dark:text-white">NEMU Space Specialty Roastery</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan</p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">Telp: (021) 555-0199 · NPWP: 01.234.567.8-012.000</p>
              </div>

              <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-gray-300 dark:border-white/20">
                <div className="flex justify-between"><span>No. Invoice:</span> <strong>{activeReceiptOrder.invoiceNumber}</strong></div>
                <div className="flex justify-between"><span>Waktu:</span> <span>{activeReceiptOrder.timestamp}</span></div>
                <div className="flex justify-between"><span>Meja/Area:</span> <strong>{activeReceiptOrder.tableNumber}</strong></div>
                <div className="flex justify-between"><span>Nama Tamu:</span> <span>{activeReceiptOrder.customerName}</span></div>
                <div className="flex justify-between"><span>Metode Bayar:</span> <span>{activeReceiptOrder.paymentMethod}</span></div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pb-3 border-b border-dashed border-gray-300 dark:border-white/20">
                {activeReceiptOrder.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>{it.qty}x {it.name}</span>
                      <span>{fmt(it.price * it.qty)}</span>
                    </div>
                    {it.note && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 pl-3 font-sans">
                        * Catatan: {it.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-gray-300 dark:border-white/20">
                <div className="flex justify-between"><span>Subtotal:</span> <span>{fmt(activeReceiptOrder.subtotal)}</span></div>
                {activeReceiptOrder.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-700 dark:text-green-400 font-bold">
                    <span>Total Diskon/Voucher:</span>
                    <span>-{fmt(activeReceiptOrder.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>PPN 11%:</span> <span>{fmt(activeReceiptOrder.tax)}</span></div>
                <div className="flex justify-between font-extrabold text-sm pt-1.5 text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/10">
                  <span>TOTAL BAYAR:</span>
                  <span>{fmt(activeReceiptOrder.total)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] space-y-1 text-gray-500 dark:text-gray-400 pt-2">
                <p>--- TERIMA KASIH ATAS KUNJUNGAN ANDA ---</p>
                <p>Password Wi-Fi: <strong className="text-gray-800 dark:text-white">NemuSpecialty2026</strong></p>
                <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 shrink-0">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-white/15 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100"
              >
                Tutup / Selesai
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#1E3D31] text-[#C89B5C] py-3 text-xs font-bold hover:bg-[#163026] shadow-lg"
              >
                <Printer size={16} /> Cetak Struk 80mm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7.3 Shift Transactions History Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A2620] h-full shadow-2xl p-6 flex flex-col border-l border-gray-200 dark:border-white/15 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <History size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi Shift Berjalan (7.3)</h3>
              </div>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {shiftOrdersHistory.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-xs">Belum ada transaksi pada shift hari ini.</div>
              ) : (
                shiftOrdersHistory.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-gray-50/70 dark:bg-black/25 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#C89B5C]">{o.invoiceNumber}</span>
                        <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{o.customerName} · {o.tableNumber}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        o.status === 'Dibatalkan' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200/60 dark:border-white/10 pt-2">
                      <span>{o.timestamp} · {o.paymentMethod}</span>
                      <span className="font-serif font-bold text-sm text-gray-900 dark:text-white">{fmt(o.total)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setActiveReceiptOrder(o);
                          setIsReceiptModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#C89B5C]/50 bg-white dark:bg-black/40 py-1.5 text-xs font-bold text-[#C89B5C] hover:bg-[#C89B5C]/15 transition-all"
                      >
                        <Printer size={13} /> Cetak Ulang Struk
                      </button>
                      {o.status !== 'Dibatalkan' && (
                        <button
                          onClick={() => handleVoidOrder(o.id)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-600 transition-all"
                        >
                          Batalkan / Void
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7.3 Today's Reservations Check-In Drawer */}
      {isReservationsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A2620] h-full shadow-2xl p-6 flex flex-col border-l border-gray-200 dark:border-white/15 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-[#C89B5C]" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Daftar Reservasi Hari Ini (7.3)</h3>
                  <p className="text-xs text-gray-400">Siap dicheck-in & alokasi meja langsung dari POS</p>
                </div>
              </div>
              <button onClick={() => setIsReservationsDrawerOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {reservationsList.map((res) => (
                <div key={res.id} className="rounded-2xl border-2 border-gray-200 dark:border-white/10 p-4 bg-gray-50/80 dark:bg-black/30 space-y-3 transition-all hover:border-[#C89B5C]/60">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-[#C89B5C]/20 text-[#C89B5C] px-2.5 py-0.5 text-[10px] font-bold">
                        {res.time} · {res.pax} Tamu
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-1">{res.guestName}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{res.phone}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      res.status === 'Checked-In'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    }`}>
                      {res.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 p-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                    <MapPin size={15} className="text-[#C89B5C] shrink-0" />
                    <span><strong>{res.table}</strong> ({res.area})</span>
                  </div>

                  {res.status === 'Pending Check-in' && (
                    <button
                      onClick={() => handleCheckInReservation(res)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E3D31] text-[#C89B5C] hover:bg-[#163026] py-2.5 text-xs font-bold transition-all shadow-md"
                    >
                      <CheckCircle2 size={15} /> Check-in Tamu & Buka Tab POS Meja Ini
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Buka Sesi POS */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Unlock size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">Buka Sesi Kasir POS (Shift)</h3>
              </div>
              <button onClick={() => setIsOpenModalActive(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOpenShiftSession} className="space-y-4">
              <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/40 p-3.5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <p className="font-bold text-gray-900 dark:text-white">Modal Awal Laci Uang (Cash Float)</p>
                <p>Masukkan jumlah uang fisik tunai yang tersedia di laci saat memulai shift operasional cabang.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Modal Tunai Awal (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={inputFloatCash}
                  onChange={(e) => setInputFloatCash(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpenModalActive(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/15 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
                >
                  Buka Shift & Mulai Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tutup Sesi POS */}
      {isCloseModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-red-600" />
                <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">Tutup Shift & Rekonsiliasi Kas</h3>
              </div>
              <button onClick={() => setIsCloseModalActive(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSession} className="space-y-4 text-xs">
              <div className="rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-gray-700 dark:text-gray-300">
                  <span>Modal Awal (Float):</span>
                  <span className="font-mono">{fmt(sessionCashFloat)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Total Penjualan Sesi:</span>
                  <span className="font-mono">{fmt(sessionSalesTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
                  <span>Estimasi Uang Tunai Seharusnya:</span>
                  <span className="font-mono text-[#C89B5C] text-sm">{fmt(expectedClosingCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Uang Tunai Aktual di Laci (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={inputActualCash}
                  onChange={(e) => setInputActualCash(e.target.value)}
                  placeholder="Hitung dan masukkan uang fisik..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                />
                {inputActualCash !== '' && (
                  <div className={`mt-2 p-2.5 rounded-xl font-bold flex justify-between ${
                    Number(inputActualCash) - expectedClosingCash === 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : Number(inputActualCash) - expectedClosingCash > 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    <span>Selisih Rekonsiliasi:</span>
                    <span className="font-mono">
                      {Number(inputActualCash) - expectedClosingCash >= 0 ? '+' : ''}
                      {fmt(Number(inputActualCash) - expectedClosingCash)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Catatan Penutupan</label>
                <textarea
                  rows={2}
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  placeholder="Alasan selisih atau nama pengawas shift..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-2 text-xs focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCloseModalActive(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/15 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md"
                >
                  Konfirmasi Tutup Shift POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM Member Lookup Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-100 dark:border-white/15 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-800 dark:text-white">Cari Member Loyalty CRM</h3>
              </div>
              <button onClick={() => setIsMemberModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Cari nama atau no. telepon member..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/35 py-3 pl-11 pr-4 text-sm focus:border-[#C89B5C] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {customers
                .filter((c) => c.name.toLowerCase().includes(memberQuery.toLowerCase()) || c.phone.includes(memberQuery))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectMember(c)}
                    className="w-full flex items-center justify-between rounded-2xl border border-gray-100 dark:border-white/10 p-3.5 hover:border-[#C89B5C] hover:bg-[#FAF3E7] dark:hover:bg-white/5 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-[11px] text-gray-500">{c.phone} · <strong className="text-[#C89B5C] font-mono">{c.points.toLocaleString()} pts</strong></p>
                    </div>
                    <span className="rounded-full bg-[#C89B5C]/20 px-2.5 py-1 text-[10px] font-bold text-[#C89B5C]">
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
