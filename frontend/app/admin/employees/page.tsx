'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  Users,
  Calendar,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  MapPin,
  FileText,
  Eye,
  X,
  History,
  AlertCircle,
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  role: string;
  branch: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  shift: string;
  joinDate: string;
  avatar: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Dewi Rahayu', role: 'Barista', branch: 'Sudirman Flagship', phone: '081234567890', email: 'dewi@velvra.id', status: 'active', shift: 'Pagi (07:00 - 15:00)', joinDate: '2024-03-01', avatar: 'DR' },
  { id: 2, name: 'Bimo Santoso', role: 'Kitchen Staff', branch: 'Sudirman Flagship', phone: '081234567891', email: 'bimo@velvra.id', status: 'active', shift: 'Pagi (07:00 - 15:00)', joinDate: '2024-04-15', avatar: 'BS' },
  { id: 3, name: 'Sari Wulandari', role: 'Branch Manager', branch: 'Sudirman Flagship', phone: '081234567892', email: 'sari@velvra.id', status: 'active', shift: 'Full (08:00 - 20:00)', joinDate: '2024-01-10', avatar: 'SW' },
  { id: 4, name: 'Andi Pratama', role: 'Cashier', branch: 'Sudirman Flagship', phone: '081234567893', email: 'andi@velvra.id', status: 'active', shift: 'Siang (14:00 - 22:00)', joinDate: '2024-05-20', avatar: 'AP' },
  { id: 5, name: 'Rina Kusuma', role: 'Barista', branch: 'Kemang Artisan Bar', phone: '081234567894', email: 'rina@velvra.id', status: 'active', shift: 'Siang (14:00 - 22:00)', joinDate: '2024-06-01', avatar: 'RK' },
  { id: 6, name: 'Fajar Nugroho', role: 'HR Manager', branch: 'All Cabang', phone: '081234567895', email: 'fajar@velvra.id', status: 'active', shift: 'Full (08:00 - 20:00)', joinDate: '2024-02-15', avatar: 'FN' },
];

const WEEK_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface ShiftSchedule {
  empId: number;
  day: string;
  shift: string;
}

const INITIAL_SHIFTS: ShiftSchedule[] = [
  { empId: 1, day: 'Senin', shift: 'Pagi (07:00 - 15:00)' },
  { empId: 1, day: 'Selasa', shift: 'Pagi (07:00 - 15:00)' },
  { empId: 1, day: 'Rabu', shift: 'Siang (14:00 - 22:00)' }, // Conflict overlap check!
  { empId: 2, day: 'Senin', shift: 'Pagi (07:00 - 15:00)' },
  { empId: 2, day: 'Selasa', shift: 'Siang (14:00 - 22:00)' },
  { empId: 4, day: 'Senin', shift: 'Siang (14:00 - 22:00)' },
  { empId: 4, day: 'Selasa', shift: 'Siang (14:00 - 22:00)' },
  { empId: 5, day: 'Senin', shift: 'Full (08:00 - 20:00)' },
];

interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OVERRIDE';
  module: string;
  actor: string;
  target: string;
  beforeJson: Record<string, any>;
  afterJson: Record<string, any>;
}

const AUDIT_LOGS_MOCK: AuditLog[] = [
  {
    id: 'LOG-9041',
    timestamp: '2026-07-14 14:15:22',
    action: 'OVERRIDE',
    module: 'MNU-003 Branch Price Override',
    actor: 'Sari Wulandari (Branch Manager)',
    target: 'Caramel Sea Salt Latte (Sudirman Flagship)',
    beforeJson: { price: 35000, status: 'active', branch_override: false },
    afterJson: { price: 38000, status: 'active', branch_override: true, override_reason: 'Premium Artisan Dairy Cost' },
  },
  {
    id: 'LOG-9038',
    timestamp: '2026-07-14 11:30:05',
    action: 'UPDATE',
    module: 'HR-002 Shift Assignment',
    actor: 'Fajar Nugroho (HR Manager)',
    target: 'Dewi Rahayu (Barista ID #1)',
    beforeJson: { day: 'Rabu', shift: 'Libur' },
    afterJson: { day: 'Rabu', shift: 'Siang (14:00 - 22:00)', assigned_by: 'HR Manager' },
  },
  {
    id: 'LOG-9025',
    timestamp: '2026-07-13 18:42:10',
    action: 'UPDATE',
    module: 'INV-005 Cycle Count Adjustment',
    actor: 'Bimo Santoso (Kitchen Staff)',
    target: 'Valrhona Cocoa Powder 70% (SKU-INV-004)',
    beforeJson: { stock_system: 8.5, stock_physical: 8.5, variance: 0 },
    afterJson: { stock_system: 8.5, stock_physical: 8.0, variance: -0.5, note: 'Spilled during rush hour' },
  },
  {
    id: 'LOG-9011',
    timestamp: '2026-07-13 09:12:44',
    action: 'CREATE',
    module: 'PRO-004 Voucher Verification',
    actor: 'Admin Center',
    target: 'Promo Code HAPPY17',
    beforeJson: {},
    afterJson: { code: 'HAPPY17', discount: 20000, min_spend: 100000, valid_until: '2026-08-31' },
  },
];

