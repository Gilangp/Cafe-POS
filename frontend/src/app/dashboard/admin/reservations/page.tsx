'use client';

import { useState } from 'react';
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Check,
  X,
  MapPin,
  Utensils,
  Phone,
  AlertCircle,
  Layout,
  List,
} from 'lucide-react';

interface ReservationItem {
  id: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  notes: string;
  area: string;
}

const initialReservations: ReservationItem[] = [
  { id: 1, name: 'Dr. Nadia Putri', phone: '0811-2233-4455', date: '17 Jul 2026', time: '14.00 WIB', guests: 2, table: 'Meja A2 (Window VIP)', status: 'confirmed', notes: 'Anniversary coffee session, request dekat jendela', area: 'Indoor VIP Barista' },
  { id: 2, name: 'Budi Santoso', phone: '0812-3456-7890', date: '17 Jul 2026', time: '16.30 WIB', guests: 4, table: 'Meja B4 (Sofa Lounge)', status: 'confirmed', notes: 'Meeting dengan tim roastery', area: 'Sofa Lounge Indoor' },
  { id: 3, name: 'Hendra Saputra & Tim', phone: '0813-9988-7766', date: '18 Jul 2026', time: '10.00 WIB', guests: 6, table: 'Meja C1 (Communal Table)', status: 'pending', notes: 'Work meeting, butuh colokan listrik & HDMI', area: 'Communal Table' },
  { id: 4, name: 'Rina Mahardika', phone: '0815-6677-8899', date: '18 Jul 2026', time: '15.00 WIB', guests: 3, table: 'Belum dialokasikan', status: 'pending', notes: 'Slow-bar manual brew experience', area: 'Slow-Bar Area' },
  { id: 5, name: 'Sari Wulandari', phone: '0819-0011-2233', date: '16 Jul 2026', time: '19.00 WIB', guests: 2, table: 'Meja A1', status: 'completed', notes: 'Selesai check-in & makan', area: 'Indoor VIP Barista' },
];

const initialTables = [
  { id: 1, name: 'Meja A1 (Window)', capacity: 2, status: 'available', area: 'Indoor VIP Barista' },
  { id: 2, name: 'Meja A2 (Window VIP)', capacity: 2, status: 'occupied', area: 'Indoor VIP Barista' },
  { id: 3, name: 'Meja B1 (Lounge)', capacity: 4, status: 'available', area: 'Sofa Lounge Indoor' },
  { id: 4, name: 'Meja B4 (Sofa Lounge)', capacity: 4, status: 'reserved', area: 'Sofa Lounge Indoor' },
  { id: 5, name: 'Meja C1 (Communal Table)', capacity: 8, status: 'reserved', area: 'Communal Table' },
  { id: 6, name: 'Meja D1 (Garden Terrace)', capacity: 4, status: 'available', area: 'Outdoor Garden' },
  { id: 7, name: 'Meja D2 (Garden Terrace)', capacity: 6, status: 'available', area: 'Outdoor Garden' },
  { id: 8, name: 'Private Roastery Room VIP', capacity: 12, status: 'available', area: 'Private Room' },
];

const tableStatusStyle: Record<string, string> = {
  available: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
  occupied: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400',
  reserved: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
};

