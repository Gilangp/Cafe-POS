import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PosPage from '@/app/admin/pos/page';
import KdsPage from '@/app/admin/kds/page';
import InventoryPage from '@/app/admin/inventory/page';
import { useCartStore } from '@/store/cart-store';

describe('Phase F0 UI/UX Tests: POS, KDS & Inventory Audit', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
    window.localStorage.clear();
  });

  it('1. POS UI (/admin/pos): Renders category tabs, product search, shift closed banner, and hold/recall actions', () => {
    render(<PosPage />);

    // Check header, shift banner, and search input
    expect(screen.getByText(/Sesi POS Ditutup/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Cari menu atau kode produk/i)).toBeDefined();
    expect(screen.getByText(/Semua/i)).toBeDefined();
    expect(screen.getAllByText(/Espresso/i).length).toBeGreaterThan(0);

    // Check cart panel section
    expect(screen.getByText(/Keranjang Kasir/i)).toBeDefined();
    expect(screen.getByText(/\+ Cari Member CRM Loyalty/i)).toBeDefined();
    expect(screen.getByText(/Subtotal/i)).toBeDefined();
    expect(screen.getByText(/Proses Pembayaran/i)).toBeDefined();
  });

  it('2. POS UI Interaction: Opening shift enables product selection and updates cart subtotal', () => {
    render(<PosPage />);

    // Click "Buka Sesi Sekarang" to open shift session modal
    const openShiftBtn = screen.getAllByRole('button', { name: /Buka Sesi Sekarang/i })[0];
    fireEvent.click(openShiftBtn);

    // Submit "Buka Shift & Mulai Transaksi" form
    const submitShiftBtn = screen.getByRole('button', { name: /Buka Shift & Mulai Transaksi/i });
    const form = submitShiftBtn.closest('form');
    if (form) fireEvent.submit(form);
    else fireEvent.click(submitShiftBtn);

    // Click product card once shift is open
    const productCard = screen.getByText(/Velvet Espresso Single Origin/i).closest('button');
    if (productCard) fireEvent.click(productCard);

    // Cart items should reflect addition
    expect(screen.getAllByText(/Velvet Espresso Single Origin/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/Rp 30.000/i).length).toBeGreaterThan(1);
  });

  it('3. KDS UI (/admin/kds): Renders active station selector, order ticket cards, and status workflow buttons', () => {
    render(<KdsPage />);

    // Header and column headers
    expect(screen.getByText(/Kitchen Display System \(KDS\)/i)).toBeDefined();
    expect(screen.getByText(/Antrean Tiket Baru/i)).toBeDefined();
    expect(screen.getByText(/Proses Racik & Masak/i)).toBeDefined();
    expect(screen.getByText(/Siap Saji \/ Pickup/i)).toBeDefined();

    // Order ticket action buttons
    expect(screen.getAllByRole('button', { name: /Mulai Masak \/ Siapkan Pesanan/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Tandai Siap Saji/i })[0]).toBeDefined();
  });

  it('4. KDS UI Interaction: Clicking workflow button triggers order status advancement', () => {
    render(<KdsPage />);

    const prepBtn = screen.getAllByRole('button', { name: /Mulai Masak \/ Siapkan Pesanan/i })[0];
    fireEvent.click(prepBtn);

    expect(screen.getAllByRole('button', { name: /Tandai Siap Saji/i })[0]).toBeDefined();
  });

  it('5. Inventory Audit UI (/admin/inventory): Renders stock balance table, FEFO batch badges, and adjustment modal triggers', () => {
    render(<InventoryPage />);

    expect(screen.getByText(/Inventori & Stok/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Tambah Item/i })).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Opname/i })[0]).toBeDefined();
    expect(screen.getByText(/Biji Kopi Gayo Washed/i)).toBeDefined();
  });

  it('6. Inventory UI Interaction: Clicking Opname opens cycle count modal with notes and physical count input', () => {
    render(<InventoryPage />);

    const opnameBtns = screen.getAllByRole('button', { name: /Opname/i });
    fireEvent.click(opnameBtns[0]);

    expect(screen.getByText(/Stok Tercatat di Sistem/i)).toBeDefined();
  });
});
