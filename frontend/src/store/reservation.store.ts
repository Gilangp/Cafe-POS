import { create } from 'zustand';

interface ReservationState {
  selectedDate: string | null;
  selectedTime: string | null;
  guestCount: number;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setGuestCount: (count: number) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedDate: null,
  selectedTime: null,
  guestCount: 2,
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  setGuestCount: (count) => set({ guestCount: count }),
  reset: () => set({ selectedDate: null, selectedTime: null, guestCount: 2 }),
}));
