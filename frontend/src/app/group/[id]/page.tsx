'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ExpenseForm from '@/components/ExpenseForm';
import BalanceDisplay from '@/components/BalanceDisplay';
import ExpenseList from '@/components/ExpenseList';
import MonthlySummary from '@/components/MonthlySummary';
import ExpenseCharts from '@/components/ExpenseCharts';
import { API_URL } from '@/lib/api';
import type { SummaryData } from '@/types/summary';

interface Group {
  id: string;
  name: string;
  isDemo: boolean;
  persons: Person[];
}

interface Person {
  id: string;
  name: string;
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  type TabId = 'expenses' | 'recorded' | 'summary' | 'charts';
  const [activeTab, setActiveTab] = useState<TabId>('expenses');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    setGroupError(null);
    setExpensesError(null);
    setBalancesError(null);
    loadGroup();
    loadExpenses();
    loadBalances();
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !group) return;
    loadSummary();
  }, [groupId, selectedMonth, group]);

  const loadGroup = async () => {
    setGroupError(null);
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}`);
      if (!response.ok) {
        setLoading(false);
        if (response.status === 404) {
          setGroupError('Group not found');
          setGroup(null);
        } else {
          const data = await response.json().catch(() => ({}));
          setGroupError(data?.error || 'Couldn’t load group. Please try again.');
          setGroup(null);
        }
        return;
      }
      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error('Error loading group:', error);
      setLoading(false);
      setGroupError('Couldn’t load group. Check your connection and try again.');
      setGroup(null);
    }
  };

  const loadExpenses = async () => {
    setExpensesError(null);
    try {
      const response = await fetch(`${API_URL}/expenses/${groupId}`);
      if (!response.ok) {
        setExpensesError('Couldn’t load expenses. Please try again.');
        return;
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpensesError('Couldn’t load expenses. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    setBalancesError(null);
    try {
      const response = await fetch(`${API_URL}/balances/${groupId}`);
      if (!response.ok) {
        setBalancesError('Couldn’t load balances. Please try again.');
        return;
      }
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error('Error loading balances:', error);
      setBalancesError('Couldn’t load balances. Check your connection and try again.');
    }
  };

  const loadSummary = async () => {
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const response = await fetch(`${API_URL}/summary/${groupId}?month=${encodeURIComponent(selectedMonth)}`);
      if (!response.ok) throw new Error('Failed to load summary');
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      setSummaryError('Couldn’t load summary. Please try again.');
      setSummaryData(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const retryAll = () => {
    setLoading(true);
    setGroupError(null);
    setExpensesError(null);
    setBalancesError(null);
    loadGroup();
    loadExpenses();
    loadBalances();
  };

  const handleExpenseAdded = () => {
    loadExpenses();
    loadBalances();
    loadSummary();
  };

  const handleExpenseUpdated = () => {
    loadExpenses();
    loadBalances();
    loadSummary();
  };

  const handleExpenseDeleted = () => {
    loadExpenses();
    loadBalances();
    loadSummary();
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/export/${groupId}?month=${encodeURIComponent(selectedMonth)}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Export failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${selectedMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(error instanceof Error ? error.message : 'Failed to export expenses');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || group.isDemo) {
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${group.name}"?\n\nThis will permanently delete:\n- All expenses\n- All category data\n- All person data\n\nThis action cannot be undone!`;
    
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
      
      // Redirect to homepage after successful deletion
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert(error.message || 'Failed to delete group. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '2rem auto' }} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {groupError || 'Group not found'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {groupError && (
            <button type="button" onClick={retryAll} className="btn btn-primary">
              Retry
            </button>
          )}
          <Link href="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
            {group.name}
            {group.isDemo && (
              <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                DEMO
              </span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link 
              href="/" 
              style={{ 
                fontSize: '0.875rem', 
                color: 'var(--primary)',
                textDecoration: 'underline',
                fontWeight: 500
              }}
            >
              ← Home
            </Link>
            {group.isDemo ? (
              <Link 
                href="/" 
                style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                  fontWeight: 500
                }}
              >
                Create Real Group
              </Link>
            ) : (
              <>
                <Link href="/" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
  New Group
                </Link>
                <button
                  onClick={handleDeleteGroup}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Delete Group
                </button>
              </>
            )}
          </div>
        </div>
        {group.isDemo && (
          <div 
            style={{ 
              padding: '1rem',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              borderRadius: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 500 }}>
              ⚠️ This is demo data. Your changes won't be saved permanently.
            </p>
            <Link 
              href="/" 
              className="btn btn-primary"
              style={{ 
                display: 'inline-block',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem'
              }}
            >
              Create Your Real Group →
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)' }}>
        {(['expenses', 'recorded', 'summary', 'charts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'expenses' && (
        <ExpenseForm
          groupId={groupId}
          persons={group.persons}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {activeTab === 'recorded' && (
        <>
          {expensesError && (
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                border: '1px solid var(--danger)',
                backgroundColor: 'var(--danger-bg)',
              }}
            >
              <p style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{expensesError}</p>
              <button type="button" onClick={loadExpenses} className="btn btn-primary">
                Retry
              </button>
            </div>
          )}
          <ExpenseList
            expenses={expenses}
            persons={group.persons}
            onExpenseUpdated={handleExpenseUpdated}
            onExpenseDeleted={handleExpenseDeleted}
            groupId={groupId}
          />
        </>
      )}

      {activeTab === 'summary' && (
        <MonthlySummary
          groupId={groupId}
          persons={group.persons}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onExport={handleExport}
          summary={summaryData}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
        />
      )}

      {activeTab === 'charts' && (
        <ExpenseCharts
          groupId={groupId}
          persons={group.persons}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          summary={summaryData}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
        />
      )}
    </div>
  );
}


