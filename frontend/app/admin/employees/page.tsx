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
  Clock,
  MapPin,
  FileText,
  Eye,
  X,
  History,
  Check,
  UserCheck,
  UserX,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  roles: string[]; // 10.2 Multi-Role support (e.g. ['Cashier', 'Barista'])
  branch: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  shift: string;
  joinDate: string;
  avatar: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Dewi Rahayu', roles: ['Barista', 'Cashier'], branch: 'Sudirman Flagship', phone: '0812-3456-7890', email: 'dewi@velvra.id', status: 'active', shift: 'Pagi (07:00 - 15:00)', joinDate: '2024-03-01', avatar: 'DR' },
  { id: 2, name: 'Bimo Santoso', roles: ['Kitchen Staff'], branch: 'Sudirman Flagship', phone: '0812-3456-7891', email: 'bimo@velvra.id', status: 'active', shift: 'Pagi (07:00 - 15:00)', joinDate: '2024-04-15', avatar: 'BS' },
  { id: 3, name: 'Sari Wulandari', roles: ['Branch Manager', 'Admin'], branch: 'Sudirman Flagship', phone: '0812-3456-7892', email: 'sari@velvra.id', status: 'active', shift: 'Full (08:00 - 20:00)', joinDate: '2024-01-10', avatar: 'SW' },
  { id: 4, name: 'Andi Pratama', roles: ['Cashier', 'Kitchen Staff'], branch: 'Sudirman Flagship', phone: '0812-3456-7893', email: 'andi@velvra.id', status: 'active', shift: 'Siang (14:00 - 22:00)', joinDate: '2024-05-20', avatar: 'AP' },
  { id: 5, name: 'Rina Kusuma', roles: ['Barista'], branch: 'Kemang Artisan Bar', phone: '0812-3456-7894', email: 'rina@velvra.id', status: 'inactive', shift: 'Siang (14:00 - 22:00)', joinDate: '2024-06-01', avatar: 'RK' },
  { id: 6, name: 'Fajar Nugroho', roles: ['HR Manager', 'Owner'], branch: 'All Cabang', phone: '0812-3456-7895', email: 'fajar@velvra.id', status: 'active', shift: 'Full (08:00 - 20:00)', joinDate: '2024-02-15', avatar: 'FN' },
];

const AVAILABLE_ROLES = ['Barista', 'Cashier', 'Kitchen Staff', 'Branch Manager', 'Admin', 'HR Manager', 'Owner'];

const WEEK_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface ShiftSchedule {
  empId: number;
  day: string;
  shift: string;
}

const INITIAL_SHIFTS: ShiftSchedule[] = [
  { empId: 1, day: 'Senin', shift: 'Pagi (07:00 - 15:00)' },
  { empId: 1, day: 'Selasa', shift: 'Pagi (07:00 - 15:00)' },
  { empId: 1, day: 'Rabu', shift: 'Siang (14:00 - 22:00)' },
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

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-10042',
    timestamp: '17 Jul 2026 14:45:10',
    action: 'UPDATE',
    module: 'USR-002 Multi-Role RBAC Scope',
    actor: 'Sari Wulandari (Branch Manager)',
    target: 'Andi Pratama (#ID-4)',
    beforeJson: { roles: ['Cashier'], status: 'active' },
    afterJson: { roles: ['Cashier', 'Kitchen Staff'], status: 'active', notes: 'Peran ganda shift sibuk' },
  },
  {
    id: 'LOG-10041',
    timestamp: '17 Jul 2026 14:15:22',
    action: 'OVERRIDE',
    module: 'MNU-003 Branch Price Override',
    actor: 'Sari Wulandari (Branch Manager)',
    target: 'Caramel Sea Salt Latte (Sudirman Flagship)',
    beforeJson: { price: 35000, status: 'active', branch_override: false },
    afterJson: { price: 38000, status: 'active', branch_override: true, override_reason: 'Premium Artisan Dairy Cost' },
  },
  {
    id: 'LOG-10038',
    timestamp: '17 Jul 2026 11:30:05',
    action: 'UPDATE',
    module: 'HR-002 Shift Assignment',
    actor: 'Fajar Nugroho (HR Manager)',
    target: 'Dewi Rahayu (Barista ID #1)',
    beforeJson: { day: 'Rabu', shift: 'Libur' },
    afterJson: { day: 'Rabu', shift: 'Siang (14:00 - 22:00)', assigned_by: 'HR Manager' },
  },
  {
    id: 'LOG-10025',
    timestamp: '16 Jul 2026 18:42:10',
    action: 'UPDATE',
    module: 'INV-005 Cycle Count Adjustment',
    actor: 'Bimo Santoso (Kitchen Staff)',
    target: 'Valrhona Cocoa Powder 70% (SKU-INV-004)',
    beforeJson: { stock_system: 8.5, stock_physical: 8.5, variance: 0 },
    afterJson: { stock_system: 8.5, stock_physical: 8.0, variance: -0.5, note: 'Spilled during rush hour' },
  },
  {
    id: 'LOG-10011',
    timestamp: '16 Jul 2026 09:12:44',
    action: 'CREATE',
    module: 'PRO-004 Voucher Verification',
    actor: 'Admin Center',
    target: 'Promo Code HAPPY17',
    beforeJson: {},
    afterJson: { code: 'HAPPY17', discount: 20000, min_spend: 100000, valid_until: '2026-08-31' },
  },
];

