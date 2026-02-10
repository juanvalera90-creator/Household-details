'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_URL } from '@/lib/api';

/** Fixed UUID for the demo group (backend requires UUID when id is provided). */
const DEMO_GROUP_ID = '00000000-0000-4000-a000-000000000001';

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDemo = async () => {
      try {
        const response = await fetch(`${API_URL}/groups/${DEMO_GROUP_ID}`);
        if (response.ok) {
          router.push(`/group/${DEMO_GROUP_ID}`);
          return;
        }
        const createRes = await fetch(`${API_URL}/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: DEMO_GROUP_ID,
            name: 'Demo Household',
            isDemo: true,
            person1Name: 'Demo Person A',
            person2Name: 'Demo Person B',
          }),
        });
        if (!createRes.ok) {
          const data = await createRes.json().catch(() => ({}));
          setError(data?.error || `Failed to load demo (${createRes.status})`);
          return;
        }
        router.push(`/group/${DEMO_GROUP_ID}`);
      } catch (err) {
        console.error('Error initializing demo:', err);
        setError('Cannot reach server. Check that the API is running and CORS is allowed.');
      }
    };

    initDemo();
  }, [router]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
          <Link href="/" className="btn btn-primary">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '2rem auto' }} />
      <p>Loading demo...</p>
    </div>
  );
}