const roleColors: Record<string, string> = {
  'Branch Manager': 'bg-violet-100 text-violet-700 border-violet-200',
  'HR Manager': 'bg-blue-100 text-blue-700 border-blue-200',
  'Barista': 'bg-amber-100 text-amber-700 border-amber-200',
  'Kitchen Staff': 'bg-orange-100 text-orange-700 border-orange-200',
  'Cashier': 'bg-teal-100 text-teal-700 border-teal-200',
};

const avatarColors = ['bg-[#BA935D]', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-orange-500'];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'shifts' | 'audit'>('employees');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<ShiftSchedule[]>(INITIAL_SHIFTS);
  const [search, setSearch] = useState('');

  // Selected Log for JSON Diff Viewer (AUD-001)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // New employee form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Barista');
  const [newBranch, setNewBranch] = useState('Sudirman Flagship');
  const [newPhone, setNewPhone] = useState('');

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = employees.filter((e) => e.status === 'active').length;

  // HR-002 Schedule Conflict Check Logic
  // Conflict if 2 employees of the same role are assigned to overlapping hours without minimum spacing or double booking
  const detectScheduleConflicts = () => {
    const conflicts: { day: string; emp1Name: string; emp2Name: string; shift1: string; shift2: string }[] = [];

    WEEK_DAYS.forEach((day) => {
      const dayShifts = shifts.filter((s) => s.day === day);
      for (let i = 0; i < dayShifts.length; i++) {
        for (let j = i + 1; j < dayShifts.length; j++) {
          const s1 = dayShifts[i];
          const s2 = dayShifts[j];
          const e1 = employees.find((e) => e.id === s1.empId);
          const e2 = employees.find((e) => e.id === s2.empId);

          if (e1 && e2 && e1.branch === e2.branch && e1.role === e2.role) {
            if (s1.shift.includes('Full') || s2.shift.includes('Full') || s1.shift === s2.shift) {
              conflicts.push({
                day,
                emp1Name: e1.name,
                emp2Name: e2.name,
                shift1: s1.shift,
                shift2: s2.shift,
              });
            }
          }
        }
      }
    });

    return conflicts;
  };

  const currentConflicts = detectScheduleConflicts();

  const handleAssignShift = (empId: number, day: string, shift: string) => {
    setShifts((prev) => {
      const filtered = prev.filter((s) => !(s.empId === empId && s.day === day));
      if (shift === 'Libur') return filtered;
      return [...filtered, { empId, day, shift }];
    });
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    const newEmp: Employee = {
      id: employees.length + 1,
      name: newName,
      role: newRole,
      branch: newBranch,
      phone: newPhone,
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@velvra.id`,
      status: 'active',
      shift: 'Pagi (07:00 - 15:00)',
      joinDate: new Date().toISOString().slice(0, 10),
      avatar: newName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
    };
    setEmployees([...employees, newEmp]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Manajemen SDM & Log Audit</h1>
            <span className="rounded-full bg-[#BA935D]/15 px-3 py-1 text-xs font-bold text-[#BA935D] border border-[#BA935D]/30">
              Phase F4 & F5 Verified
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} staf aktif · Penjadwalan interaktif (`HR-002`) & Riwayat Log Audit (`AUD-001`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'employees' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-hide">
        {[
          { id: 'employees', label: '1. Daftar Staf & Profil', icon: Users, count: employees.length },
          { id: 'shifts', label: '2. Penjadwalan Shift (HR-002)', icon: Calendar, badge: currentConflicts.length > 0 ? `${currentConflicts.length} Konflik` : null },
          { id: 'audit', label: '3. Audit Logs Explorer (AUD-001)', icon: History, count: AUDIT_LOGS_MOCK.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-[#12100E] text-[#BA935D] shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
            }`}
          >
            <t.icon size={17} />
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === t.id ? 'bg-[#BA935D] text-[#12100E]' : 'bg-gray-100 text-gray-600'}`}>
                {t.count}
              </span>
            )}
            {t.badge && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Karyawan', value: employees.length, color: 'bg-gray-800' },
              { label: 'Karyawan Aktif', value: activeCount, color: 'bg-green-600' },
              { label: 'Cabang Sudirman', value: employees.filter((e) => e.branch.includes('Sudirman')).length, color: 'bg-amber-500' },
              { label: 'Cabang Kemang', value: employees.filter((e) => e.branch.includes('Kemang')).length, color: 'bg-blue-500' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color} text-white font-bold text-lg font-serif shrink-0`}>
                  {s.value}
                </div>
                <span className="text-xs font-bold text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau jabatan staf..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none"
            />
          </div>

          {/* Employee Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp, i) => (
              <div
                key={emp.id}
                className={`rounded-3xl bg-white border-2 p-6 shadow-sm transition-all hover:shadow-md ${
                  emp.status === 'active' ? 'border-gray-100 hover:border-[#BA935D]/50' : 'border-dashed border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${avatarColors[i % avatarColors.length]} text-white font-bold text-base shadow-sm`}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-gray-800 text-base truncate">{emp.name}</h3>
                      <span className={`shrink-0 text-[10px] font-bold rounded-full px-2.5 py-0.5 ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <span className={`text-xs font-bold rounded-full px-3 py-0.5 mt-1 inline-block border ${roleColors[emp.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {emp.role}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Phone size={13} className="text-[#BA935D] shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium truncate">
                    <Mail size={13} className="text-[#BA935D] shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" /> <strong className="text-gray-700">{emp.branch}</strong>
                    </span>
                    <span>
                      Bergabung: <strong className="text-gray-700">{emp.joinDate}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('shifts')}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#FAF6F0] border border-[#BA935D]/40 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#12100E] hover:text-[#BA935D] transition-all"
                >
                  <Calendar size={14} /> Atur Jadwal Shift (`HR-002`)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HR-002 SHIFT SCHEDULING & CONFLICT DETECTION */}
      {activeTab === 'shifts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* HR-002 Schedule Conflict Banner */}
          {currentConflicts.length > 0 ? (
            <div className="rounded-3xl bg-red-600 text-white p-6 shadow-xl border-2 border-red-400 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white animate-bounce">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xl text-white">HR-002 Schedule Conflict Alert</span>
                    <span className="rounded-full bg-white text-red-600 font-bold px-2.5 py-0.5 text-xs uppercase tracking-wider">
                      Terdeteksi {currentConflicts.length} Bentrokan
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-1 leading-relaxed">
                    Perhatian: Sistem mendeteksi adanya karyawan pada cabang dan peran yang sama dijadwalkan secara bertumpuk tanpa jeda atau kapasitas melebihi batas standar.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-white/20 text-xs">
                {currentConflicts.map((c, idx) => (
                  <div key={idx} className="rounded-xl bg-white/10 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-amber-200">Hari {c.day}</p>
                      <p className="text-white">
                        {c.emp1Name} vs {c.emp2Name}
                      </p>
                    </div>
                    <span className="rounded bg-red-800/80 px-2 py-1 text-[10px] font-mono font-bold">
                      {c.shift1} / {c.shift2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-emerald-50 border border-emerald-300 p-5 text-sm font-bold text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} className="text-emerald-600" />
                <span>✓ Status HR-002: Jadwal mingguan optimal tanpa konflik atau tumpang tindih shift di semua cabang.</span>
              </div>
              <span className="text-xs uppercase bg-emerald-200/80 px-3 py-1 rounded-full">Schedule Valid</span>
            </div>
          )}

          {/* Interactive Weekly Shift Matrix */}
          <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FAF6F0] gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-[#BA935D]" size={20} />
                  <span>Matriks Penjadwalan Mingguan (`HR-002`)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Klik dropdown pada sel hari untuk mengubah jam shift secara interaktif</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Pagi (07-15)
                </span>
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Siang (14-22)
                </span>
                <span className="flex items-center gap-1.5 text-violet-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Full (08-20)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <th className="p-4 pl-6 min-w-[200px]">Staf / Barista</th>
                    {WEEK_DAYS.map((day) => (
                      <th key={day} className="p-4 text-center min-w-[140px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#BA935D] text-white font-bold text-xs">
                            {emp.avatar}
                          </span>
                          <div>
                            <p className="font-bold text-gray-800">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{emp.role} · {emp.branch.split(' ')[0]}</p>
                          </div>
                        </div>
                      </td>

                      {WEEK_DAYS.map((day) => {
                        const assigned = shifts.find((s) => s.empId === emp.id && s.day === day);
                        const shiftVal = assigned ? assigned.shift : 'Libur';
                        const isConflict = currentConflicts.some((c) => c.day === day && (c.emp1Name === emp.name || c.emp2Name === emp.name));

                        return (
                          <td key={day} className="p-3 text-center">
                            <select
                              value={shiftVal}
                              onChange={(e) => handleAssignShift(emp.id, day, e.target.value)}
                              className={`w-full appearance-none rounded-xl border p-2 text-[11px] font-bold text-center cursor-pointer transition-all ${
                                isConflict
                                  ? 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-300 animate-pulse'
                                  : shiftVal.includes('Pagi')
                                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-400'
                                  : shiftVal.includes('Siang')
                                  ? 'bg-blue-50 border-blue-300 text-blue-800 hover:border-blue-400'
                                  : shiftVal.includes('Full')
                                  ? 'bg-violet-50 border-violet-300 text-violet-800 hover:border-violet-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 font-normal'
                              }`}
                            >
                              <option value="Libur">Libur (Off)</option>
                              <option value="Pagi (07:00 - 15:00)">Pagi (07:00 - 15:00)</option>
                              <option value="Siang (14:00 - 22:00)">Siang (14:00 - 22:00)</option>
                              <option value="Full (08:00 - 20:00)">Full (08:00 - 20:00)</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUD-001 AUDIT LOGS EXPLORER */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#12100E] text-white p-6 border-2 border-[#BA935D] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#BA935D]/20 text-[#BA935D]">
                <FileText size={26} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#BA935D]">AUD-001 Compliance Guard</span>
                <h2 className="font-serif text-2xl font-bold text-white tracking-wide mt-0.5">Audit & Activity Logs Explorer</h2>
                <p className="text-xs text-white/70">
                  Melacak seluruh perubahan sensitif (Create, Update, Delete, Override) pada database dan konfigurasi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10 shrink-0">
              <ShieldAlert size={16} className="text-amber-400" />
              <span>Immutable System Audit Trail</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-gray-800">Daftar Aktivitas Sistem Terverifikasi</h3>
              <span className="text-xs text-gray-400 font-semibold">{AUDIT_LOGS_MOCK.length} aktivitas tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="p-4 pl-6">Log ID & Waktu</th>
                    <th className="p-4">Modul / Aksi</th>
                    <th className="p-4">Aktor / Staf</th>
                    <th className="p-4">Target Objek</th>
                    <th className="p-4 text-right pr-6">Detail JSON Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {AUDIT_LOGS_MOCK.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-mono font-bold text-gray-800">{log.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {log.timestamp}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              log.action === 'CREATE'
                                ? 'bg-green-100 text-green-700'
                                : log.action === 'UPDATE'
                                ? 'bg-blue-100 text-blue-700'
                                : log.action === 'OVERRIDE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-semibold text-gray-700">{log.module}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">{log.actor}</td>
                      <td className="p-4 text-gray-600 font-medium">{log.target}</td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#12100E] px-4 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] transition-all shadow-sm active:scale-95"
                        >
                          <Eye size={13} /> Lihat Before/After Diff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUD-001 BEFORE/AFTER JSON DIFF VIEWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FAF6F0]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BA935D]/20 text-[#BA935D]">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-800">
                    AUD-001 Diff Viewer · <span className="font-mono text-[#BA935D]">{selectedLog.id}</span>
                  </h3>
                  <p className="text-xs text-gray-500">{selectedLog.module} · {selectedLog.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-gray-400 uppercase font-semibold">Aktor Pengubah</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedLog.actor}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase font-semibold">Target Objek</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedLog.target}</p>
                </div>
              </div>

              {/* Before vs After JSON Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Sebelum Perubahan (Before JSON)</span>
                  </div>
                  <pre className="rounded-2xl bg-[#12100E] text-red-300 p-4 font-mono text-[11px] overflow-x-auto border border-red-500/30 leading-relaxed">
                    {JSON.stringify(selectedLog.beforeJson, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Sesudah Perubahan (After JSON)</span>
                  </div>
                  <pre className="rounded-2xl bg-[#12100E] text-green-300 p-4 font-mono text-[11px] overflow-x-auto border border-green-500/30 leading-relaxed">
                    {JSON.stringify(selectedLog.afterJson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl bg-[#12100E] px-8 py-3 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] transition-all"
              >
                Tutup Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-gray-800">Tambah Staf Karyawan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rina Kusuma"
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Peran / Jabatan *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                >
                  <option value="Barista">Barista</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Kitchen Staff">Kitchen Staff</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="HR Manager">HR Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Cabang *</label>
                <select
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                >
                  <option value="Sudirman Flagship">Sudirman Flagship</option>
                  <option value="Kemang Artisan Bar">Kemang Artisan Bar</option>
                  <option value="Senayan City Lounge">Senayan City Lounge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nomor Telepon / WhatsApp *</label>
                <input
                  required
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#12100E] px-6 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] shadow-md"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
