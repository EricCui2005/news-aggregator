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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-gray-800">
          AI News Aggregator
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Settings
          </Link>

          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-gray-700">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
