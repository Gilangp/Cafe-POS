'use client';

import { useState } from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Briefcase, Heart, Award, MapPin, Clock, CheckCircle2, Send, ChevronRight, UserCheck } from 'lucide-react';

interface JobVacancy {
  id: string;
  title: string;
  branch: string;
  type: 'Full-Time' | 'Part-Time';
  department: string;
  requirements: string[];
}

const VACANCIES: JobVacancy[] = [
  {
    id: 'VAC-01',
    title: 'Senior Specialty Barista & Sensory Specialist',
    branch: 'Sudirman Flagship Lounge',
    type: 'Full-Time',
    department: 'Beverage & Bar',
    requirements: [
      'Minimal 2 tahun pengalaman di roastery atau coffee shop specialty grade',
      'Menguasai teknik penyeduhan manual brew (V60, Aeropress, Syphon) & kalibrasi espresso',
      'Memiliki sertifikasi SCA Sensory / Barista Skills menjadi nilai plus besar',
      'Memiliki kemampuan komunikasi interpersonal dan ramah kepada customer slow-bar',
    ],
  },
  {
    id: 'VAC-02',
    title: 'Assistant Store Operational Manager',
    branch: 'Kemang Artisan Roastery Bar',
    type: 'Full-Time',
    department: 'Operations & Management',
    requirements: [
      'Pengalaman minimal 3 tahun mengelola tim F&B atau restoran berkelas',
      'Familiar dengan sistem POS, KDS digital, dan inventory audit stock-take',
      'Memiliki jiwa kepemimpinan yang tegas serta orientasi kepuasan pelanggan',
    ],
  },
  {
    id: 'VAC-03',
    title: 'Quality Control Roaster & Profiling Officer',
    branch: 'Sudirman Roastery Facility',
    type: 'Full-Time',
    department: 'Roasting & QC',
    requirements: [
      'Memahami software Cropster / Artisan Roasting secara mendalam',
      'Mampu melakukan sample roasting, cupping scoring Q-Grader, & moisture testing',
      'Konsisten menjaga profil sangrai single origin nusantara sesuai standar Velvra',
    ],
  },
  {
    id: 'VAC-04',
    title: 'Part-Time Barista & Hospitality Crew',
    branch: 'Senayan City Executive Lounge',
    type: 'Part-Time',
    department: 'Beverage & Bar',
    requirements: [
      'Mahasiswa tingkat akhir atau fresh graduate yang bersemangat di industri kopi',
      'Bersedia bekerja shift saat akhir pekan (Sabtu-Minggu) & hari libur nasional',
      'Cepat tanggap, bersih, rapi, serta mampu berkoordinasi dengan tim kasir/dapur',
    ],
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(VACANCIES[0]);
  const [appliedStatus, setAppliedStatus] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedStatus(true);
    setTimeout(() => {
      setAppliedStatus(false);
      setApplicantName('');
      setApplicantEmail('');
    }, 4500);
  };

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Bergabung Bersama Tim Velvra (`GET /api/v1/pages/careers`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Bangun Karir Kopi Kelas Dunia</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Kami mencari individu yang memiliki passion sejati terhadap keharuman kopi, keramaian slow-bar, serta dedikasi untuk tumbuh bersama roastery nusantara terbaik.
          </p>
        </div>
      </section>

      {/* Why Join Us Benefits */}
      <section className="py-16 bg-[#FAF6F0] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Keuntungan Menjadi Keluarga Velvra</h2>
            <p className="text-xs sm:text-sm text-gray-500">Kami menjunjung standar fair trade bagi petani maupun kesejahteraan tim internal.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <Award size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Sertifikasi SCA Paid</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kami mendanai ujian sertifikasi SCA Barista & Sensory bagi karyawan tetap yang telah berkarya minimal 1 tahun.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <Heart size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Asuransi Kesehatan Lengkap</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Jaminan BPJS Kesehatan & Ketenagakerjaan ditambah asuransi rawat inap/jalan swasta untuk Anda & keluarga.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Free Daily Brew & Pastry</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nikmati 2 cangkir specialty coffee bebas pilih dan croissant panggang segar setiap shift kerja Anda berlangsung.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12100E] text-[#BA935D]">
                <UserCheck size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Jenjang Karir Transparan</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Promosi internal terbuka luas dari Junior Barista menuju Senior Barista, Head Bar, hingga Branch Manager.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vacancy Listings & Application Form */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Job List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Lowongan Terbuka ({VACANCIES.length})</h2>
            <div className="space-y-4">
              {VACANCIES.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedJob(v)}
                  className={`rounded-3xl border-2 p-6 transition-all cursor-pointer ${
                    selectedJob?.id === v.id
                      ? 'bg-white border-[#BA935D] shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="rounded-full bg-[#12100E] text-[#BA935D] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {v.department}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600">
                          {v.type}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-gray-800">{v.title}</h3>
                      <p className="text-xs font-semibold text-[#BA935D] flex items-center gap-1 mt-1">
                        <MapPin size={13} /> {v.branch}
                      </p>
                    </div>

                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      selectedJob?.id === v.id ? 'bg-[#BA935D] text-[#12100E]' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Persyaratan Utama:</p>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600 list-disc list-inside">
                      {v.requirements.slice(0, 2).map((req, i) => (
                        <li key={i} className="truncate">{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Application Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-md sticky top-24 space-y-6">
              {selectedJob ? (
                <>
                  <div className="border-b border-gray-100 pb-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BA935D]">Formulir Lamaran Langsung</span>
                    <h3 className="font-serif text-xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <p className="text-xs text-gray-500">{selectedJob.branch} ({selectedJob.type})</p>
                  </div>

                  {appliedStatus ? (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-6 text-center space-y-3 animate-in fade-in">
                      <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-emerald-900">Lamaran Berhasil Dikirim!</h4>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Terima kasih telah melamar untuk posisi <b>{selectedJob.title}</b>. Tim HR Velvra akan meninjau portofolio Anda dan menghubungi melalui email/WhatsApp dalam 3-5 hari kerja.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                          required
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Contoh: Fajar Nugraha"
                          className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Alamat E-mail Aktif</label>
                        <input
                          required
                          type="email"
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="fajar.nugraha@example.com"
                          className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                        <input
                          required
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tautan Portofolio / LinkedIn / CV (PDF URL)</label>
                        <input
                          required
                          type="url"
                          placeholder="https://linkedin.com/in/..."
                          className="min-h-[44px] w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Pesan Singkat Untuk HR</label>
                        <textarea
                          rows={3}
                          placeholder="Ceritakan singkat mengapa Anda bersemangat bergabung dengan Velvra..."
                          className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[#BA935D] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="min-h-[48px] w-full rounded-2xl bg-[#12100E] text-[#BA935D] font-bold text-xs uppercase tracking-wider hover:bg-[#201d19] transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Kirim Lamaran Sekarang</span>
                        <Send size={15} />
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-gray-400">Pilih salah satu lowongan di sebelah kiri untuk melamar.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
