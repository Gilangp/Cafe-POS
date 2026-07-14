'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Coffee, Bell, ShoppingBag, Plus, Minus, Check, Sparkles, AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  desc: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Velvet Espresso', category: 'Espresso', price: 30000, emoji: '☕', desc: 'Espresso shot ganda dengan krema keemasan pekat.' },
  { id: 2, name: 'Caramel Sea Salt Latte', category: 'Latte', price: 38000, emoji: '🥛', desc: 'Perpaduan espresso artisan dan saus karamel sea salt homemade.' },
  { id: 3, name: 'Iced Macchiato Cloud', category: 'Latte', price: 42000, emoji: '🧊', desc: 'Cold espresso dengan lapisan macchiato foam dingin.' },
  { id: 4, name: 'Golden Cappuccino', category: 'Espresso', price: 35000, emoji: '☕', desc: 'Cappuccino klasik racikan rasio 1:1:1.' },
  { id: 5, name: 'Signature Cold Brew 18H', category: 'Cold Brew', price: 36000, emoji: '🧋', desc: 'Diseduh dengan air dingin secara perlahan selama 18 jam.' },
  { id: 6, name: 'Valrhona Chocolate Brownie', category: 'Pastry', price: 45000, emoji: '🍫', desc: 'Fudgy brownie hangat dari cokelat Valrhona 70%.' },
  { id: 7, name: 'French Butter Croissant', category: 'Pastry', price: 32000, emoji: '🥐', desc: 'Croissant panggang segar dengan mentega Prancis.' },
  { id: 8, name: 'Artisan Avocado Toast', category: 'Makanan', price: 60000, emoji: '🥑', desc: 'Roti sourdough panggang dengan alpukat tumbuk segar.' },
];

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

export default function QrTableOrderingPage() {
  const params = useParams();
  const tableCode = (params?.tableCode as string) || 'MEJA-04';
  const displayTable = tableCode.replace('-', ' ').toUpperCase();

  const { createLiveOrder } = useRealtimeOrders();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [cart, setCart] = useState<{ id: number; name: string; price: number; qty: number; emoji: string }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [callWaiterStatus, setCallWaiterStatus] = useState('');

  const categories = ['Semua', 'Espresso', 'Latte', 'Cold Brew', 'Pastry', 'Makanan'];

  const filtered = PRODUCTS.filter((p) => activeCategory === 'Semua' || p.category === activeCategory);

  const handleQuickAdd = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, emoji: p.emoji }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0));
  };

  const handleCallWaiter = (type: 'assistance' | 'bill') => {
    setCallWaiterStatus(type === 'assistance' ? 'Barista telah dipanggil ke meja Anda!' : 'Permintaan tagihan telah dikirim ke kasir!');
    setTimeout(() => setCallWaiterStatus(''), 4000);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handleSendToKds = async () => {
    setOrderSubmitted(true);
    try {
      await createLiveOrder({
        customer_name: `Tamu QR (${displayTable})`,
        order_type: 'dine_in',
        total: total,
        table_number: displayTable,
      });
    } catch (err) {
      console.warn('Live QR order trigger err:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#12100E] font-sans pb-28">
      {/* Table Context Top Bar */}
      <header className="bg-[#12100E] text-white sticky top-0 z-40 border-b border-white/10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40 text-[#BA935D] font-bold">
              <Coffee size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white tracking-wide">Velvra QR Order</span>
                <span className="rounded-full bg-[#BA935D] px-2.5 py-0.5 text-[11px] font-bold text-[#12100E]">
                  {displayTable}
                </span>
              </div>
              <p className="text-[11px] text-white/60">Sudirman Flagship · Live Kitchen Ordering</p>
            </div>
          </div>

          {/* Quick Call Waiter Button */}
          <button
            onClick={() => handleCallWaiter('assistance')}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            <Bell size={14} className="text-[#BA935D]" />
            <span>Panggil Barista</span>
          </button>
        </div>
      </header>

      {/* Alert status */}
      {callWaiterStatus && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="rounded-2xl bg-amber-100 border border-amber-300 p-4 text-xs font-bold text-amber-900 flex items-center gap-2">
            <Bell size={16} className="text-amber-600 animate-bounce" />
            <span>{callWaiterStatus}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((product) => {
            const inCart = cart.find((i) => i.id === product.id);
            return (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm hover:border-[#BA935D]/50 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FAF6F0] text-3xl">
                    {product.emoji}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BA935D]">{product.category}</span>
                    <h3 className="font-serif font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{fmt(product.price)}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {inCart ? (
                    <div className="flex items-center gap-2 rounded-xl bg-[#FAF6F0] border border-[#BA935D]/40 p-1">
                      <button onClick={() => updateQty(product.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-gray-800">{inCart.qty}</span>
                      <button onClick={() => updateQty(product.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#12100E] text-[#BA935D] shadow-sm">
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#12100E] px-4 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] active:scale-95 transition-all shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Pesan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar for Cart / Bill Request */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => handleCallWaiter('bill')}
            className="flex items-center gap-2 rounded-2xl border border-gray-300 px-5 py-3.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <span>Minta Bill / Bayar di Meja</span>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            disabled={cart.length === 0}
            className={`flex-1 flex items-center justify-between rounded-2xl px-6 py-3.5 text-sm font-bold transition-all shadow-xl ${
              cart.length > 0
                ? 'bg-[#12100E] text-[#BA935D] hover:bg-[#201d19] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#BA935D] text-xs font-bold text-[#12100E]">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
              <span>Kirim ke Dapur ({displayTable})</span>
            </div>
            <span>{fmt(total)} →</span>
          </button>
        </div>
      </div>

      {/* Cart Drawer Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-800">Pesanan {displayTable}</h3>
                <p className="text-xs text-gray-400">Pesanan akan langsung diproses di dapur (KDS)</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <X size={18} />
              </button>
            </div>

            {orderSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto animate-bounce">
                  <Check size={36} />
                </div>
                <h4 className="font-serif text-2xl font-bold text-gray-800">Pesanan Diterima Dapur!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Barista kami sedang meracik pesanan Anda. Silakan duduk santai di {displayTable}.
                </p>
                <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-xl p-2.5 font-semibold max-w-xs mx-auto">
                  ⚡ Tiket sudah terkirim secara Live ke layar KDS Dapur Utama!
                </div>
                <button
                  onClick={() => { setOrderSubmitted(false); setCart([]); setCartOpen(false); }}
                  className="rounded-xl bg-[#12100E] px-6 py-3 text-xs font-bold text-[#BA935D]"
                >
                  Kembali ke Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs font-bold text-[#BA935D]">{fmt(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#12100E] text-[#BA935D]">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500"><span>Subtotal Item</span><span>{fmt(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>PPN 11%</span><span>{fmt(tax)}</span></div>
                    <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-100">
                      <span>Total Pesanan Meja</span>
                      <span className="text-[#BA935D]">{fmt(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendToKds}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#12100E] py-4 text-sm font-bold text-[#BA935D] shadow-xl hover:bg-[#201d19] active:scale-95 transition-all"
                  >
                    <span>Kirim Langsung ke Dapur (KDS)</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
