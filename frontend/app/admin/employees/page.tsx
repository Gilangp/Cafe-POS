'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Phone, Mail } from 'lucide-react';

const employees = [
  { id: 1, name: 'Dewi Rahayu', role: 'Barista', branch: 'Sudirman', phone: '081234567890', email: 'dewi@velvra.id', status: 'active', shift: 'Pagi', joinDate: '2024-03-01', avatar: 'DR' },
  { id: 2, name: 'Bimo Santoso', role: 'Kitchen Staff', branch: 'Sudirman', phone: '081234567891', email: 'bimo@velvra.id', status: 'active', shift: 'Pagi', joinDate: '2024-04-15', avatar: 'BS' },
  { id: 3, name: 'Sari Wulandari', role: 'Branch Manager', branch: 'Sudirman', phone: '081234567892', email: 'sari@velvra.id', status: 'active', shift: 'Full', joinDate: '2024-01-10', avatar: 'SW' },
  { id: 4, name: 'Andi Pratama', role: 'Cashier', branch: 'Sudirman', phone: '081234567893', email: 'andi@velvra.id', status: 'active', shift: 'Siang', joinDate: '2024-05-20', avatar: 'AP' },
  { id: 5, name: 'Rina Kusuma', role: 'Barista', branch: 'Kemang', phone: '081234567894', email: 'rina@velvra.id', status: 'inactive', shift: 'Siang', joinDate: '2024-06-01', avatar: 'RK' },
  { id: 6, name: 'Fajar Nugroho', role: 'HR Manager', branch: 'All Cabang', phone: '081234567895', email: 'fajar@velvra.id', status: 'active', shift: 'Full', joinDate: '2024-02-15', avatar: 'FN' },
];

const roleColors: Record<string, string> = {
  'Branch Manager': 'bg-violet-100 text-violet-700',
  'HR Manager': 'bg-blue-100 text-blue-700',
  'Barista': 'bg-amber-100 text-amber-700',
  'Kitchen Staff': 'bg-orange-100 text-orange-700',
  'Cashier': 'bg-teal-100 text-teal-700',
};

const avatarColors = ['bg-[#BA935D]', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-orange-500'];

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );
  const active = employees.filter(e => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Manajemen Karyawan</h1>
          <p className="text-sm text-gray-500 mt-1">{active} aktif · {employees.length} total karyawan</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} /> Tambah Karyawan
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Karyawan', value: employees.length, color: 'bg-gray-800' },
          { label: 'Karyawan Aktif', value: active, color: 'bg-green-600' },
          { label: 'Shift Pagi', value: employees.filter(e => e.shift === 'Pagi').length, color: 'bg-amber-500' },
          { label: 'Shift Siang', value: employees.filter(e => e.shift === 'Siang').length, color: 'bg-blue-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white font-bold text-lg font-serif`}>{s.value}</div>
            <span className="text-sm font-semibold text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari karyawan atau jabatan..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none" />
      </div>

      {/* Employee Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp, i) => (
          <div key={emp.id} className={`rounded-2xl bg-white border-2 p-5 shadow-sm transition-all hover:shadow-md ${emp.status === 'active' ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${avatarColors[i % avatarColors.length]} text-white font-bold text-sm`}>
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{emp.name}</h3>
                  <span className={`shrink-0 text-[10px] font-bold rounded-full px-2 py-0.5 ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 mt-1 inline-block ${roleColors[emp.role] || 'bg-gray-100 text-gray-600'}`}>{emp.role}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><Phone size={12} className="text-gray-300" />{emp.phone}</div>
              <div className="flex items-center gap-2"><Mail size={12} className="text-gray-300" />{emp.email}</div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span>Cabang: <strong className="text-gray-700">{emp.branch}</strong></span>
                <span>Shift: <strong className="text-gray-700">{emp.shift}</strong></span>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
              <Edit2 size={12} /> Edit Profil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
