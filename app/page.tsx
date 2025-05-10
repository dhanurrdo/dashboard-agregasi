'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for auth token in client-side
    const hasAuthToken = document.cookie.includes('auth_token');
    if (!hasAuthToken) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="max-w-[1280px] mx-auto p-8 text-center">
      Start prompting.
    </div>
  );
}