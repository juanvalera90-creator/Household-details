'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  isDemo: boolean;
  persons: Person[];
  createdAt: string;
}

interface Person {
  id: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [person1Name, setPerson1Name] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingGroups, setExistingGroups] = useState<Group[]>([]);
  const [showExistingGroups, setShowExistingGroups] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    loadExistingGroups();
  }, []);

  const loadExistingGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch(`${API_URL}/groups`);
      if (response.ok) {
        const groups = await response.json();
        setExistingGroups(groups);
        // Auto-expand if there are groups
        if (groups.length > 0) {
          setShowExistingGroups(true);
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          isDemo: false,
          person1Name,
          person2Name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const group = await response.json();
      router.push(`/group/${group.id}`);
    } catch (err) {
      setError('Failed to create group. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const handleDeleteGroup = async (groupId: string, groupName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the group selection

    const confirmMessage = `Are you sure you want to delete "${groupName}"?\n\nThis will permanently delete:\n- All expenses\n- All category data\n- All person data\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to parse JSON error, but handle HTML responses
        let errorMessage = 'Failed to delete group';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use default message
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Reload groups list
      await loadExistingGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.message || 'Failed to delete group. Please try again.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 className="text-center">Household Expenses</h1>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Track and split expenses for your household
        </p>

        {/* Existing Groups Section */}
        {existingGroups.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Your Groups</h2>
              <button
                onClick={() => setShowExistingGroups(!showExistingGroups)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'underline',
                }}
              >
                {showExistingGroups ? 'Hide' : 'Show'} ({existingGroups.length})
              </button>
            </div>
            
            {showExistingGroups && (
              <div>
                {loadingGroups ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </div>
                ) : (
                  <div>
                    {existingGroups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => handleSelectGroup(group.id)}
                        style={{
                          padding: '1rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.5rem',
                          marginBottom: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: 'var(--card-bg)',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                              {group.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              {group.persons.map(p => p.name).join(' & ')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Created {new Date(group.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              marginLeft: '0.5rem',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Delete group"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCreateForm ? '1.5rem' : 0 }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Create New Group</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline',
              }}
            >
              {showCreateForm ? 'Hide' : 'Show'}
            </button>
          </div>

          {showCreateForm && (
            <>
              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: 'var(--danger-bg)', 
                  color: 'var(--danger)', 
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateGroup}>
                <div className="form-group">
                  <label className="form-label" htmlFor="groupName">
                    Group Name
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    className="form-input"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Our Home"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="person1Name">
                    Person 1 Name
                  </label>
                  <input
                    id="person1Name"
                    type="text"
                    className="form-input"
                    value={person1Name}
                    onChange={(e) => setPerson1Name(e.target.value)}
                    placeholder="e.g., Ana"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="person2Name">
                    Person 2 Name
                  </label>
                  <input
                    id="person2Name"
                    type="text"
                    className="form-input"
                    value={person2Name}
                    onChange={(e) => setPerson2Name(e.target.value)}
                    placeholder="e.g., Juan"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : 'Create Group'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            href="/demo"
            style={{
              color: 'var(--primary)',
              textDecoration: 'underline',
              fontSize: '0.875rem',
            }}
          >
            Try Demo Mode →
          </Link>
        </div>
      </div>
    </div>
  );
}