const statusStyle: Record<string, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
  completed: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30',
  rejected: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border border-gray-500/30 line-through',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const statusLabel: Record<string, string> = {
  confirmed: 'Terkonfirmasi',
  pending: 'Menunggu Konfirmasi',
  completed: 'Selesai / Check-in',
  rejected: 'Ditolak (Full)',
  cancelled: 'Dibatalkan Tamu',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>(initialReservations);
  const [tables, setTables] = useState(initialTables);
  const [view, setView] = useState<'list' | 'floor'>('list');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // 9.3 Table Allocation Modal State (on Confirm)
  const [confirmingRes, setConfirmingRes] = useState<ReservationItem | null>(null);
  const [selectedTableInput, setSelectedTableInput] = useState('');

  // 9.3 New Reservation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDate, setFormDate] = useState('2026-07-18');
  const [formTime, setFormTime] = useState('15.00 WIB');
  const [formGuests, setFormGuests] = useState('4');
  const [formArea, setFormArea] = useState('Indoor VIP Barista');
  const [formNotes, setFormNotes] = useState('');

  const active = reservations.filter((r) => !['cancelled', 'rejected'].includes(r.status));

  const showNotification = (msg: string) => {
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 3800);
  };

  const handleOpenConfirmModal = (res: ReservationItem) => {
    setConfirmingRes(res);
    setSelectedTableInput(tables.find((t) => t.capacity >= res.guests && t.status === 'available')?.name || tables[0].name);
  };

  const handleApplyConfirmWithTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingRes) return;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === confirmingRes.id
          ? { ...r, status: 'confirmed', table: selectedTableInput }
          : r
      )
    );
    // Mark table as reserved
    setTables((prev) =>
      prev.map((t) => (t.name === selectedTableInput ? { ...t, status: 'reserved' } : t))
    );

    showNotification(`✓ Reservasi atas nama "${confirmingRes.name}" terkonfirmasi & dialokasikan ke ${selectedTableInput}!`);
    setConfirmingRes(null);
  };

  const updateStatus = (id: number, newStatus: ReservationItem['status']) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          showNotification(`Status reservasi "${r.name}" diubah menjadi ${statusLabel[newStatus]}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const handleSaveNewRes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const newRes: ReservationItem = {
      id: Date.now(),
      name: formName,
      phone: formPhone,
      date: formDate,
      time: formTime,
      guests: Number(formGuests) || 2,
      table: 'Belum dialokasikan (Pending 9.3)',
      status: 'pending',
      notes: formNotes || 'Reservasi input manual admin',
      area: formArea,
    };

    setReservations((prev) => [newRes, ...prev]);
    setIsModalOpen(false);
    showNotification(`✓ Reservasi antrean baru untuk "${formName}" berhasil dicatat!`);
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Manajemen Reservasi & Alokasi Meja (9.3)
            </h1>
            <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
              Phase 9.3 Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Daftar antrean reservasi masuk dengan pilihan aksi cepat: Konfirmasi (+ Pilih Nomor Meja), Tolak, Check-In / Selesai, atau Batal.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/30 p-1">
            {(['list', 'floor'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  view === v ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {v === 'list' ? <List size={14} /> : <Layout size={14} />}
                <span>{v === 'list' ? 'Daftar Antrean (9.3)' : 'Denah Alokasi Meja'}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus size={16} /> Buat Reservasi Baru
          </button>
        </div>
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Reservasi Masuk', value: reservations.length, icon: CalendarCheck, color: 'bg-[#1E3D31] text-[#C89B5C]' },
          { label: 'Tamu Reservasi Aktif', value: active.reduce((s, r) => s + r.guests, 0), icon: Users, color: 'bg-blue-600 text-white' },
          { label: 'Menunggu Alokasi Meja', value: reservations.filter((r) => r.status === 'pending').length, icon: Clock, color: 'bg-amber-600 text-white' },
          { label: 'Meja Roastery Tersedia', value: tables.filter((t) => t.status === 'available').length, icon: CheckCircle, color: 'bg-emerald-600 text-white' },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${s.color} shadow-sm`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {view === 'list' ? (
        <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-black/30 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                  <th className="px-6 py-4">Tamu & Kontak</th>
                  <th className="px-6 py-4">Jadwal Kunjungan</th>
                  <th className="px-6 py-4">Jumlah Tamu</th>
                  <th className="px-6 py-4">Alokasi Meja / Area</th>
                  <th className="px-6 py-4">Catatan Khusus</th>
                  <th className="px-6 py-4">Status (9.3)</th>
                  <th className="px-6 py-4">Aksi Cepat (9.3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</p>
                      <p className="text-xs text-[#C89B5C] font-mono mt-0.5 flex items-center gap-1">
                        <Phone size={11} /> {r.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                      <div>{r.date}</div>
                      <div className="text-gray-400 text-[11px] font-mono">{r.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-full w-fit font-mono">
                        <Users size={13} className="text-[#C89B5C]" /> {r.guests} Pax
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{r.table}</p>
                      <p className="text-[11px] text-gray-400">{r.area}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{r.notes || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusStyle[r.status]}`}>
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 9.3 Action Choices */}
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenConfirmModal(r)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 font-bold shadow-sm transition-all active:scale-95"
                              title="Konfirmasi & Pilih Meja"
                            >
                              <CheckCircle size={13} />
                              <span>Konfirmasi (+ Pilih Meja)</span>
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, 'rejected')}
                              className="flex items-center gap-1 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 font-bold transition-all"
                              title="Tolak Reservasi (Penuh)"
                            >
                              <X size={13} />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}

                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(r.id, 'completed')}
                            className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 font-bold shadow-sm transition-all"
                          >
                            <Check size={13} />
                            <span>Check-In / Selesai</span>
                          </button>
                        )}

                        {!['completed', 'cancelled', 'rejected'].includes(r.status) && (
                          <button
                            onClick={() => updateStatus(r.id, 'cancelled')}
                            className="flex items-center gap-1 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 font-bold transition-all"
                            title="Batal"
                          >
                            <XCircle size={13} />
                            <span>Batal</span>
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
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout size={19} className="text-[#C89B5C]" />
            <span>Denah Meja & Status Alokasi — Flagship Roastery</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tables.map((table) => (
              <div key={table.id} className={`rounded-3xl border-2 p-6 text-center transition-all shadow-sm ${tableStatusStyle[table.status]}`}>
                <p className="font-heading text-lg font-extrabold text-gray-900 dark:text-white">{table.name}</p>
                <p className="text-xs mt-1 font-semibold text-gray-500 dark:text-gray-400">
                  <Users size={12} className="inline mr-1 text-[#C89B5C]" />
                  {table.capacity} Kursi · {table.area}
                </p>
                <span className="mt-4 inline-block rounded-full px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/80 dark:bg-black/40 shadow-sm border border-current">
                  {table.status === 'available' ? '✓ Tersedia' : table.status === 'occupied' ? '🔥 Terisi / Check-In' : '📌 Reservasi Terkonfirmasi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9.3 MODAL: KONFIRMASI + PILIH NOMOR MEJA */}
      {confirmingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-500" />
                <span>Konfirmasi & Pilih Meja (9.3)</span>
              </h3>
              <button onClick={() => setConfirmingRes(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/40 p-4 text-xs space-y-1.5 border border-[#C89B5C]/30">
              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{confirmingRes.name}</p>
              <p className="text-gray-600 dark:text-gray-300">Jadwal: <strong className="text-[#C89B5C] font-mono">{confirmingRes.date} ({confirmingRes.time})</strong></p>
              <p className="text-gray-600 dark:text-gray-300">Jumlah Tamu: <strong className="text-gray-900 dark:text-white">{confirmingRes.guests} Orang (Pax)</strong></p>
              {confirmingRes.notes && <p className="text-gray-500 italic mt-1">&ldquo;{confirmingRes.notes}&rdquo;</p>}
            </div>

            <form onSubmit={handleApplyConfirmWithTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  Alokasikan Nomor Meja <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedTableInput}
                  onChange={(e) => setSelectedTableInput(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3.5 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} — Kapasitas {t.capacity} Kursi [{t.status === 'available' ? 'Tersedia' : 'Terpakai/Reserved'}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Sistem otomatis mengarahkan meja dengan kapasitas yang memenuhi atau melebihi jumlah tamu.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setConfirmingRes(null)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-extrabold shadow-md transition-all active:scale-95"
                >
                  ✓ Konfirmasi & Simpan Alokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9.3 MODAL: BUAT RESERVASI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarCheck size={20} className="text-[#C89B5C]" />
                <span>Catat Reservasi Tamu Baru (9.3)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewRes} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Nama Tamu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Dr. Nadia Putri"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    No. WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0811-2233-4455"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Waktu (Jam)
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Jumlah Tamu
                  </label>
                  <input
                    type="number"
                    value={formGuests}
                    onChange={(e) => setFormGuests(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Area Preferensi
                </label>
                <select
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                >
                  <option value="Indoor VIP Barista">Indoor VIP Barista</option>
                  <option value="Sofa Lounge Indoor">Sofa Lounge Indoor</option>
                  <option value="Communal Table">Communal Table</option>
                  <option value="Outdoor Garden">Outdoor Garden Terrace</option>
                  <option value="Private Room">Private Roastery Room</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Permintaan kursi bayi, ulang tahun, dekat jendela..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-[#C89B5C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1E3D31] px-7 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
                >
                  Simpan Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
