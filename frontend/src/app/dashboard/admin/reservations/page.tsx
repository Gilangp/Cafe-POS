'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Check,
  X,
  Phone,
  Layout,
  List,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '@/shared/api/axios';

interface TableItem {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
}

interface ReservationItem {
  id: string;
  reservation_code?: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  table_id: string | null;
  table?: TableItem;
  status: 'menunggu_konfirmasi' | 'dikonfirmasi' | 'check_in' | 'ditolak' | 'selesai' | 'dibatalkan';
  notes: string | null;
  created_at: string;
}

const statusStyle: Record<string, string> = {
  dikonfirmasi: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
  menunggu_konfirmasi: 'bg-accent/10 text-accent border-accent/30',
  check_in: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  selesai: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  ditolak: 'bg-muted0/10 text-gray-700 dark:text-muted-foreground border-gray-500/30',
  dibatalkan: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
};

const statusLabel: Record<string, string> = {
  dikonfirmasi: 'Terkonfirmasi',
  menunggu_konfirmasi: 'Menunggu',
  check_in: 'Tamu Duduk',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  dibatalkan: 'Batal',
};

// Tabel statis fallback 
const initialTables = [
  { id: 't1', table_number: 'Meja A1 (Window)', capacity: 2, status: 'available' },
  { id: 't2', table_number: 'Meja A2 (Window VIP)', capacity: 2, status: 'occupied' },
  { id: 't3', table_number: 'Meja B1 (Lounge)', capacity: 4, status: 'available' },
  { id: 't4', table_number: 'Meja B4 (Sofa Lounge)', capacity: 4, status: 'reserved' },
  { id: 't5', table_number: 'Meja C1 (Communal)', capacity: 8, status: 'reserved' },
  { id: 't6', table_number: 'Meja D1 (Garden)', capacity: 4, status: 'available' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [view, setView] = useState<'list' | 'floor' | 'history'>('list');
  const [loading, setLoading] = useState(true);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, resTab] = await Promise.all([
        api.get('/admin/reservations'),
        api.get('/admin/reservations/tables')
      ]);
      if (resRes.data.success) {
        setReservations(resRes.data.data);
      }
      if (resTab.data.success) {
        setTables(resTab.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations or tables:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const [confirmingRes, setConfirmingRes] = useState<ReservationItem | null>(null);
  const [selectedTableInput, setSelectedTableInput] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('15:00');
  const [formGuests, setFormGuests] = useState('2');
  const [formTableId, setFormTableId] = useState(''); // NEW STATE
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (msg: string) => {
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 3800);
  };

  const handleOpenConfirmModal = (res: ReservationItem) => {
    setConfirmingRes(res);
    // Only pre-select a table if it's available
    const availableTables = tables.filter((t) => t.status === 'tersedia' || t.status === 'available');
    setSelectedTableInput(availableTables.find((t) => t.capacity >= res.party_size)?.id || (availableTables[0]?.id || ''));
  };

  const updateStatus = async (id: string, newStatus: string, tableId: string | null = null) => {
    try {
      const payload: any = { status: newStatus };
      if (tableId) payload.table_id = tableId; 

      const res = await api.patch(`/admin/reservations/${id}/status`, payload);
      if (res.data.success) {
        showNotification(`Reservasi diperbarui menjadi ${statusLabel[newStatus] || newStatus}`);
        fetchReservations();
        setConfirmingRes(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal memperbarui status reservasi.');
    }
  };

  const handleApplyConfirmWithTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingRes) return;
    
    const resId = confirmingRes.id;
    const phone = confirmingRes.customer_phone;
    const name = confirmingRes.customer_name;
    const tableId = selectedTableInput;
    const tableName = tables.find((t) => t.id === tableId)?.table_number || 'Sesuai ketersediaan';
    const resCode = confirmingRes.reservation_code || confirmingRes.id;

    // Send update request to server
    await updateStatus(resId, 'dikonfirmasi', tableId);

    // Prepare WhatsApp Message
    let waNumber = phone.replace(/[^0-9]/g, '');
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.slice(1);
    }
    
    const waText = `Halo *${name}*, reservasi Anda di NEMU Space dengan kode *${resCode}* telah kami *KONFIRMASI*.\n\nNomor Meja: *${tableName}*\n\nSilakan tunjukkan pesan ini kepada staf kami saat Anda tiba. Terima kasih!`;
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    
    // Open WA in a new tab
    window.open(waLink, '_blank');
  };

  const handleSaveNewRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        customer_name: formName,
        customer_phone: formPhone,
        reservation_date: formDate,
        reservation_time: formTime,
        party_size: Number(formGuests) || 2,
        notes: formNotes || null
      };

      if (formTableId) {
        payload.table_id = formTableId;
      }

      const res = await api.post('/admin/reservations', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        showNotification(`✓ Reservasi baru untuk "${formName}" berhasil dicatat!`);
        fetchReservations();
        
        // reset form
        setFormName('');
        setFormPhone('');
        setFormNotes('');
      }
    } catch (error) {
      console.error('Failed to save reservation:', error);
      alert('Gagal menyimpan reservasi baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats Counters
  const activeReservations = reservations.filter(r => !['dibatalkan', 'ditolak', 'selesai'].includes(r.status));
  const historyReservations = reservations.filter(r => ['dibatalkan', 'ditolak', 'selesai'].includes(r.status));
  
  const activeCount = activeReservations.reduce((s, r) => s + r.party_size, 0);
  const pendingCount = activeReservations.filter(r => r.status === 'menunggu_konfirmasi').length;
  const availableTables = tables.filter(t => t.status === 'tersedia' || t.status === 'available').length;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-primary dark:text-cream-100 tracking-tight flex items-center gap-3">
            Manajemen Reservasi
          </h1>
          <p className="text-primary/70 dark:text-cream-400 font-medium text-sm md:text-base max-w-lg">
            Kelola antrean reservasi dan alokasi meja dari tamu.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          {/* Top Row: Action Buttons */}
          <div className="flex items-center gap-3">
            <button onClick={fetchReservations} className="p-2.5 rounded-xl border border-border bg-card text-primary/60 hover:text-primary dark:text-cream-400/60 dark:hover:text-cream-100 shadow-sm transition-all" title="Refresh Data">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-accent hover:bg-[#163026] shadow-md transition-all active:scale-95"
            >
              <Plus size={16} className="stroke-[3]" /> Buat Reservasi
            </button>
          </div>
          
          {/* Bottom Row: View Tabs */}
          <div className="flex bg-card rounded-xl p-1 border border-border shadow-sm">
            {(['list', 'floor', 'history'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  view === v ? 'bg-primary text-accent shadow-md' : 'text-muted-foreground/60 hover:text-primary dark:hover:text-cream-100 hover:bg-muted dark:hover:bg-white/5'
                }`}
              >
                {v === 'list' ? <List size={14} /> : v === 'history' ? <Clock size={14} /> : <Layout size={14} />}
                <span className="hidden sm:inline">
                  {v === 'list' ? 'Daftar Antrean' : v === 'history' ? 'Riwayat' : 'Denah Meja'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <div className="flex items-center gap-2.5 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-5 py-3.5 text-sm font-bold text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <Check size={18} className="shrink-0" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Aktif', value: activeReservations.length, icon: CalendarCheck, color: 'text-primary dark:text-cream-100', bg: 'bg-muted dark:bg-white/5' },
          { label: 'Tamu Aktif', value: activeCount, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Menunggu', value: pendingCount, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Meja Tersedia', value: availableTables, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-5 shadow-card-shadow flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-primary dark:text-cream-100 font-heading leading-none">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/50 dark:text-cream-400/50 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {view === 'list' || view === 'history' ? (
        <div className="flex-1 min-h-0 rounded-2xl bg-card border border-border shadow-card-shadow overflow-hidden flex flex-col">
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-sm text-primary dark:text-cream-100">
              <thead className="bg-muted/50 dark:bg-black/20 text-[10px] uppercase tracking-wider text-primary/40 dark:text-cream-400/40 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Tamu & Kontak</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Jadwal Kunjungan</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Jumlah Tamu</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Catatan / Meja</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                  {view === 'list' && <th className="px-6 py-4 font-bold whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={view === 'list' ? 6 : 5} className="px-6 py-10 text-center text-primary/50">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data reservasi...
                    </td>
                  </tr>
                ) : (view === 'list' ? activeReservations : historyReservations).length === 0 ? (
                  <tr>
                    <td colSpan={view === 'list' ? 6 : 5} className="px-6 py-10 text-center text-primary/50 font-bold">
                      {view === 'list' ? 'Belum ada antrean reservasi aktif.' : 'Belum ada riwayat reservasi.'}
                    </td>
                  </tr>
                ) : (view === 'list' ? activeReservations : historyReservations).map((r) => {
                  const rDate = new Date(r.reservation_date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                  // Safely slice the time to remove seconds if any (e.g. 15:00:00 -> 15:00)
                  const rTime = r.reservation_time ? r.reservation_time.slice(0, 5) : '';

                  return (
                  <tr key={r.id} className="hover:bg-muted/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-primary dark:text-cream-100">{r.customer_name}</p>
                      <p className="text-xs text-accent font-medium mt-0.5 flex items-center gap-1">
                        <Phone size={12} /> {r.customer_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-primary dark:text-cream-100">{rDate}</div>
                      <div className="text-primary/50 dark:text-cream-400/50 text-xs font-medium mt-0.5">{rTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-bold text-primary dark:text-cream-100 bg-muted dark:bg-white/5 px-2.5 py-1 rounded-lg w-fit">
                        <Users size={14} className="text-accent" /> {r.party_size} Pax
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate">
                      {r.table ? (
                        <p className="font-bold text-primary dark:text-cream-100">Meja: {r.table.table_number}</p>
                      ) : (
                        <p className="font-bold text-primary/40 dark:text-cream-400/40 italic">Belum dialokasikan</p>
                      )}
                      {r.notes && <p className="text-[11px] text-primary/50 dark:text-cream-400/50 truncate mt-0.5">&ldquo;{r.notes}&rdquo;</p>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold border ${statusStyle[r.status] || ''}`}>
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    {view === 'list' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {r.status === 'menunggu_konfirmasi' && (
                            <>
                              <button
                                onClick={() => handleOpenConfirmModal(r)}
                                className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-[#163026] text-accent px-4 py-2 text-xs font-bold transition-all shadow-sm"
                              >
                                <CheckCircle size={14} /> Konfirmasi
                              </button>
                              <button
                                onClick={() => {
                                  if(confirm('Yakin menolak reservasi ini?')) updateStatus(r.id, 'ditolak');
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-primary dark:text-cream-100 px-3 py-2 text-xs font-bold transition-all"
                              >
                                <X size={14} /> Tolak
                              </button>
                            </>
                          )}
                          {r.status === 'dikonfirmasi' && (
                            <>
                              <button
                                onClick={() => updateStatus(r.id, 'check_in')}
                                className="flex items-center gap-1.5 rounded-lg bg-accent hover:bg-[#b88c4d] text-primary px-4 py-2 text-xs font-bold transition-all shadow-sm"
                              >
                                <Check size={14} /> Tamu Datang (Check-In)
                              </button>
                              <button
                                onClick={() => {
                                  if(confirm('Tamu tidak datang (No Show)?')) updateStatus(r.id, 'dibatalkan');
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 px-3 py-2 text-xs font-bold transition-all"
                              >
                                <XCircle size={14} /> Batal (No-Show)
                              </button>
                            </>
                          )}
                          {r.status === 'check_in' && (
                            <button
                              onClick={() => {
                                if(confirm('Pelanggan telah meninggalkan meja (Check-out)? Meja ini akan otomatis menjadi Tersedia kembali.')) updateStatus(r.id, 'selesai');
                              }}
                              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
                            >
                              <Check size={14} /> Selesai / Check-Out
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tables.map((table) => (
              <div key={table.id} className={`rounded-2xl border-2 p-6 text-center transition-all bg-card flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden shadow-card-shadow ${
                table.status === 'tersedia' || table.status === 'available' ? 'border-green-200 dark:border-green-500/30' :
                table.status === 'terisi' || table.status === 'occupied' ? 'border-red-200 dark:border-red-500/30' :
                'border-accent/30'
              }`}>
                {(table.status !== 'tersedia' && table.status !== 'available') && (
                  <div className={`absolute top-0 left-0 w-full h-1 ${table.status === 'terisi' || table.status === 'occupied' ? 'bg-red-500' : 'bg-accent'}`} />
                )}
                <p className="font-heading text-lg font-extrabold text-primary dark:text-cream-100 mb-1">{table.table_number}</p>
                <p className="text-xs font-medium text-muted-foreground/60 mb-4 flex items-center gap-1">
                  <Users size={12} className="text-accent" /> {table.capacity} Kursi
                </p>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                  table.status === 'tersedia' || table.status === 'available' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' : 
                  table.status === 'terisi' || table.status === 'occupied' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' : 
                  'bg-accent/10 text-accent border-accent/30'
                }`}>
                  {table.status === 'tersedia' || table.status === 'available' ? 'Tersedia' : table.status === 'terisi' || table.status === 'occupied' ? 'Terisi / Duduk' : 'Reserved'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PORTAL MODALS */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* CONFIRMATION MODAL */}
          {confirmingRes && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="font-heading text-lg font-bold text-primary dark:text-cream-100 flex items-center gap-2">
                    <CheckCircle size={20} className="text-accent" />
                    <span>Konfirmasi Alokasi Meja</span>
                  </h3>
                  <button onClick={() => setConfirmingRes(null)} className="rounded-lg p-1.5 text-primary/40 dark:text-cream-100/40 hover:bg-muted dark:hover:bg-white/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="rounded-xl bg-muted dark:bg-white/5 p-4 text-sm space-y-2 border border-border">
                  <p className="font-bold text-primary dark:text-cream-100">{confirmingRes.customer_name}</p>
                  <div className="flex justify-between items-center text-primary/70 dark:text-cream-400/70">
                    <span>Jadwal:</span>
                    <strong className="text-accent font-mono">{new Date(confirmingRes.reservation_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ({confirmingRes.reservation_time?.slice(0,5)})</strong>
                  </div>
                  <div className="flex justify-between items-center text-primary/70 dark:text-cream-400/70">
                    <span>Jumlah Tamu:</span>
                    <strong className="text-primary dark:text-cream-100">{confirmingRes.party_size} Orang</strong>
                  </div>
                  {confirmingRes.notes && (
                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="text-xs text-primary/50 dark:text-cream-400/50 italic">&ldquo;{confirmingRes.notes}&rdquo;</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleApplyConfirmWithTable} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
                      Pilih Nomor Meja <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedTableInput}
                      onChange={(e) => setSelectedTableInput(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-4 py-3 text-sm font-bold focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                    >
                      {tables.filter(t => t.status === 'tersedia' || t.status === 'available').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.table_number} ({t.capacity} Pax)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setConfirmingRes(null)}
                      className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold text-muted-foreground/60 hover:bg-muted dark:hover:bg-white/10 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-accent shadow-md hover:bg-[#163026] transition-all"
                    >
                      Simpan Konfirmasi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* NEW RESERVATION MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="font-heading text-lg font-bold text-primary dark:text-cream-100 flex items-center gap-2">
                    <CalendarCheck size={20} className="text-accent" />
                    <span>Buat Reservasi Baru</span>
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-primary/40 dark:text-cream-100/40 hover:bg-muted dark:hover:bg-white/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveNewRes} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        Nama Tamu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-4 py-2.5 text-sm font-bold focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        No. HP/WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="0811-XXXX-XXXX"
                        className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-4 py-2.5 text-sm font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        Tanggal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-3 py-2.5 text-sm font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        Jam <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-3 py-2.5 text-sm font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                        Jumlah (Pax) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formGuests}
                        onChange={(e) => setFormGuests(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-3 py-2.5 text-sm font-bold font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                      Alokasi Meja (Opsional)
                    </label>
                    <select
                      value={formTableId}
                      onChange={(e) => setFormTableId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-4 py-3 text-sm font-bold focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-primary dark:text-cream-100"
                    >
                      <option value="">-- Biarkan Kosong (Belum Dialokasikan) --</option>
                      {tables.filter(t => t.status === 'tersedia' || t.status === 'available').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.table_number} ({t.capacity} Pax)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                      Catatan Tambahan
                    </label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Misal: minta kursi bayi, surprise ultah..."
                      className="w-full rounded-xl border border-border bg-white dark:bg-black/20 px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all resize-none text-primary dark:text-cream-100"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold text-muted-foreground/60 hover:bg-muted dark:hover:bg-white/10 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-accent shadow-md hover:bg-[#163026] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Simpan Reservasi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
}
