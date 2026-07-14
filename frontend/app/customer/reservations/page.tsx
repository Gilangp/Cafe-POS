import { redirect } from 'next/navigation';

export default function CustomerReservationsRedirect() {
  redirect('/account?tab=reservations');
}
