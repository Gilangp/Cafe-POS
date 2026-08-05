'use client';

import React from 'react';
import {
  ShoppingCart, ChevronLeft, MapPin, Coffee, Trash2,
  Minus, Plus, Banknote, QrCode, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartPanelProps {
  isMobileOverlay?: boolean;
  cart: any;
  orderType: 'dine_in' | 'takeaway' | null;
  setOrderType: (type: 'dine_in' | 'takeaway') => void;
  assignedTable: string;
  setAssignedTable: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  cashGiven: number | '';
  setCashGiven: (val: number | '') => void;
  discountInput: number | '';
  setDiscountInput: (val: number | '') => void;
  applyDiscount: (val: number | '') => void;
  formatCurrency: (amount: number) => string;
  error: string;
  isProcessing: boolean;
  handleProcessOrder: () => Promise<void>;
  setShowCartOnMobile: (show: boolean) => void;
  fmtNum: (n: number) => string;
}

const CartPanel = React.memo(function CartPanel({
  isMobileOverlay = false,
  cart,
  orderType,
  setOrderType,
  assignedTable,
  setAssignedTable,
  customerName,
  setCustomerName,
  cashGiven,
  setCashGiven,
  discountInput,
  setDiscountInput,
  applyDiscount,
  formatCurrency,
  error,
  isProcessing,
  handleProcessOrder,
  setShowCartOnMobile,
}: CartPanelProps) {
  return (
    <div className={`flex flex-col flex-1 min-h-[600px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden ${isMobileOverlay ? 'fixed inset-0 z-50 rounded-none border-0' : ''}`}>
      <div className={`p-4 border-b border-border flex items-center justify-between bg-accent ${isMobileOverlay ? '' : 'rounded-t-xl'}`}>
        <div className="flex items-center gap-2 min-w-0">
          {isMobileOverlay && (
            <button
              onClick={() => setShowCartOnMobile(false)}
              className="text-white/70 hover:text-white p-0.5 -ml-1"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <ShoppingCart size={20} className="text-white shrink-0" />
          <h2 className="font-bold text-base xl:text-lg text-white truncate">Pesanan Saat Ini</h2>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs xl:text-sm font-bold text-white shrink-0 ml-2">
          {cart.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0)} Items
        </div>
      </div>

      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-2 bg-card border border-border p-1.5 rounded-xl">
          <div className="flex gap-1 flex-1">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                orderType === 'dine_in'
                  ? 'bg-accent text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => { setOrderType('takeaway'); setAssignedTable(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                orderType === 'takeaway'
                  ? 'bg-accent text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
            >
              Takeaway
            </button>
          </div>

          {orderType === 'dine_in' && (
            <div className="flex items-center gap-2 border-l border-border pl-3 ml-1 w-20">
              <MapPin size={14} className="text-muted-foreground shrink-0" />
              <input
                value={assignedTable}
                onChange={(e) => setAssignedTable(e.target.value)}
                placeholder="Meja"
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-foreground w-full placeholder:text-muted-foreground"
              />
            </div>
          )}
        </div>

        {orderType && (
          <div className="mt-2 flex items-center gap-2 bg-card border border-border p-2 rounded-xl">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan"
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-foreground w-full placeholder:text-muted-foreground px-2"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 min-h-0">
        <AnimatePresence>
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
              <ShoppingCart size={48} />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            cart.items.map((item: any) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.cart_id}
                className="flex gap-3 bg-card p-3 rounded-xl border border-border shadow-sm hover:border-amber-500/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg bg-muted/10 overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Coffee size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0 justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => cart.removeItem(item.cart_id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.note && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">{item.note}</p>
                  )}

                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-muted rounded-lg p-1 border border-border">
                      <button
                        onClick={() => cart.updateQuantity(item.cart_id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-card hover:bg-muted rounded text-foreground"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-4 text-center text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.cart_id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-card hover:bg-muted rounded text-foreground"
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

      <div className="p-3 border-t border-border bg-muted/30 space-y-3 shrink-0">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <span className="text-xs font-bold text-muted-foreground shrink-0">Diskon</span>
          <span className="text-sm text-muted-foreground">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={discountInput !== '' ? new Intl.NumberFormat('id-ID').format(discountInput) : ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setDiscountInput(val ? Number(val) : '');
              applyDiscount(val ? Number(val) : '');
            }}
            onBlur={() => applyDiscount(discountInput)}
            className="w-20 bg-transparent text-right text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground ml-auto"
          />
        </div>

        <div className="flex gap-2">
          {([
            { id: 'tunai', icon: Banknote, label: 'Tunai' },
            { id: 'qris', icon: QrCode, label: 'QRIS' },
          ] as const).map((method) => {
            const Icon = method.icon;
            const isActive = cart.paymentMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => cart.setPaymentMethod(method.id as any)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 border rounded-xl transition-all ${
                  isActive
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 font-bold shadow-sm'
                    : 'border-border text-muted-foreground hover:bg-card'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{method.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5 text-sm font-semibold">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(cart.getSubtotal())}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Diskon</span>
              <span>-{formatCurrency(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-foreground pt-1.5 border-t border-border">
            <span>Total</span>
            <span className="text-amber-600 dark:text-amber-400">{formatCurrency(cart.getTotal())}</span>
          </div>
        </div>

        {cart.paymentMethod === 'tunai' && (
          <div className="pt-2 border-t border-border space-y-2">
            <div className="bg-card rounded-xl border border-border p-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 block">Tunai Diterima</label>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-muted-foreground">Rp</span>
                <input
                  type="text"
                  className="w-full bg-transparent text-right text-lg font-bold text-foreground focus:outline-none placeholder:text-muted-foreground"
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
              <span className="text-xs font-bold text-muted-foreground">KEMBALIAN</span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(Math.max(0, (Number(cashGiven) || 0) - cart.getTotal()))}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
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
              ? 'bg-muted text-muted-foreground shadow-none cursor-not-allowed'
              : 'bg-amber-600 text-white shadow-md hover:shadow-lg hover:bg-amber-700'
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
  );
});

export default CartPanel;
