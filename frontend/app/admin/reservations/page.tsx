'use client';

import { useState } from 'react';
import { CalendarCheck, Users, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

const reservations = [
  { id: 1, name: 'Rina Mahardika', phone: '081234567890', date: '14 Jul 2026', time: '19.00', guests: 4, table: 'Meja 5', status: 'confirmed', notes: 'Anniversary dinner' },
  { id: 2, name: 'David Chen', phone: '081234567891', date: '14 Jul 2026', time: '20.00', guests: 2, table: 'Meja 2', status: 'confirmed', notes: '' },
  { id: 3, name: 'Anisa Putri', phone: '081234567892', date: '15 Jul 2026', time: '10.00', guests: 6, table: 'Meja 7', status: 'pending', notes: 'Work meeting, butuh colokan' },
  { id: 4, name: 'Budi Santoso', phone: '081234567893', date: '15 Jul 2026', time: '12.00', guests: 3, table: 'Meja 3', status: 'confirmed', notes: '' },
  { id: 5, name: 'Sari Wulandari', phone: '081234567894', date: '13 Jul 2026', time: '18.00', guests: 2, table: 'Meja 1', status: 'cancelled', notes: '' },
];

const tables = [
  { id: 1, name: 'Meja 1', capacity: 2, status: 'available' },
  { id: 2, name: 'Meja 2', capacity: 2, status: 'occupied' },
  { id: 3, name: 'Meja 3', capacity: 4, status: 'reserved' },
  { id: 4, name: 'Meja 4', capacity: 4, status: 'available' },
  { id: 5, name: 'Meja 5', capacity: 6, status: 'reserved' },
  { id: 6, name: 'Meja 6', capacity: 4, status: 'available' },
  { id: 7, name: 'Meja 7', capacity: 8, status: 'available' },
  { id: 8, name: 'Private Room', capacity: 12, status: 'available' },
];

const tableStatusStyle: Record<string, string> = {
  available: 'bg-green-100 border-green-300 text-green-700',
  occupied: 'bg-red-100 border-red-300 text-red-700',
  reserved: 'bg-amber-100 border-amber-300 text-amber-700',
};

const statusStyle: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-500',
};

const statusLabel: Record<string, string> = {
  confirmed: 'Konfirmasi', pending: 'Menunggu', cancelled: 'Dibatalkan',
};

export default function ReservationsPage() {
  const [view, setView] = useState<'list' | 'floor'>('list');
  const active = reservations.filter(r => r.status !== 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Reservasi & Meja</h1>
          <p className="text-sm text-gray-500 mt-1">{active.length} reservasi aktif hari ini</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
            {(['list', 'floor'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition-all ${view === v ? 'bg-[#12100E] text-[#BA935D]' : 'text-gray-500'}`}>
                {v === 'list' ? 'Daftar' : 'Denah Meja'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
            <Plus size={16} /> Buat Reservasi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Reservasi', value: reservations.length, icon: CalendarCheck, color: 'bg-[#BA935D]' },
          { label: 'Tamu Hari Ini', value: active.reduce((s, r) => s + r.guests, 0), icon: Users, color: 'bg-blue-500' },
          { label: 'Menunggu Konfirmasi', value: reservations.filter(r => r.status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
          { label: 'Meja Tersedia', value: tables.filter(t => t.status === 'available').length, icon: CheckCircle, color: 'bg-green-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 font-serif">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {view === 'list' ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Tamu</th>
                  <th className="px-6 py-4">Tgl & Waktu</th>
                  <th className="px-6 py-4">Tamu</th>
                  <th className="px-6 py-4">Meja</th>
                  <th className="px-6 py-4">Catatan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.date} · {r.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Users size={13} className="text-gray-400" /> {r.guests} orang
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{r.table}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[140px] truncate">{r.notes || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[r.status]}`}>{statusLabel[r.status]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        {r.status === 'pending' && (
                          <button className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-2.5 py-1.5 text-[11px] font-bold text-green-700 hover:bg-green-100 transition-all">
                            <CheckCircle size={11} /> Konfirmasi
                          </button>
                        )}
                        {r.status !== 'cancelled' && (
                          <button className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-100 transition-all">
                            <XCircle size={11} /> Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-4">Denah Meja — Sudirman Flagship</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tables.map(table => (
              <div key={table.id} className={`rounded-2xl border-2 p-5 text-center transition-all ${tableStatusStyle[table.status]}`}>
                <p className="font-serif text-lg font-bold">{table.name}</p>
                <p className="text-xs mt-1 font-semibold"><Users size={10} className="inline mr-1" />{table.capacity} kursi</p>
                <span className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {table.status === 'available' ? 'Tersedia' : table.status === 'occupied' ? 'Terisi' : 'Reservasi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
