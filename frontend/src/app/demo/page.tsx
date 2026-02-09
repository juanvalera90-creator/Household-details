'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL } from '@/lib/api';
const DEMO_GROUP_ID = 'demo-group-id';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Initialize demo group if it doesn't exist
    const initDemo = async () => {
      try {
        // Check if demo group exists
        const response = await fetch(`${API_URL}/groups/${DEMO_GROUP_ID}`);
        if (response.ok) {
          router.push(`/group/${DEMO_GROUP_ID}`);
        } else {
          // Create demo group
          await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: DEMO_GROUP_ID,
              name: 'Demo Household',
              isDemo: true,
              person1Name: 'Demo Person A',
              person2Name: 'Demo Person B',
            }),
          });
          router.push(`/group/${DEMO_GROUP_ID}`);
        }
      } catch (error) {
        console.error('Error initializing demo:', error);
      }
    };

    initDemo();
  }, [router]);

  return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '2rem auto' }} />
      <p>Loading demo...</p>
    </div>
  );
}


