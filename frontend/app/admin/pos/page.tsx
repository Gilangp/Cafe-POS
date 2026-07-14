'use client';

import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ChevronRight, CreditCard, Banknote, Smartphone, Coffee, ShoppingBag } from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState('cash');
  const [orderDone, setOrderDone] = useState(false);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
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

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const handleOrder = () => {
    if (cart.length === 0) return;
    setOrderDone(true);
    setTimeout(() => {
      setCart([]);
      setOrderDone(false);
    }, 2500);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex gap-6 h-full -m-6 lg:-m-8">
      {/* Left Panel: Product Grid */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#F5F3F0] p-6 lg:p-8">
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
        {/* Cart Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-800">Pesanan</h2>
          <p className="text-xs text-gray-400 mt-0.5">{cart.length} item · Meja Walk-in</p>
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
              <span>✅ Order Berhasil Dikirim!</span>
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
  );
}
