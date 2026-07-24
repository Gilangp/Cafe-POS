'use client';

import { useState, useEffect } from 'react';
import { useProducts, CatalogProduct } from '@/features/menu/hooks/use-products';
import { useRealtimeOrders } from '@/features/cashier/hooks/use-realtime-orders';
import { CustomerLayout } from '@/features/users/customer-layout';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  MapPin,
  Search,
  ChevronDown,
  Tag,
  ArrowRight,
  Coffee,
  Zap,
  Truck,
  Building2,
  Phone,
  Info,
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string | number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  ice: string;
  sweetness: string;
  milk: string;
  notes: string;
}

const CART_STORAGE_KEY = 'velvra_online_cart_v1';

export default function OnlineOrderPage() {
  const { products, loading: catalogLoading, usingLive } = useProducts();
  const { createLiveOrder } = useRealtimeOrders();

  const [branch, setBranch] = useState('Sudirman Flagship');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dinein'>('pickup');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Customization modal state
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [iceLevel, setIceLevel] = useState('Normal Ice');
  const [sweetnessLevel, setSweetnessLevel] = useState('100% Normal');
  const [milkOption, setMilkOption] = useState('Full Cream (Default)');
  const [itemNotes, setItemNotes] = useState('');

  // Cart & Checkout state (ORD-005 Persistence)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'confirm' | 'success'>('cart');
  const [lastOrderNum, setLastOrderNum] = useState('');

  // Delivery Address Form state (ORD-005)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Jakarta Selatan · 12190');
  const [courierNotes, setCourierNotes] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('081234567890');

  // Load cart from localStorage on mount (ORD-005)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {}
  }, []);

  // Save cart to localStorage on change (ORD-005)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const categories = ['Semua', 'Coffee', 'Iced Coffee', 'Pastry', 'Non-Coffee', 'Main Dish'];

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory || (activeCategory === 'Coffee' && p.category.includes('Coffee'));
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenCustomizer = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setIceLevel('Normal Ice');
    setSweetnessLevel('100% Normal');
    setMilkOption('Full Cream (Default)');
    setItemNotes('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    let extraPrice = 0;
    if (milkOption.includes('Oat Milk') || milkOption.includes('Almond Milk')) {
      extraPrice += 10000;
    }

    const uniqueId = `${selectedProduct.id}-${iceLevel}-${sweetnessLevel}-${milkOption}`;
    const finalPrice = selectedProduct.price + extraPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === uniqueId && i.notes === itemNotes);
      if (existing) {
        return prev.map((i) => (i.id === uniqueId && i.notes === itemNotes ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: uniqueId,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: finalPrice,
          qty: 1,
          emoji: 'COFFEE',
          ice: iceLevel,
          sweetness: sweetnessLevel,
          milk: milkOption,
          notes: itemNotes,
        },
      ];
    });

    setSelectedProduct(null);
    setCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST25') {
      setAppliedDiscount(25000);
      setPromoSuccess('Promo FIRST25 aktif! Potongan Rp 25.000');
    } else if (promoCode.toUpperCase() === 'HAPPY17') {
      setAppliedDiscount(20000);
      setPromoSuccess('Promo HAPPY17 aktif! Potongan Rp 20.000');
    } else {
      setPromoSuccess('Kode promo tidak valid');
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = orderType === 'delivery' ? (subtotal >= 150000 ? 0 : 15000) : 0;
  const tax = Math.round((subtotal - appliedDiscount) * 0.11);
  const total = Math.max(0, subtotal - appliedDiscount + tax + deliveryFee);

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handlePayNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Harap masukkan alamat pengantaran lengkap Anda (ORD-005)');
      return;
    }

    setCheckoutStep('success');
    try {
      const created = await createLiveOrder({
        customer_name: orderType === 'delivery' ? `Delivery (${recipientPhone})` : 'Pelanggan Online App',
        order_type: orderType === 'pickup' ? 'takeaway' : orderType === 'dinein' ? 'dine_in' : 'delivery',
        total: total,
        table_number: orderType === 'dinein' ? 'MEJA-ONLINE' : orderType === 'delivery' ? `DELIVERY: ${deliveryCity}` : 'PICKUP-APP',
      });
      if (created && created.order_number) {
        setLastOrderNum(created.order_number);
      }
    } catch (err) {
      console.warn('Checkout live trigger err:', err);
    }
    setTimeout(() => {
      setCart([]);
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (e) {}
      setCheckoutStep('cart');
    }, 7000);
  };

  return (
    <CustomerLayout>
      {/* Top Banner / Order Context Header */}
      <div className="bg-[#12100E] text-white border-b border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Pesan Menu Online (`ORD-005`)</h1>
              {usingLive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live Supabase Menu
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">
              Nikmati racikan kopi premium dan artisan pastry langsung dari barista terbaik kami.
            </p>
          </div>

          {/* Branch Switcher & Order Mode */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 pl-9 pr-8 text-sm font-semibold text-white focus:border-[#BA935D] focus:outline-none"
              >
                <option value="Sudirman Flagship" className="bg-[#12100E] text-white">Sudirman Flagship</option>
                <option value="Kemang Artisan Bar" className="bg-[#12100E] text-white">Kemang Artisan Bar</option>
                <option value="Senayan City" className="bg-[#12100E] text-white">Senayan City Lounge</option>
              </select>
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BA935D] pointer-events-none" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>

            <div className="flex rounded-xl bg-white/10 p-1 border border-white/10">
              {(['pickup', 'dinein', 'delivery'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderType(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderType === mode ? 'bg-[#BA935D] text-[#12100E]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {mode === 'pickup' && <span>Ambil (Pickup)</span>}
                  {mode === 'dinein' && <span>Dine-In Meja</span>}
                  {mode === 'delivery' && (
                    <>
                      <Truck size={13} />
                      <span>Delivery</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Categories Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, pastry, sarapan..."
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-[#BA935D]/40 transition-all duration-300 overflow-hidden"
            >
              {/* Image / Icon Hero */}
              <div className="relative flex items-center justify-center h-48 bg-gradient-to-b from-[#FAF6F0] to-[#f3ebe1] p-6 text-7xl group-hover:scale-105 transition-transform">
                <Coffee size={48} className="text-[#BA935D]" />
                {product.tags && product.tags.includes('Best Seller') && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#BA935D] px-3 py-1 text-[10px] font-bold text-white shadow-md">
 Favorit
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 p-5 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#BA935D]">{product.category}</span>
                    <span className="text-base font-bold text-gray-900 font-serif">{fmt(product.price)}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-800 group-hover:text-[#BA935D] transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                <button
                  onClick={() => handleOpenCustomizer(product)}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#12100E] py-3 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] active:scale-95 transition-all shadow-sm"
                >
                  <Plus size={15} />
                  <span>Pilih & Sesuaikan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Trigger Pill */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-40">
          <button
            onClick={() => {
              setCartOpen(true);
              setCheckoutStep('cart');
            }}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 rounded-full bg-[#12100E] border-2 border-[#BA935D] px-6 py-4 text-white shadow-2xl hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BA935D] font-bold text-[#12100E] text-sm">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
              <div className="text-left">
                <p className="text-xs text-white/70 font-semibold">Keranjang Anda</p>
                <p className="text-sm font-bold text-[#BA935D] font-serif">{fmt(total)}</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-white bg-white/10 px-4 py-2 rounded-full">
              Lihat Pesanan <ArrowRight size={14} />
            </span>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#FAF6F0]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BA935D]/15 text-[#BA935D]">
                  <Coffee size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-800">{selectedProduct.name}</h3>
                  <p className="text-xs font-bold text-[#BA935D]">{fmt(selectedProduct.price)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Customizations */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Ice Level */}
              {['Coffee', 'Iced Coffee', 'Matcha'].includes(selectedProduct.category) && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Tingkat Es (Ice Level)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Normal Ice', 'Less Ice (Sedikit)', 'No Ice (Tanpa Es)'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setIceLevel(opt)}
                        className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                          iceLevel === opt
                            ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D] font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sweetness */}
              {['Coffee', 'Iced Coffee', 'Matcha'].includes(selectedProduct.category) && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Tingkat Manis (Sweetness)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['100% Normal', '70% Less', '50% Half', '0% No Sugar'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSweetnessLevel(opt)}
                        className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                          sweetnessLevel === opt
                            ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D] font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Milk Option */}
              {['Coffee', 'Matcha'].includes(selectedProduct.category) && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Pilihan Susu (Milk Choice)</label>
                  <div className="space-y-2">
                    {[
                      { label: 'Full Cream (Default)', extra: 0 },
                      { label: 'Oat Milk (Oatly Barista Edition)', extra: 10000 },
                      { label: 'Almond Milk (Unsweetened Premium)', extra: 10000 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setMilkOption(opt.label)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all ${
                          milkOption === opt.label
                            ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D] font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.extra > 0 ? <span className="font-bold text-[#BA935D]">+Rp 10.000</span> : <span className="text-gray-400">Gratis</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Catatan Tambahan untuk Barista</label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Contoh: Pisahkan gula saus, minta ekstra panas, dll."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#BA935D] focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#12100E] py-3 text-sm font-bold text-[#BA935D] hover:bg-[#201d19] transition-all shadow-md active:scale-95"
              >
                <Plus size={16} />
                <span>
                  Masuk ke Keranjang ·{' '}
                  {fmt(selectedProduct.price + (milkOption.includes('Oat Milk') || milkOption.includes('Almond Milk') ? 10000 : 0))}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart & Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="text-[#BA935D]" size={20} />
                <h2 className="font-serif text-xl font-bold text-gray-800">
                  {checkoutStep === 'cart' ? 'Keranjang Anda' : checkoutStep === 'confirm' ? 'Konfirmasi Pesanan' : 'Pesanan Berhasil!'}
                </h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutStep === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner animate-bounce">
                    <Check size={40} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gray-800">Pesanan Telah Diterima!</h3>
                  <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    Pesanan Anda dengan nomor e-ticket <strong className="text-gray-800">{lastOrderNum || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`}</strong> sedang disiapkan oleh barista kami di cabang <strong className="text-gray-800">{branch}</strong>.
                  </p>
                  <div className="rounded-2xl bg-[#FAF6F0] border border-[#BA935D]/30 p-4 w-full text-left space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total Pembayaran</span>
                      <span className="text-[#BA935D] text-sm">{fmt(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Metode Pengambilan</span>
                      <span className="capitalize font-semibold text-gray-700">
                        {orderType === 'pickup' ? 'Ambil Sendiri (Pickup)' : orderType === 'dinein' ? 'Dine-In' : 'Kurir Delivery'}
                      </span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="pt-2 border-t border-gray-200 text-gray-600 space-y-0.5">
                        <p className="font-bold text-gray-800">Alamat Pengantaran (ORD-005):</p>
                        <p>{deliveryAddress}, {deliveryCity}</p>
                        {courierNotes && <p className="italic text-amber-700">Note: {courierNotes}</p>}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded-xl p-2.5 font-semibold flex items-center gap-1.5">
                    <Zap size={14} className="shrink-0 text-amber-500" />
                    <span>Tiket sudah terkirim secara Live ke layar KDS Dapur Utama!</span>
                  </div>
                </div>
              ) : checkoutStep === 'confirm' ? (
                <form onSubmit={handlePayNow} className="space-y-6">
                  <div className="rounded-2xl bg-[#FAF6F0] p-4 border border-gray-200 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#BA935D]">Ringkasan Toko / Pengambilan</p>
                    <p className="text-sm font-bold text-gray-800">{branch}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      Mode: {orderType === 'pickup' ? 'Ambil di Toko' : orderType === 'dinein' ? 'Makan di Meja' : 'Kurir Delivery'}
                    </p>
                  </div>

                  {/* Delivery Address Form (ORD-005) */}
                  {orderType === 'delivery' && (
                    <div className="rounded-2xl border-2 border-[#BA935D]/50 bg-white p-4 space-y-3.5 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800 border-b border-gray-100 pb-2">
                        <Truck size={16} className="text-[#BA935D]" />
                        <span>Form Alamat Pengantaran (ORD-005)</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Alamat Jalan & Nomor Rumah/Gedung *
                        </label>
                        <input
                          required
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Contoh: Jl. Sudirman No. 45, Tower A Lt. 12"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Kota / Area & Kode Pos
                        </label>
                        <input
                          required
                          type="text"
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="Contoh: Jakarta Selatan · 12190"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Nomor WhatsApp Penerima *
                        </label>
                        <input
                          required
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                          Catatan Khusus untuk Kurir (Optional)
                        </label>
                        <input
                          type="text"
                          value={courierNotes}
                          onChange={(e) => setCourierNotes(e.target.value)}
                          placeholder="Contoh: Titip di resepsionis / telpon sebelum tiba"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      {deliveryFee > 0 ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <Info size={14} className="shrink-0 text-amber-600" />
                          <span>Belanja min. Rp 150.000 untuk Gratis Ongkir!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-green-800 bg-green-50 p-2 rounded-lg border border-green-200 font-bold">
                          <span>✓ Hore! Pesanan Anda memenuhi syarat Gratis Ongkir (Rp 0)</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Detail Tagihan Pembayaran</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal Item</span>
                        <span>{fmt(subtotal)}</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Diskon Promo</span>
                          <span>-{fmt(appliedDiscount)}</span>
                        </div>
                      )}
                      {orderType === 'delivery' && (
                        <div className="flex justify-between">
                          <span>Ongkos Kirim Kurir</span>
                          <span>{deliveryFee === 0 ? <strong className="text-green-600">GRATIS</strong> : fmt(deliveryFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>PPN 11%</span>
                        <span>{fmt(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                        <span>Total Tagihan</span>
                        <span className="text-[#BA935D]">{fmt(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Metode Pembayaran</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['QRIS (GoPay/OVO/Dana)', 'Kartu Debit/Kredit', 'Pay at Counter'].map((m, i) => (
                        <label
                          key={m}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold cursor-pointer ${
                            i === 0 ? 'border-[#BA935D] bg-[#BA935D]/10 text-[#BA935D]' : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          <input type="radio" name="paymethod" defaultChecked={i === 0} className="accent-[#BA935D]" />
                          <span>{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-sm text-white hover:bg-green-700 active:scale-95 transition-all shadow-lg"
                    >
                      <Check size={16} />
                      <span>Bayar Sekarang · {fmt(total)}</span>
                    </button>
                  </div>
                </form>
              ) : cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
                  <ShoppingBag size={50} className="text-gray-300 mb-3" />
                  <p className="text-sm font-medium">
                    Keranjang Anda masih kosong.<br />Yuk, pilih kopi favoritmu di katalog!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3.5 bg-gray-50/50">
                      <div className="p-2 rounded-xl bg-amber-50 text-[#BA935D] mt-1 shrink-0">
                        <Coffee size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-[#BA935D] font-bold">{fmt(item.price)}</p>
                        {item.ice !== 'Normal Ice' && <p className="text-[11px] text-gray-500">· {item.ice}</p>}
                        {item.sweetness !== '100% Normal' && <p className="text-[11px] text-gray-500">· {item.sweetness}</p>}
                        {item.milk !== 'Full Cream (Default)' && <p className="text-[11px] text-gray-500">· {item.milk}</p>}
                        {item.notes && <p className="text-[11px] text-amber-600 italic mt-0.5">Note: {item.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#BA935D] text-white hover:bg-[#a07d4e] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Promo Code Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Punya Kode Promo?</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Coba: FIRST25 atau HAPPY17"
                          className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-xs uppercase focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        className="rounded-xl bg-[#12100E] px-4 py-2 text-xs font-bold text-[#BA935D] hover:opacity-90 transition-opacity"
                      >
                        Gunakan
                      </button>
                    </div>
                    {promoSuccess && (
                      <p className={`text-xs mt-1.5 font-semibold ${promoSuccess.includes('aktif') ? 'text-green-600' : 'text-red-500'}`}>
                        {promoSuccess}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && checkoutStep === 'cart' && (
              <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-xs font-bold">
                      <span>Diskon Promo</span>
                      <span>-{fmt(appliedDiscount)}</span>
                    </div>
                  )}
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>Ongkos Kirim Kurir</span>
                      <span>{deliveryFee === 0 ? <strong className="text-green-600">GRATIS</strong> : fmt(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>PPN 11%</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
                    <span>Total Pembayaran</span>
                    <span className="text-[#BA935D]">{fmt(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('confirm')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#12100E] py-4 font-bold text-sm text-[#BA935D] hover:bg-[#201d19] active:scale-95 transition-all shadow-lg"
                >
                  <span>Lanjut Konfirmasi Pesanan</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