const roleColors: Record<string, string> = {
  'Branch Manager': 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30',
  'HR Manager': 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  'Barista': 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  'Kitchen Staff': 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
  'Cashier': 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30',
  'Admin': 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  'Owner': 'bg-[#1E3D31] text-[#C89B5C] border-[#C89B5C]/40',
};

const avatarColors = ['bg-[#1E3D31] text-[#C89B5C]', 'bg-blue-600 text-white', 'bg-violet-600 text-white', 'bg-teal-600 text-white', 'bg-rose-600 text-white', 'bg-orange-600 text-white'];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'shifts' | 'audit'>('employees');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<ShiftSchedule[]>(INITIAL_SHIFTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // 10.3 Audit Log Filter
  const [logFilterAction, setLogFilterAction] = useState('ALL');

  // Selected Log for JSON Diff Viewer (AUD-001)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // 10.2 Add/Edit Employee Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formRoles, setFormRoles] = useState<string[]>(['Barista']);
  const [formBranch, setFormBranch] = useState('Sudirman Flagship');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const showNotification = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 3800);
  };

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.roles.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  );
  const activeCount = employees.filter((e) => e.status === 'active').length;

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase());
    const matchAction = logFilterAction === 'ALL' || log.action === logFilterAction;
    return matchSearch && matchAction;
  });

  // HR-002 Schedule Conflict Check
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

          if (e1 && e2 && e1.branch === e2.branch && e1.roles[0] === e2.roles[0]) {
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
    showNotification(`✓ Jadwal shift hari ${day} diperbarui!`);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormRoles(['Barista']);
    setFormBranch('Sudirman Flagship');
    setFormPhone('0812-');
    setFormStatus('active');
    setShowModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingId(emp.id);
    setFormName(emp.name);
    setFormRoles(emp.roles);
    setFormBranch(emp.branch);
    setFormPhone(emp.phone);
    setFormStatus(emp.status);
    setShowModal(true);
  };

  const toggleRoleSelection = (role: string) => {
    if (formRoles.includes(role)) {
      if (formRoles.length === 1) return; // Must keep at least 1 role
      setFormRoles(formRoles.filter((r) => r !== role));
    } else {
      setFormRoles([...formRoles, role]);
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formRoles.length === 0) return;

    if (editingId !== null) {
      // Update existing
      const oldEmp = employees.find((e) => e.id === editingId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingId
            ? { ...emp, name: formName, roles: formRoles, branch: formBranch, phone: formPhone, status: formStatus }
            : emp
        )
      );

      // Record Audit Log (10.3)
      if (oldEmp) {
        const newLog: AuditLog = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('id-ID'),
          action: 'UPDATE',
          module: 'USR-002 Multi-Role RBAC Management',
          actor: 'Sari Wulandari (Branch Manager / Owner)',
          target: `${formName} (#ID-${editingId})`,
          beforeJson: { roles: oldEmp.roles, status: oldEmp.status, branch: oldEmp.branch },
          afterJson: { roles: formRoles, status: formStatus, branch: formBranch },
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      }

      showNotification(`✓ Data & peran ganda untuk "${formName}" berhasil diperbarui!`);
    } else {
      // Create new
      const newEmp: Employee = {
        id: Date.now(),
        name: formName,
        roles: formRoles,
        branch: formBranch,
        phone: formPhone,
        email: `${formName.toLowerCase().replace(/\s+/g, '.')}@velvra.id`,
        status: formStatus,
        shift: 'Pagi (07:00 - 15:00)',
        joinDate: new Date().toISOString().slice(0, 10),
        avatar: formName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      };
      setEmployees((prev) => [newEmp, ...prev]);

      // Record Audit Log
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        action: 'CREATE',
        module: 'USR-001 Create Internal User Account',
        actor: 'Sari Wulandari (Branch Manager / Owner)',
        target: `${formName} (${formRoles.join(', ')})`,
        beforeJson: {},
        afterJson: { name: formName, roles: formRoles, branch: formBranch, status: formStatus },
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showNotification(`✓ Akun karyawan baru "${formName}" dengan multi-role [${formRoles.join(', ')}] berhasil dibuat!`);
    }

    setShowModal(false);
  };

  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: nextStatus } : e))
    );

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      action: 'UPDATE',
      module: 'USR-003 Account Status Toggle',
      actor: 'Admin Roastery (Fase 10.2)',
      target: `${emp.name} (#ID-${emp.id})`,
      beforeJson: { status: emp.status },
      afterJson: { status: nextStatus, timestamp: new Date().toISOString() },
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showNotification(`✓ Akun ${emp.name} diubah menjadi ${nextStatus === 'active' ? 'Aktif' : 'Nonaktif (Diberhentikan / Cut off)'}`);
  };

  return (
    <div className="space-y-6 pb-12 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Manajemen User, Multi-Role & Audit Log (10.2 / 10.3)
            </h1>
            <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
              Phase 10 Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Kelola akun user internal (Kasir, Admin, Dapur/Barista) dengan hak akses peran ganda (Multi-Role RBAC Scope) dan pantau jejak audit log keamanan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'employees' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-all shadow-md active:scale-95 shrink-0"
            >
              <Plus size={16} /> Tambah Akun User Baru (10.2)
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionAlert && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 border-b border-gray-100 dark:border-white/10 scrollbar-hide">
        {[
          { id: 'employees', label: '1. Daftar Staf & Peran Ganda (10.2)', icon: Users, count: employees.length },
          { id: 'shifts', label: '2. Penjadwalan Shift (HR-002)', icon: Calendar, badge: currentConflicts.length > 0 ? `${currentConflicts.length} Konflik` : null },
          { id: 'audit', label: '3. Audit Log & Keamanan Sistem (10.3)', icon: History, count: auditLogs.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md border border-[#C89B5C]/30'
                : 'bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
            }`}
          >
            <t.icon size={17} />
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-extrabold ${activeTab === t.id ? 'bg-[#C89B5C] text-[#1E3D31]' : 'bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-300'}`}>
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

      {/* TAB 1: EMPLOYEES DIRECTORY & MULTI-ROLE (10.2) */}
      {activeTab === 'employees' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total User Akun', value: employees.length, color: 'bg-[#1E3D31] text-[#C89B5C]' },
              { label: 'Akun Staf Aktif', value: activeCount, color: 'bg-emerald-600 text-white' },
              { label: 'Akun Nonaktif / Non-Aktif', value: employees.length - activeCount, color: 'bg-gray-500 text-white' },
              { label: 'User Multi-Role Ganda', value: employees.filter((e) => e.roles.length > 1).length, color: 'bg-blue-600 text-white' },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.color} font-bold text-xl font-heading shadow-sm`}>
                  {s.value}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama staf atau peran jabatan..."
              className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
            />
          </div>

          {/* Employee Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp, i) => (
              <div
                key={emp.id}
                className={`rounded-3xl bg-white dark:bg-[#1A2620] border-2 p-6 shadow-sm transition-all flex flex-col justify-between ${
                  emp.status === 'active' ? 'border-gray-200 dark:border-white/10 hover:border-[#C89B5C]' : 'border-dashed border-gray-300 dark:border-white/15 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${avatarColors[i % avatarColors.length]} font-extrabold text-base shadow-sm font-heading`}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading font-extrabold text-gray-900 dark:text-white text-base truncate">{emp.name}</h3>
                        <span className={`shrink-0 text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${emp.status === 'active' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-500/15 border-gray-500/30 text-gray-500 dark:text-gray-400'}`}>
                          {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      
                      {/* 10.2 Multi-Role Badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {emp.roles.map((role) => (
                          <span
                            key={role}
                            className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${roleColors[role] || 'bg-gray-100 dark:bg-black/40 text-gray-600 border-gray-200'}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-white/10 pt-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#C89B5C] shrink-0" />
                      <span className="font-mono">{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-[#C89B5C] shrink-0" />
                      <span className="truncate font-mono">{emp.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" /> <strong className="text-gray-900 dark:text-white">{emp.branch}</strong>
                      </span>
                      <span>
                        Join: <strong className="font-mono">{emp.joinDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 10.2 Account Actions */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-[#C89B5C] hover:text-white py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
                  >
                    <Edit2 size={13} />
                    <span>Edit Peran Ganda</span>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(emp)}
                    className={`flex items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-bold transition-all active:scale-95 ${
                      emp.status === 'active'
                        ? 'border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {emp.status === 'active' ? (
                      <>
                        <UserX size={13} /> Nonaktifkan
                      </>
                    ) : (
                      <>
                        <UserCheck size={13} /> Aktifkan Akun
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HR-002 SHIFT SCHEDULING & CONFLICT DETECTION */}
      {activeTab === 'shifts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {currentConflicts.length > 0 ? (
            <div className="rounded-3xl bg-red-600 text-white p-6 shadow-xl border-2 border-red-400 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white animate-bounce shadow-sm">
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-lg sm:text-xl text-white">HR-002 Schedule Conflict Alert</span>
                    <span className="rounded-full bg-white text-red-600 font-extrabold px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
                      Terdeteksi {currentConflicts.length} Bentrokan
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-1 leading-relaxed">
                    Perhatian: Sistem mendeteksi adanya karyawan pada cabang dan peran yang sama dijadwalkan bertumpuk tanpa jeda atau kapasitas shift berlebih.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-white/20 text-xs">
                {currentConflicts.map((c, idx) => (
                  <div key={idx} className="rounded-2xl bg-white/10 p-3 flex items-center justify-between font-medium">
                    <div>
                      <p className="font-extrabold text-amber-200">Hari {c.day}</p>
                      <p className="text-white">
                        {c.emp1Name} vs {c.emp2Name}
                      </p>
                    </div>
                    <span className="rounded-lg bg-red-800/80 px-2.5 py-1 text-[10px] font-mono font-bold">
                      {c.shift1} / {c.shift2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-emerald-500/15 border border-emerald-500/30 p-5 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
                <span>✓ Status HR-002: Jadwal mingguan optimal tanpa konflik atau tumpang tindih shift.</span>
              </div>
              <span className="text-xs uppercase bg-emerald-500/20 px-3 py-1 rounded-full font-extrabold">Schedule Valid</span>
            </div>
          )}

          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-[#FAF3E7] dark:bg-black/30 gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="text-[#C89B5C]" size={20} />
                  <span>Matriks Penjadwalan Mingguan (`HR-002`)</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Klik dropdown pada sel hari untuk mengubah jam shift secara interaktif</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Pagi (07-15)
                </span>
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Siang (14-22)
                </span>
                <span className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Full (08-20)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black/30 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                    <th className="p-4 pl-6 min-w-[200px]">Staf / Barista</th>
                    {WEEK_DAYS.map((day) => (
                      <th key={day} className="p-4 text-center min-w-[145px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3D31] text-[#C89B5C] font-extrabold text-xs shadow-sm">
                            {emp.avatar}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-[10px] text-[#C89B5C] font-extrabold">{emp.roles.join(' · ')}</p>
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
                              className={`w-full appearance-none rounded-xl border p-2.5 text-[11px] font-bold text-center cursor-pointer transition-all ${
                                isConflict
                                  ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-300 animate-pulse'
                                  : shiftVal.includes('Pagi')
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:border-amber-400'
                                  : shiftVal.includes('Siang')
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300 hover:border-blue-400'
                                  : shiftVal.includes('Full')
                                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-800 dark:text-violet-300 hover:border-violet-400'
                                  : 'bg-gray-100 dark:bg-black/35 border-gray-200 dark:border-white/15 text-gray-500 dark:text-gray-400 font-normal'
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

      {/* TAB 3: AUDIT LOGS EXPLORER & SECURITY (10.3) */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-[#1E3D31] text-white p-6 sm:p-8 border-2 border-[#C89B5C]/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C89B5C] text-[#1E3D31] shadow-md">
                <FileText size={28} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89B5C]">AUD-001 Compliance Guard & Security</span>
                <h2 className="font-heading text-2xl font-extrabold text-white tracking-wide mt-0.5">Audit & Activity Logs Explorer (10.3)</h2>
                <p className="text-xs text-white/80 leading-relaxed">
                  Melacak seluruh riwayat perubahan sensitif (Create, Update, Delete, Override) pada database internal secara terperinci dan immutable.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 shrink-0">
              <ShieldCheck size={18} className="text-[#C89B5C]" />
              <span>Immutable System Audit Trail</span>
            </div>
          </div>

          {/* Audit Log Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari target, modul, atau aktor pengubah..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
              {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'OVERRIDE'].map((act) => (
                <button
                  key={act}
                  onClick={() => setLogFilterAction(act)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    logFilterAction === act ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
                  }`}
                >
                  {act === 'ALL' ? 'Semua Aksi' : act}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Daftar Riwayat Aktivitas Sistem ({filteredAuditLogs.length})</h3>
              <span className="text-xs text-[#C89B5C] font-mono font-extrabold">Live Security Audit</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black/30 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                    <th className="p-4 pl-6">Log ID & Timestamp</th>
                    <th className="p-4">Modul / Aksi (10.3)</th>
                    <th className="p-4">Aktor / Staf</th>
                    <th className="p-4">Target Objek</th>
                    <th className="p-4 text-right pr-6">Before/After JSON Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6 whitespace-nowrap">
                        <p className="font-mono font-extrabold text-gray-900 dark:text-white">{log.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono flex items-center gap-1">
                          <Clock size={11} /> {log.timestamp}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase shrink-0 font-mono ${
                              log.action === 'CREATE'
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                                : log.action === 'UPDATE'
                                ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30'
                                : log.action === 'OVERRIDE'
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{log.module}</span>
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-gray-900 dark:text-white">{log.actor}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 font-medium max-w-xs truncate">{log.target}</td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3D31] px-4 py-2 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-sm transition-all active:scale-95"
                        >
                          <Eye size={13} />
                          <span>Diff Viewer</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1A2620] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-gray-200 dark:border-white/15">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-[#FAF3E7] dark:bg-black/40">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C]">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                    AUD-001 Diff Viewer · <span className="font-mono text-[#C89B5C]">{selectedLog.id}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedLog.module} · {selectedLog.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 dark:bg-black/35 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Aktor Pengubah</p>
                  <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{selectedLog.actor}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase font-bold text-[10px]">Target Objek</p>
                  <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{selectedLog.target}</p>
                </div>
              </div>

              {/* Before vs After JSON Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 bg-red-500/15 px-3 py-1.5 rounded-xl border border-red-500/30">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Sebelum Perubahan (Before JSON)</span>
                  </div>
                  <pre className="rounded-2xl bg-[#0E0C0A] text-red-300 p-4 font-mono text-[11px] overflow-x-auto border border-red-500/30 leading-relaxed">
                    {JSON.stringify(selectedLog.beforeJson, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Sesudah Perubahan (After JSON)</span>
                  </div>
                  <pre className="rounded-2xl bg-[#0E0C0A] text-emerald-300 p-4 font-mono text-[11px] overflow-x-auto border border-emerald-500/30 leading-relaxed">
                    {JSON.stringify(selectedLog.afterJson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/10 p-5 bg-gray-50 dark:bg-black/30 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl bg-[#1E3D31] px-8 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-all"
              >
                Tutup Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10.2 MODAL: ADD / EDIT EMPLOYEE & MULTI-ROLE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A2620] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-gray-200 dark:border-white/15 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={22} className="text-[#C89B5C]" />
                <span>{editingId !== null ? 'Edit Akun & Peran Ganda (10.2)' : 'Tambah Akun User Baru (10.2)'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rina Kusuma"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              {/* 10.2 Multi-Role RBAC Checkbox Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Peran Ganda (Multi-Role Scope 10.2) <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-400 mb-3">
                  Anda dapat memilih lebih dari satu peran agar staf memiliki hak akses di beberapa modul sekaligus (misal: Kasir + Barista).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = formRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRoleSelection(role)}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all text-left border ${
                          isSelected
                            ? 'bg-[#1E3D31] text-[#C89B5C] border-[#C89B5C] shadow-sm'
                            : 'bg-gray-50 dark:bg-black/30 border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
                        }`}
                      >
                        <span className={`h-4 w-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${isSelected ? 'bg-[#C89B5C] text-[#1E3D31] border-transparent font-extrabold' : 'border-gray-400'}`}>
                          {isSelected && '✓'}
                        </span>
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Cabang Penempatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    <option value="Sudirman Flagship">Sudirman Flagship</option>
                    <option value="Kemang Artisan Bar">Kemang Artisan Bar</option>
                    <option value="Senayan City Lounge">Senayan City Lounge</option>
                    <option value="All Cabang">All Cabang (Multi-Branch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Status Akun <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    <option value="active">Aktif (Dapat Login & Kerja)</option>
                    <option value="inactive">Nonaktif (Diberhentikan / Cut off)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Nomor WhatsApp / Kontak <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1E3D31] px-7 py-2.5 text-xs font-extrabold text-[#C89B5C] hover:bg-[#163026] shadow-md transition-all active:scale-95"
                >
                  ✓ Simpan Akun & Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
