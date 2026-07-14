'use client';

import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ChevronRight, CreditCard, Banknote, Smartphone, Coffee, ShoppingBag, Check, Wifi, WifiOff, RefreshCw, Database, UserCheck, Star, Gift, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useOfflinePOS } from '@/hooks/useOfflinePOS';
import { useCustomers, CustomerMember } from '@/hooks/useCustomers';

const categories = ['Semua', 'Espresso', 'Latte', 'Cold Brew', 'Matcha', 'Pastry', 'Makanan'];

const products = [
  { id: 1, name: 'Velvet Espresso', price: 30000, category: 'Espresso', emoji: 'COFFEE' },
  { id: 2, name: 'Caramel Latte', price: 38000, category: 'Latte', emoji: 'COFFEE' },
  { id: 3, name: 'Iced Macchiato', price: 42000, category: 'Latte', emoji: 'COFFEE' },
  { id: 4, name: 'Golden Cappuccino', price: 35000, category: 'Espresso', emoji: 'COFFEE' },
  { id: 5, name: 'Signature Cold Brew', price: 36000, category: 'Cold Brew', emoji: 'COFFEE' },
  { id: 6, name: 'Uji Matcha Latte', price: 40000, category: 'Matcha', emoji: 'COFFEE' },
  { id: 7, name: 'Chocolate Brownie', price: 45000, category: 'Pastry', emoji: 'PASTRY' },
  { id: 8, name: 'Butter Croissant', price: 32000, category: 'Pastry', emoji: 'PASTRY' },
  { id: 9, name: 'Almond Pastry', price: 35000, category: 'Pastry', emoji: 'PASTRY' },
  { id: 10, name: 'Avocado Toast', price: 60000, category: 'Makanan', emoji: 'FOOD' },
  { id: 11, name: 'Club Sandwich', price: 65000, category: 'Makanan', emoji: 'FOOD' },
  { id: 12, name: 'Tiramisu Slice', price: 55000, category: 'Pastry', emoji: 'PASTRY' },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: Banknote },
  { id: 'card', label: 'Kartu', icon: CreditCard },
  { id: 'qris', label: 'QRIS', icon: Smartphone },
];

