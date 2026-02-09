'use client';

import { useState, useCallback } from 'react';
import ExpenseEditForm from './ExpenseEditForm';
import { API_URL } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

interface Person {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  note?: string;
  paidBy: string;
  person: Person;
  subCategory: {
    id: string;
    name: string;
    mainCategory: {
      id: string;
      name: string;
    };
  };
}

interface ExpenseListProps {
  expenses: Expense[];
  persons: Person[];
  onExpenseUpdated: () => void;
  onExpenseDeleted: () => void;
  groupId: string;
}

export default function ExpenseList({
  expenses,
  persons,
  onExpenseUpdated,
  onExpenseDeleted,
  groupId,
}: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>(''); // '' = All months
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const toggleMonth = useCallback((monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsedMonths(new Set()), []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onExpenseDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter by month if a filter is selected
  const filteredExpenses = monthFilter
    ? expenses.filter((e) => e.date.substring(0, 7) === monthFilter)
    : expenses;

  // Group expenses by month (YYYY-MM)
  const expensesByMonth = filteredExpenses.reduce<Record<string, Expense[]>>((acc, expense) => {
    const month = expense.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(expense);
    return acc;
  }, {});

  // Sort months descending (most recent first)
  const sortedMonths = Object.keys(expensesByMonth).sort((a, b) => b.localeCompare(a));

  const collapseAll = () => setCollapsedMonths(new Set(sortedMonths));

  // All unique months from full list (for filter dropdown)
  const allMonths = Object.keys(
    expenses.reduce<Record<string, boolean>>((acc, e) => {
      acc[e.date.substring(0, 7)] = true;
      return acc;
    }, {})
  ).sort((a, b) => b.localeCompare(a));

  // Sort expenses within each month (newest first)
  sortedMonths.forEach((month) => {
    expensesByMonth[month].sort((a, b) => b.date.localeCompare(a.date));
  });

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (expenses.length === 0) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recorded expenses yet. Add your first expense in the Expenses tab!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Month filter + expand/collapse */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="recorded-month-filter">
          Filter by month
        </label>
        <select
          id="recorded-month-filter"
          className="form-select"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{ maxWidth: '100%', marginBottom: '0.75rem' }}
        >
          <option value="">All months</option>
          {allMonths.map((monthKey) => (
            <option key={monthKey} value={monthKey}>
              {formatMonthLabel(monthKey)}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={expandAll}
            className="btn btn-outline"
            style={{ fontSize: '0.875rem', padding: '0.35rem 0.75rem' }}
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="btn btn-outline"
            style={{ fontSize: '0.875rem', padding: '0.35rem 0.75rem' }}
          >
            Collapse all
          </button>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            {monthFilter ? `No expenses in ${formatMonthLabel(monthFilter)}.` : 'No recorded expenses yet.'}
          </p>
        </div>
      ) : (
      <>
      {sortedMonths.map((monthKey) => {
        const isCollapsed = collapsedMonths.has(monthKey);
        const monthTotal = expensesByMonth[monthKey].reduce((sum, e) => sum + e.amount, 0);
        const expenseCount = expensesByMonth[monthKey].length;
        return (
        <div key={monthKey} style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => toggleMonth(monthKey)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.125rem' }} aria-hidden>{isCollapsed ? '▶' : '▼'}</span>
              <span style={{ fontWeight: 600 }}>{formatMonthLabel(monthKey)}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                (${formatCurrency(monthTotal)} · {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'})
              </span>
            </span>
          </button>
          {!isCollapsed && (
          <div style={{ marginTop: '1rem', paddingLeft: '0.25rem' }}>
          {expensesByMonth[monthKey].map((expense) => (
        <div key={expense.id} className="card" style={{ marginBottom: '1rem' }}>
          {editingId === expense.id ? (
            <ExpenseEditForm
              expense={expense}
              persons={persons}
              groupId={groupId}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                onExpenseUpdated();
              }}
            />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                    ${formatCurrency(expense.amount)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {expense.subCategory.mainCategory.name} → {expense.subCategory.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Paid by {expense.person.name} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                  {expense.note && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{expense.note}"
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setEditingId(expense.id)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  disabled={deletingId === expense.id}
                >
                  {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
          ))}
          </div>
          )}
        </div>
      );
      })}
      </>
      )}
    </div>
  );
}


