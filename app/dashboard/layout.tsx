import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/app/components/ui/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header user={session.user} />
      <main className="container mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
