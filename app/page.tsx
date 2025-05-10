import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Home() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.has('auth_token');

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      Start prompting.
    </div>
  );
}