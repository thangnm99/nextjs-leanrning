'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    router.push('/login');
  };

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
        <Link href="/" className="text-lg font-semibold hover:opacity-80">
          Home
        </Link>

        {/* User avatar with dropdown */}
        <div className="group relative">
          <Image
            src="/customers/amy-burns.png"
            alt="User avatar"
            width={40}
            height={40}
            className="cursor-pointer rounded-full border-2 border-white hover:border-gray-200"
          />

          {/* Dropdown menu - hiện khi hover */}
          <div className="invisible absolute right-0 top-full mt-1 w-40 rounded-md bg-white py-1 shadow-lg group-hover:visible">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <h1>Hello, Next.js!</h1>
      </main>
    </div>
  );
}
