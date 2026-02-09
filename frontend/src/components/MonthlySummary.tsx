'use client';

import BalanceDisplay from '@/components/BalanceDisplay';
import { formatCurrency } from '@/lib/format';
import type { SummaryData } from '@/types/summary';

interface Person {
  id: string;
  name: string;
}

interface MonthlySummaryProps {
  groupId: string;
  persons: Person[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onExport: () => void;
  summary: SummaryData | null;
  summaryLoading: boolean;
  summaryError: string | null;
}

export default function MonthlySummary({
  selectedMonth,
  onMonthChange,
  onExport,
  summary,
  summaryLoading,
  summaryError,
}: MonthlySummaryProps) {
  if (summaryLoading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '2rem auto' }} />
        <p>Loading summary...</p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="card" style={{ border: '1px solid var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
        <p style={{ color: 'var(--text-primary)' }}>{summaryError}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card">
        <p>No data available{selectedMonth === 'all' ? '.' : ' for this month.'}</p>
      </div>
    );
  }

  const isAllMonths = summary.month === 'all';
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Balance title for selected period
  const balanceTitle = isAllMonths
    ? 'Overall Balance'
    : (() => {
        const [y, m] = summary.month.split('-');
        const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
        return `Balance for ${date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;
      })();

  const periodBalances = {
    person1: { id: summary.person1.id, name: summary.person1.name, balance: summary.person1.balance },
    person2: { id: summary.person2.id, name: summary.person2.name, balance: summary.person2.balance },
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <BalanceDisplay balances={periodBalances} title={balanceTitle} />
      </div>
      {/* Period Selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {isAllMonths && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Showing all recorded expenses (all time).
          </p>
        )}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="period">
            Period
          </label>
          <select
            id="period"
            className="form-select"
            value={selectedMonth === 'all' ? 'all' : 'specific'}
            onChange={(e) => {
              if (e.target.value === 'all') {
                onMonthChange('all');
              } else {
                onMonthChange(selectedMonth === 'all' ? currentMonthValue : selectedMonth);
              }
            }}
          >
            <option value="all">All months</option>
            <option value="specific">Specific month</option>
          </select>
        </div>
        {selectedMonth !== 'all' && (
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="month">
              Select Month
            </label>
            <input
              id="month"
              type="month"
              className="form-input"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        )}
        <button onClick={onExport} className="btn btn-outline">
          Export CSV
        </button>
      </div>

      {/* Total Spending */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          {isAllMonths ? 'Total Spending (All Time)' : 'Total Spending'}
        </h2>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
          ${formatCurrency(summary.totalSpending)}
        </div>
      </div>

      {/* Person Totals */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Who Paid What</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{summary.person1.name}:</span>
            <span style={{ fontWeight: 600 }}>${formatCurrency(summary.person1.totalPaid)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{summary.person2.name}:</span>
            <span style={{ fontWeight: 600 }}>${formatCurrency(summary.person2.totalPaid)}</span>
          </div>
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          marginTop: '0.75rem',
        }}>
          <strong>{isAllMonths ? 'Overall Balance:' : 'Monthly Balance:'}</strong> {summary.person1.balance > 0
            ? `${summary.person2.name} owes $${formatCurrency(Math.abs(summary.person2.balance))} to ${summary.person1.name}`
            : summary.person2.balance > 0
            ? `${summary.person1.name} owes $${formatCurrency(Math.abs(summary.person1.balance))} to ${summary.person2.name}`
            : 'All balanced'}
        </div>
      </div>

      {/* Main Category Totals */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>By Main Category</h2>
        {summary.mainCategoryTotals.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No expenses in this category</p>
        ) : (
          <div>
            {summary.mainCategoryTotals.map((cat) => (
              <div
                key={cat.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span>{cat.name}</span>
                <span style={{ fontWeight: 600 }}>${formatCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subcategory Totals */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>By Subcategory</h2>
        {summary.subCategoryTotals.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No expenses in this category</p>
        ) : (
          <div>
            {summary.subCategoryTotals.map((subCat) => (
              <div
                key={subCat.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{subCat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subCat.mainCategory}</div>
                </div>
                <span style={{ fontWeight: 600 }}>${formatCurrency(subCat.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