export default function PosPage() {
  const { products: catalogProducts, usingLive } = useProducts();
  const { createLiveOrder } = useRealtimeOrders();
  const { isOnline, queueCount, isSyncing, queueOfflineOrder, syncQueue } = useOfflinePOS();
  const { customers, addPointsFromTransaction } = useCustomers();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState('cash');
  const [orderDone, setOrderDone] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Loyalty & CRM state
  const [selectedMember, setSelectedMember] = useState<CustomerMember | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');

  // Use dynamic products from Supabase when connected, fallback to default POS items
  const displayProducts = (usingLive && catalogProducts && catalogProducts.length > 0)
    ? catalogProducts.map((p, idx) => ({
        id: typeof p.id === 'number' ? p.id : idx + 100,
        name: p.name,
        price: p.price,
        category: p.category || 'Espresso',
        emoji: p.category?.toLowerCase().includes('pastry') ? 'PASTRY' : p.category?.toLowerCase().includes('makanan') ? 'FOOD' : 'COFFEE',
      }))
    : products;

  const filtered = displayProducts.filter((p) => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory || (activeCategory === 'Espresso' && p.category.toLowerCase().includes('coffee'));
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const discountFromPoints = pointsToRedeem * 100; // Rp 100 per loyalty point
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(Math.max(0, subtotal - discountFromPoints) * 0.11);
  const total = Math.max(0, subtotal - discountFromPoints + tax);

  const handleSelectMember = (member: CustomerMember) => {
    setSelectedMember(member);
    setPointsToRedeem(0);
    setIsMemberModalOpen(false);
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setOrderDone(true);
    setOfflineNotice(null);

    const customerName = selectedMember ? `${selectedMember.name} [${selectedMember.tier}]` : `Kasir Walk-in (${payment.toUpperCase()})`;

    if (selectedMember) {
      await addPointsFromTransaction(selectedMember.id, total);
    }

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
      setOfflineNotice('Order disimpan dalam antrean Offline (Idempotency Dijamin & Poin Dicatat)');
    } else {
      try {
        await createLiveOrder({
          customer_name: customerName,
          order_type: 'takeaway',
          total: total,
          table_number: 'BAR-POS',
        });
      } catch (err) {
        console.warn('POS live order trigger err, falling back to offline queue:', err);
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
        setOfflineNotice('Order masuk antrean Offline karena gangguan server sementara');
      }
    }

    setTimeout(() => {
      setCart([]);
      setSelectedMember(null);
      setPointsToRedeem(0);
      setOrderDone(false);
      setOfflineNotice(null);
    }, 2500);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex gap-6 h-full -m-6 lg:-m-8">
      {/* Left Panel: Product Grid */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#F5F3F0] p-6 lg:p-8">
        {/* Offline & Queue Status Banner */}
        <div className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all shadow-sm ${
          isOnline ? 'bg-green-500/10 border border-green-500/30 text-green-700' : 'bg-amber-500/15 border border-amber-500/40 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi size={16} className="text-green-600 animate-pulse" /> : <WifiOff size={16} className="text-amber-600" />}
            <span>{isOnline ? 'Status: Online — Real-Time POS Sync Aktif' : 'Status: Offline — Mode Antrean Lokal Aktif (Idempotency Enabled)'}</span>
          </div>
          {queueCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-amber-600 text-white px-2.5 py-1 text-[11px]">
                <Database size={13} />
                Antrean Offline: {queueCount} order
              </span>
              {isOnline && (
                <button
                  onClick={() => syncQueue()}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 rounded-lg bg-[#12100E] px-3 py-1 text-white hover:bg-[#1e1a17] transition-colors"
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                </button>
              )}
            </div>
          )}
        </div>

        {offlineNotice && (
          <div className="mb-4 rounded-xl bg-blue-600/10 border border-blue-500/30 px-4 py-2.5 text-xs font-bold text-blue-700 flex items-center gap-2">
            <Check size={16} className="text-blue-600" />
            <span>{offlineNotice}</span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#12100E] text-[#BA935D]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-2">
          {filtered.map((product) => {
            const inCart = cart.find((i) => i.id === product.id);
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  inCart
                    ? 'border-[#BA935D] bg-[#BA935D]/10'
                    : 'border-gray-100 bg-white hover:border-[#BA935D]/50'
                }`}
              >
                <span className="text-3xl mb-2 text-[#BA935D]">
                  <Coffee size={28} />
                </span>
                <span className="text-sm font-bold text-gray-800 leading-tight mb-1">{product.name}</span>
                <span className="text-sm font-bold text-[#BA935D]">{fmt(product.price)}</span>
                {inCart && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#BA935D] text-[10px] font-bold text-white">
                    {inCart.qty}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Cart + Checkout */}
      <div className="w-80 xl:w-96 flex flex-col bg-white border-l border-gray-200 shadow-lg shrink-0">
        {/* Cart Header + CRM Member Bar */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-800">Pesanan</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cart.length} item · Meja Walk-in</p>
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

          {/* CRM Loyalty Box */}
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
                <span>Saldo Poin: <strong className="text-[#BA935D]">{selectedMember.points.toLocaleString()} pts</strong></span>
                {selectedMember.points >= 100 && (
                  <button
                    onClick={() => setPointsToRedeem(pointsToRedeem === 0 ? Math.min(selectedMember.points, Math.floor(subtotal / 100)) : 0)}
                    className="text-[11px] font-bold text-[#BA935D] underline"
                  >
                    {pointsToRedeem > 0 ? 'Batal Tukar' : 'Tukar Poin'}
                  </button>
                )}
              </div>
              {pointsToRedeem > 0 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 text-xs border border-[#BA935D]/30">
                  <span className="text-gray-500 text-[11px]">Potongan {pointsToRedeem} pts</span>
                  <span className="font-bold text-green-600">-{fmt(discountFromPoints)}</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#BA935D] bg-[#FAF6F0]/60 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#FAF6F0] transition-colors"
            >
              <Gift size={14} />
              <span>+ Pilih / Cari Member CRM Loyalty</span>
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 py-12">
              <ShoppingBag size={48} className="mb-3 text-gray-300" />
              <p className="text-sm font-medium">Belum ada item<br />Pilih menu di sebelah kiri</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="p-2 rounded-xl bg-amber-50 text-[#BA935D]">
                  <Coffee size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-[#BA935D] font-semibold">{fmt(item.price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors">
                    {item.qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#BA935D] text-white hover:bg-[#a07d4e] transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Summary + Checkout */}
        <div className="border-t border-gray-100 px-5 py-5 space-y-4">
          {/* Subtotal / Tax / Total */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discountFromPoints > 0 && (
              <div className="flex justify-between text-green-600 font-bold text-xs">
                <span>Diskon Poin Loyalty ({pointsToRedeem} pts)</span>
                <span>-{fmt(discountFromPoints)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>PPN 11%</span>
              <span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-[#BA935D]">{fmt(total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPayment(m.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-bold transition-all ${
                  payment === m.id
                    ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleOrder}
            disabled={cart.length === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-sm transition-all ${
              cart.length > 0
                ? 'bg-[#12100E] text-[#BA935D] hover:bg-[#1e1a17] active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {orderDone ? (
              <span className="flex items-center gap-2 text-green-400">
                <Check size={18} />
                <span>Order Berhasil Dikirim ke KDS!</span>
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

      {/* CRM Member Lookup Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-[#BA935D]" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Pilih Member CRM / Loyalty</h3>
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
                      <p className="text-[11px] text-gray-500">{c.phone} · <strong className="text-[#BA935D]">{c.points.toLocaleString()} pts</strong></p>
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
