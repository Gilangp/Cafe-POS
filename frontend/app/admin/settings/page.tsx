'use client';

import { useState } from 'react';
import { Settings, Users, Shield, Bell, Globe, Palette, Key, Building2, Save } from 'lucide-react';

const settingsMenu = [
  { key: 'general', label: 'Umum', icon: Settings },
  { key: 'brand', label: 'Branding', icon: Palette },
  { key: 'roles', label: 'Roles & Akses', icon: Shield },
  { key: 'notifications', label: 'Notifikasi', icon: Bell },
  { key: 'integrations', label: 'Integrasi API', icon: Globe },
  { key: 'api', label: 'API Keys', icon: Key },
];

const roles = [
  { name: 'Super Admin', slug: 'super-admin', users: 1, system: true, description: 'Akses penuh ke seluruh sistem' },
  { name: 'Branch Manager', slug: 'branch-manager', users: 3, system: true, description: 'Kontrol operasional satu/beberapa cabang' },
  { name: 'Barista / Cashier', slug: 'cashier', users: 8, system: true, description: 'Akses POS, order, dan KDS' },
  { name: 'Kitchen Staff', slug: 'kitchen', users: 5, system: true, description: 'Akses KDS tiket dapur saja' },
  { name: 'Inventory Officer', slug: 'inventory', users: 2, system: true, description: 'Manajemen stok, supplier, purchase order' },
  { name: 'Marketing Manager', slug: 'marketing', users: 2, system: true, description: 'CMS, promosi, media, dan konten' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [brandName, setBrandName] = useState('Velvra');
  const [tagline, setTagline] = useState('Premium Coffee Experience');
  const [currency, setCurrency] = useState('IDR');
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-gray-800">Pengaturan Sistem</h1>

      <div className="flex gap-6">
        {/* Settings Sidebar */}
        <div className="w-52 shrink-0 space-y-1">
          {settingsMenu.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-left transition-all ${activeTab === item.key ? 'bg-[#12100E] text-[#BA935D]' : 'text-gray-600 hover:bg-gray-100'}`}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-serif text-xl font-bold text-gray-800">Pengaturan Umum</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { label: 'Nama Brand', value: brandName, setter: setBrandName },
                  { label: 'Tagline', value: tagline, setter: setTagline },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{f.label}</label>
                    <input value={f.value} onChange={e => f.setter(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Mata Uang</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none">
                    <option value="IDR">IDR — Rupiah Indonesia</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="SGD">SGD — Singapore Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Zona Waktu</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none">
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB UTC+7)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA UTC+8)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT UTC+9)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[#12100E] text-[#BA935D] hover:bg-[#1e1a17]'}`}>
                <Save size={15} />
                {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
              </button>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-serif text-xl font-bold text-gray-800">Roles & Akses</h2>
                <span className="text-xs text-gray-400">{roles.length} roles terdefinisi</span>
              </div>
              <div className="divide-y divide-gray-50">
                {roles.map(role => (
                  <div key={role.slug} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#BA935D]/10 border border-[#BA935D]/20">
                        <Shield size={16} className="text-[#BA935D]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-800">{role.name}</h3>
                          {role.system && <span className="text-[10px] font-bold rounded-full bg-gray-100 text-gray-400 px-2 py-0.5">System</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={12} /> {role.users} pengguna
                      </span>
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                        Kelola
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">Integrasi API</h2>
              {[
                { name: 'Supabase (Database)', status: 'connected', color: 'text-green-600', note: 'db.meqhmynwsxeajhumrnqw.supabase.co' },
                { name: 'Midtrans (Payment Gateway)', status: 'not configured', color: 'text-gray-400', note: 'Belum dikonfigurasi' },
                { name: 'Resend (Email Service)', status: 'not configured', color: 'text-gray-400', note: 'Belum dikonfigurasi' },
                { name: 'Google Maps API', status: 'not configured', color: 'text-gray-400', note: 'Belum dikonfigurasi' },
                { name: 'Cloudflare R2 (Storage)', status: 'not configured', color: 'text-gray-400', note: 'Belum dikonfigurasi' },
              ].map(integ => (
                <div key={integ.name} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{integ.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{integ.note}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${integ.color}`}>
                      {integ.status === 'connected' ? '● Terhubung' : '○ Belum aktif'}
                    </span>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                      Konfigurasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!['general', 'roles', 'integrations'].includes(activeTab) && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
              <Settings size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">Pengaturan ini akan segera tersedia</p>
              <p className="text-xs text-gray-300 mt-1">Coming soon in next phase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
