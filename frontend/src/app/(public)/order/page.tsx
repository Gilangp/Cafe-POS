'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShoppingBag, Utensils, Hash, Loader2, Trash2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/shared/lib/supabase';
import { useCart } from '@/shared/providers/cart-context';

function OrderContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, updateNote, totalPrice, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Form State
  const [customerName, setCustomerName] = React.useState('');
  const [tableNumber, setTableNumber] = React.useState('');
  const [orderType, setOrderType] = React.useState('dine_in');
  const [paymentMethod, setPaymentMethod] = React.useState('cashier');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !customerName) return;

    setIsSubmitting(true);
    try {
      const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newRecord = {
        order_number: orderNum,
        customer_name: customerName,
        order_type: orderType,
        status: 'pending',
        total: totalPrice,
        table_number: orderType === 'dine_in' ? tableNumber : 'Takeaway',
        items_count: items.reduce((sum, item) => sum + item.quantity, 0),
        items: items.map(item => ({
          id: `${Date.now()}-${item.id}`,
          menu_id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          note: item.note ? `${item.note} [${paymentMethod}]` : `[${paymentMethod}]`,
          done: false,
        })),
        branch_id: 1, // Default branch
      };

      const { error } = await supabase.from('orders').insert([newRecord]);
      
      if (error) {
        console.error('Failed to insert order to supabase:', error);
      }
      
      clearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF3E7] dark:bg-[#14201A] py-24">
        <div className="max-w-md mx-auto px-4">
          <Card className="p-8 text-center bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] rounded-3xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-[#1E3D31]/10 dark:bg-[#C89B5C]/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={48} className="text-[#1E3D31] dark:text-[#C89B5C]" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-[#1E3D31] dark:text-[#F5EFE6]">Pesanan Berhasil!</h2>
            <p className="text-sm text-[#5C5348] dark:text-[#B8A99A]">
              Terima kasih, <strong>{customerName}</strong>. Pesanan Anda sedang diproses dan akan segera disiapkan oleh barista kami.
            </p>
            
            {paymentMethod === 'qris' && (
              <div className="w-full bg-[#FAF3E7] dark:bg-[#14201A] border border-[#E4D9C4] dark:border-[#33413A] rounded-2xl p-4 mt-2">
                <p className="text-xs font-bold text-[#1E3D31] dark:text-[#C89B5C] uppercase mb-3">Selesaikan Pembayaran</p>
                <div className="w-40 h-40 bg-white mx-auto rounded-xl p-2 border border-[#E4D9C4] flex flex-col items-center justify-center gap-2">
                  <div className="text-[10px] text-gray-500 font-bold">QRIS Mockup</div>
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockPaymentGateway" alt="QRIS" width={120} height={120} />
                </div>
                <p className="text-[11px] text-[#5C5348] dark:text-[#B8A99A] mt-3">Silakan scan kode QR di atas dengan aplikasi e-Wallet atau M-Banking Anda.</p>
              </div>
            )}
            
            <Link href="/menu" className="w-full mt-6">
              <Button variant="gold" className="w-full rounded-xl h-12 font-bold shadow-md">
                Pesan Menu Lainnya
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF3E7] dark:bg-[#14201A] py-24">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <ShoppingBag size={64} className="mx-auto text-[#C89B5C] opacity-50" />
          <h1 className="text-3xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">Keranjang Kosong</h1>
          <p className="text-[#5C5348] dark:text-[#B8A99A]">Anda belum menambahkan menu apapun ke dalam pesanan.</p>
          <Link href="/menu">
            <Button variant="gold" className="rounded-xl mt-4 px-8 font-bold">Lihat Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E7] dark:bg-[#14201A] py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/menu" className="inline-flex items-center gap-2 text-[#5C5348] dark:text-[#B8A99A] hover:text-[#1E3D31] dark:hover:text-[#C89B5C] transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Kembali ke Menu</span>
          </Link>

          <h1 className="text-3xl font-bold font-heading text-[#1E3D31] dark:text-[#F5EFE6] mb-8">Keranjang Pesanan</h1>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-6">
              {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl overflow-hidden bg-[#FAF3E7]">
                    <Image
                      src={item.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#C89B5C] tracking-wider">{item.category_name || 'Menu'}</span>
                          <h3 className="text-lg font-bold text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">{item.name}</h3>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[#5C5348] hover:text-red-500 transition-colors p-1">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-[#1E3D31] dark:text-[#C89B5C] mt-1">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 mt-4">
                      <div className="flex items-center h-10 rounded-xl border border-[#E4D9C4] dark:border-[#33413A] bg-[#FAF3E7] dark:bg-[#14201A] overflow-hidden w-32">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-full flex items-center justify-center text-[#5C5348] hover:bg-[#E4D9C4] dark:hover:bg-[#33413A]">-</button>
                        <span className="flex-1 text-center font-semibold text-sm">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-full flex items-center justify-center text-[#5C5348] hover:bg-[#E4D9C4] dark:hover:bg-[#33413A]">+</button>
                      </div>
                      
                      <div className="font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-5">
              <Card className="p-6 md:p-8 bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A] rounded-3xl shadow-xl sticky top-28">
                <h2 className="text-xl font-bold font-heading text-[#1E3D31] dark:text-[#F5EFE6] mb-6 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#C89B5C]" />
                  Informasi Pemesan
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1E3D31] dark:text-[#B8A99A]">
                      Nama Pemesan <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Masukkan nama Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 rounded-xl border-[#E4D9C4] dark:border-[#33413A] bg-[#FAF3E7] dark:bg-[#14201A] focus:border-[#C89B5C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1E3D31] dark:text-[#B8A99A]">
                      Tipe Pesanan
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                          orderType === 'dine_in'
                            ? 'bg-[#1E3D31] text-[#C89B5C] border border-[#1E3D31] shadow-md'
                            : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348] dark:text-[#B8A99A] border border-[#E4D9C4] dark:border-[#33413A] hover:border-[#C89B5C]'
                        }`}
                      >
                        <Utensils size={16} /> Makan di Sini
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                          orderType === 'takeaway'
                            ? 'bg-[#1E3D31] text-[#C89B5C] border border-[#1E3D31] shadow-md'
                            : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348] dark:text-[#B8A99A] border border-[#E4D9C4] dark:border-[#33413A] hover:border-[#C89B5C]'
                        }`}
                      >
                        <ShoppingBag size={16} /> Bawa Pulang
                      </button>
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#1E3D31] dark:text-[#B8A99A]">
                        Nomor Meja <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C5348] dark:text-[#B8A99A]" />
                        <Input
                          required={orderType === 'dine_in'}
                          placeholder="Contoh: 12"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="h-12 pl-10 rounded-xl border-[#E4D9C4] dark:border-[#33413A] bg-[#FAF3E7] dark:bg-[#14201A] focus:border-[#C89B5C]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#1E3D31] dark:text-[#B8A99A]">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cashier')}
                        className={`h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                          paymentMethod === 'cashier'
                            ? 'bg-[#1E3D31] text-[#C89B5C] border border-[#1E3D31] shadow-md'
                            : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348] dark:text-[#B8A99A] border border-[#E4D9C4] dark:border-[#33413A] hover:border-[#C89B5C]'
                        }`}
                      >
                        <Wallet size={16} /> Bayar di Kasir
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qris')}
                        className={`h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                          paymentMethod === 'qris'
                            ? 'bg-[#1E3D31] text-[#C89B5C] border border-[#1E3D31] shadow-md'
                            : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348] dark:text-[#B8A99A] border border-[#E4D9C4] dark:border-[#33413A] hover:border-[#C89B5C]'
                        }`}
                      >
                        QRIS / e-Wallet
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#E4D9C4] dark:border-[#33413A] flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-[#5C5348] dark:text-[#B8A99A] uppercase">Total Pembayaran</span>
                        <div className="text-2xl font-bold text-[#1E3D31] dark:text-[#C89B5C]">
                          {formatPrice(totalPrice)}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !customerName || (orderType === 'dine_in' && !tableNumber) || items.length === 0}
                      variant="gold" 
                      className="w-full rounded-xl h-14 text-sm font-bold shadow-xl"
                    >
                      {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Selesaikan Pemesanan'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

          </div>
        </div>
      </div>
  );
}

export default function OrderPage() {
  return (
    <PublicLayout>
      <OrderContent />
    </PublicLayout>
  );
}
