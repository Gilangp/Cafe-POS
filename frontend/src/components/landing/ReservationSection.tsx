"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicService, type PublicSettings } from "@/shared/services/public.service";
import toast from "react-hot-toast";
import { MapPin, Phone, MessageCircle, Calendar, Users, Clock, Loader2 } from "lucide-react";
import Input from "@/components/form/input/InputField";

interface ReservationSectionProps {
  settings: PublicSettings;
}

const initialReservationState = {
  name: "",
  phone: "",
  reservation_date: "",
  reservation_time: "19:00",
  guest_count: 1,
  notes: "",
};

export default function ReservationSection({ settings }: ReservationSectionProps) {
  const queryClient = useQueryClient();
  const [reservationForm, setReservationForm] = useState(initialReservationState);

  const mutation = useMutation({
    mutationFn: publicService.submitReservation,
    onSuccess: () => {
      toast.success("Reservasi Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.");
      setReservationForm(initialReservationState);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Gagal mengirim reservasi.";
      toast.error(errorMsg);
    },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReservationForm({ ...reservationForm, [e.target.name]: e.target.value });
  };

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(reservationForm);
  };

  return (
    <section id="reservation" className="py-24 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Form Reservasi (Takes up 7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary/5 border border-border/50">
            <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
              Pesan Tempat
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              Reservasi Meja
            </h2>
            <p className="text-muted-foreground mb-10 text-sm md:text-base leading-relaxed">
              Pastikan momen ngopi atau pertemuan Anda berjalan lancar tanpa harus menunggu. 
              Isi formulir di bawah ini untuk mengamankan meja Anda.
            </p>
            
            <form onSubmit={handleReservation} className="space-y-6">
              <fieldset disabled={mutation.isPending} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Nama Lengkap</label>
                    <Input 
                      name="name" 
                      type="text" 
                      placeholder="Contoh: Budi Santoso"
                      value={reservationForm.name} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">No. Telepon / WA</label>
                    <Input 
                      name="phone" 
                      type="tel" 
                      placeholder="0812xxxxxxxx"
                      value={reservationForm.phone} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" /> Tanggal
                    </label>
                    <Input 
                      name="reservation_date" 
                      type="date" 
                      value={reservationForm.reservation_date} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" /> Jam
                    </label>
                    <Input 
                      name="reservation_time" 
                      type="time" 
                      value={reservationForm.reservation_time} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" /> Orang
                    </label>
                    <Input 
                      name="guest_count" 
                      type="number" 
                      min="1" 
                      value={reservationForm.guest_count} 
                      onChange={handleFormChange} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Catatan Khusus (Opsional)</label>
                  <textarea 
                    name="notes" 
                    rows={3} 
                    placeholder="Contoh: Ulang tahun, request kursi dekat jendela..."
                    value={reservationForm.notes} 
                    onChange={handleFormChange} 
                    className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-accent focus:ring-accent/10 transition-all resize-none" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={mutation.isPending} 
                  className="w-full bg-accent text-primary font-bold py-4 rounded-xl hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-accent/20"
                >
                  {mutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                  {mutation.isPending ? "Memproses Permintaan..." : "Kirim Request Reservasi"}
                </button>
              </fieldset>
            </form>
          </div>

          {/* Maps & Kontak (Takes up 5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full">
             <div className="bg-primary text-white rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative flex-grow flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                
                <h3 className="font-heading text-2xl font-bold mb-8 relative z-10">Temukan Kami</h3>
                
                <div className="w-full h-48 bg-white/10 rounded-2xl overflow-hidden mb-8 border border-white/10 relative z-10">
                  {settings.maps_embed ? (
                     <iframe src={settings.maps_embed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Google Maps Location" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-black/20">
                        <MapPin className="w-8 h-8 mb-3 opacity-50" />
                        <span className="text-sm font-medium">Peta belum dikonfigurasi</span>
                     </div>
                  )}
                </div>
                
                <div className="space-y-6 relative z-10 mb-10 flex-grow">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                       <Phone className="w-5 h-5 text-accent" />
                     </div>
                     <div>
                       <p className="font-bold text-white text-sm mb-1">Telepon</p>
                       <p className="text-white/70 text-sm">{settings.phone || "Tidak ada telepon"}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                       <MapPin className="w-5 h-5 text-accent" />
                     </div>
                     <div>
                       <p className="font-bold text-white text-sm mb-1">Alamat</p>
                       <p className="text-white/70 text-sm leading-relaxed pr-4">{settings.address || "Alamat belum diatur"}</p>
                     </div>
                  </div>
                </div>

                {/* WhatsApp CTA (FR-09) */}
                <a 
                  href={settings.phone ? `https://wa.me/${settings.phone.replace(/\D/g,'')}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle className="w-6 h-6" />
                  Hubungi via WhatsApp
                </a>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
