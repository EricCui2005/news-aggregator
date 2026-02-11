'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hover:from-blue-300 hover:to-blue-500 transition-all duration-300">
          AI News Aggregator
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200 hover:scale-105"
          >
            Settings
          </Link>

          <span className="text-gray-400">
            {user.user_metadata?.full_name || user.email}
          </span>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200 border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
