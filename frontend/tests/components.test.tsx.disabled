import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Coffee } from 'lucide-react';
import { StatCard } from '@/features/dashboard/admin/stat-card';

describe('StatCard', () => {
  it('renders title value change and positive trend', () => {
    render(
      <StatCard
        title="Penjualan"
        value="Rp 2.4jt"
        change="12%"
        positive
        icon={Coffee}
        color="bg-amber-500"
      />
    );

    expect(screen.getByText('Penjualan')).toBeDefined();
    expect(screen.getByText('Rp 2.4jt')).toBeDefined();
    expect(screen.getByText(/12%/)).toBeDefined();
    expect(screen.getByText(/vs kemarin/)).toBeDefined();
    expect(screen.getByText(/▲/)).toBeDefined();
  });

  it('renders negative trend marker', () => {
    render(
      <StatCard
        title="Order"
        value="48"
        change="5%"
        positive={false}
        icon={Coffee}
        color="bg-red-500"
      />
    );

    expect(screen.getByText(/▼/)).toBeDefined();
    expect(screen.getByText('Order')).toBeDefined();
  });
});
