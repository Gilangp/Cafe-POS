import { redirect } from 'next/navigation';

export default function CustomerOrdersRedirect() {
  redirect('/account?tab=orders');
}
